
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./page.module.css";

import { getAvatarUrl } from "@/entities/user/api/profile";
import { CategorySelect } from "@/shared/ui/CategorySelect/CategorySelect";

import type {
  ItemCategory,
  ItemCondition,
} from "@/entities/item";

import {
  CATEGORY_OPTIONS,
  ITEM_CATEGORY_LABELS,
  ITEM_CONDITION_LABELS,
  getSubcategoryOptions,
} from "@/entities/item";

type Transfer = "exchange" | "free";
type Category = ItemCategory;
type Condition = ItemCondition;

type SavedUser = {
  id?: string;
  name?: string;
  city?: string;
  photo?: string;
  email?: string;
  about?: string;
};

type Ad = {
  id: number;
  title: string;
  description: string;
  transfer: Transfer;
  category: Category;
  subcategory: string;
  condition: Condition;
  city: string;
  photo?: string;
};

const categoryLabels = ITEM_CATEGORY_LABELS;
const conditionLabels = ITEM_CONDITION_LABELS;

const initialAds: Ad[] = [
  {
    id: 1,
    title: "Заголовок объявления",
    description:
      "Описание объявления. Вещь в хорошем состоянии, готова к передаче новому владельцу.",
    transfer: "exchange",
    category: "shoes",
    subcategory: "Демисезонная",
    condition: "good",
    city: "Екатеринбург",
  },
  {
    id: 2,
    title: "Верхняя одежда",
    description:
      "Теплая и удобная вещь. Бережно использовалась, без заметных дефектов.",
    transfer: "free",
    category: "clothing",
    subcategory: "Верхняя одежда",
    condition: "excellent",
    city: "Екатеринбург",
  },
  {
    id: 3,
    title: "Детские вещи",
    description:
      "Детская одежда, которая больше не подходит по размеру. Ищет нового владельца.",
    transfer: "exchange",
    category: "kids",
    subcategory: "Детская одежда",
    condition: "new",
    city: "Екатеринбург",
  },
  {
    id: 4,
    title: "Сумка на каждый день",
    description: "Практичная сумка. Есть небольшие следы использования.",
    transfer: "free",
    category: "accessories",
    subcategory: "Сумки и рюкзаки",
    condition: "good",
    city: "Екатеринбург",
  },
  {
    id: 5,
    title: "Постельное белье",
    description: "Комплект домашнего текстиля в отличном состоянии.",
    transfer: "exchange",
    category: "home_textile",
    subcategory: "Постельное белье",
    condition: "excellent",
    city: "Екатеринбург",
  },
  {
    id: 6,
    title: "Летняя обувь",
    description: "Легкая обувь для теплой погоды.",
    transfer: "free",
    category: "shoes",
    subcategory: "Летняя",
    condition: "needs_repair",
    city: "Екатеринбург",
  },
];

export default function PublicUserPage() {
  const params = useParams<{ id: string }>();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [user, setUser] = useState<SavedUser | null>(null);

  const [transfer, setTransfer] = useState<Transfer[]>([]);
  const [category, setCategory] = useState<Category | "">("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const transferRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const readUser = () => {
      try {
        const raw = localStorage.getItem("dobry-shkaf-user");
        setUser(raw ? (JSON.parse(raw) as SavedUser) : null);
      } catch {
        setUser(null);
      }
    };

    readUser();

    window.addEventListener("storage", readUser);
    window.addEventListener("dobry-shkaf-user-updated", readUser);

    return () => {
      window.removeEventListener("storage", readUser);
      window.removeEventListener("dobry-shkaf-user-updated", readUser);
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (!filterRef.current?.contains(target)) {
        setFilterOpen(false);
      }

      if (!transferRef.current?.contains(target)) {
        setTransferOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFilterOpen(false);
        setTransferOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const subcategoryOptions = useMemo(
    () => (category ? getSubcategoryOptions(category) : []),
    [category],
  );

  const ads = useMemo(() => {
    return initialAds.filter((ad) => {
      const matchesTransfer =
        transfer.length === 0 || transfer.includes(ad.transfer);

      const matchesCategory =
        !category || ad.category === category;

      const adSubcategory = subcategoryOptions.find(
        (option) =>
          option.value === ad.subcategory ||
          option.label === ad.subcategory,
      );

      const matchesSubcategory =
        subcategories.length === 0 ||
        (adSubcategory !== undefined &&
          subcategories.includes(adSubcategory.value));

      const matchesCondition =
        conditions.length === 0 ||
        conditions.includes(ad.condition);

      return (
        matchesTransfer &&
        matchesCategory &&
        matchesSubcategory &&
        matchesCondition
      );
    });
  }, [
    transfer,
    category,
    subcategories,
    conditions,
    subcategoryOptions,
  ]);

  function toggleValue<T extends string>(
    value: T,
    values: T[],
    setter: (next: T[]) => void,
  ) {
    setter(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  function resetFilters() {
    setTransfer([]);
    setCategory("");
    setSubcategories([]);
    setConditions([]);
  }

  const profileName = user?.name || "Имя Пользователя";
  const profileCity = user?.city || "Местоположение";

  return (
    <main className={styles.page}>
      <section className={styles.profile}>
        <div className={styles.userCard}>
          {user?.photo ? (
            <img
              className={styles.avatar}
              src={getAvatarUrl(user.photo)}
              alt={`Фото пользователя ${profileName}`}
            />
          ) : (
            <div
              className={styles.avatarFallback}
              aria-hidden="true"
            >
              {profileName.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className={styles.userInfo}>
            <h1>{profileName}</h1>
            <p className={styles.city}>{profileCity}</p>

            {user?.about && (
              <p className={styles.about}>{user.about}</p>
            )}
          </div>

          <Link
            href={`/messages?user=${encodeURIComponent(userId)}`}
            className={styles.messageButton}
          >
            Написать
          </Link>
        </div>

        <div className={styles.impact}>
          <strong>
            13<span>ед</span>
          </strong>
          <span>спасено</span>
        </div>
      </section>

      <section className={styles.adsSection}>
        <div className={styles.sectionHeading}>
          <h2>Объявления</h2>

          <div className={styles.filterWrap} ref={filterRef}>
            <button
              type="button"
              className={styles.filterTrigger}
              aria-expanded={filterOpen}
              aria-haspopup="true"
              onClick={() => {
                setFilterOpen((open) => !open);
                setTransferOpen(false);
              }}
            >
              Фильтрация
              <img src="/filter.svg" alt="" />
            </button>

            {filterOpen && (
              <aside
                className={styles.filterPanel}
                aria-label="Фильтры объявлений"
              >
                <div className={styles.filterHeading}>
                  Тип передачи
                </div>

                {(["exchange", "free"] as Transfer[]).map((value) => (
                  <label
                    className={styles.checkRow}
                    key={value}
                  >
                    <input
                      type="checkbox"
                      checked={transfer.includes(value)}
                      onChange={() =>
                        toggleValue(value, transfer, setTransfer)
                      }
                    />

                    <span className={styles.customCheckbox}>
                      <img src="/checkbox.svg" alt="" />
                    </span>

                    <span>
                      {value === "exchange" ? "Обмен" : "Бесплатно"}
                    </span>
                  </label>
                ))}

                <div className={styles.filterHeading}>
                  Категория
                </div>

                <CategorySelect<Category>
                  value={category}
                  options={CATEGORY_OPTIONS.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  placeholder="Все категории"
                  onChange={(value) => {
                    setCategory(value);
                    setSubcategories([]);
                  }}
                />

                {subcategoryOptions.map((item) => (
                  <label
                    className={styles.checkRow}
                    key={item.value}
                  >
                    <input
                      type="checkbox"
                      checked={subcategories.includes(item.value)}
                      onChange={() =>
                        toggleValue(
                          item.value,
                          subcategories,
                          setSubcategories,
                        )
                      }
                    />

                    <span className={styles.customCheckbox}>
                      <img src="/checkbox.svg" alt="" />
                    </span>

                    <span>{item.label}</span>
                  </label>
                ))}

                <div className={styles.filterHeading}>
                  Состояние
                </div>

                {(Object.keys(conditionLabels) as Condition[]).map(
                  (key) => (
                    <label
                      className={styles.checkRow}
                      key={key}
                    >
                      <input
                        type="checkbox"
                        checked={conditions.includes(key)}
                        onChange={() =>
                          toggleValue(key, conditions, setConditions)
                        }
                      />

                      <span className={styles.customCheckbox}>
                        <img src="/checkbox.svg" alt="" />
                      </span>

                      <span>{conditionLabels[key]}</span>
                    </label>
                  ),
                )}

                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={resetFilters}
                >
                  Сбросить фильтры
                </button>
              </aside>
            )}
          </div>
        </div>

        <div className={styles.toolbar}>
          <span className={styles.resultCount}>
            Найдено: {ads.length}
          </span>
        </div>

        <div className={styles.cards}>
          {ads.map((ad) => (
            <article
              className={styles.adCard}
              key={ad.id}
            >
              <div className={styles.photoArea}>
                {ad.photo ? (
                  <img
                    src={ad.photo}
                    alt={ad.title}
                    className={styles.itemPhoto}
                  />
                ) : (
                  <div className={styles.photoPlaceholder} />
                )}

                <div className={styles.dots} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3>{ad.title}</h3>

                <p className={styles.description}>
                  {ad.description}
                </p>

                <span
                  className={styles.locationPin}
                  title={ad.city}
                >
                  <img src="/location.svg" alt="" />
                  {ad.city}
                </span>

                <div className={styles.tags}>
                  <span className={styles.darkTag}>
                    {ad.transfer === "exchange" ? "Обмен" : "Бесплатно"}
                  </span>

                  <span>{categoryLabels[ad.category]}</span>
                  <span>{ad.subcategory}</span>
                  <span>{conditionLabels[ad.condition]}</span>
                </div>
              </div>
            </article>
          ))}

          {ads.length === 0 && (
            <div className={styles.emptyState}>
              По выбранным фильтрам объявлений нет.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
