"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import { getAvatarUrl } from "@/entities/user/api/profile";

type Transfer = "exchange" | "free";
type Condition = "new" | "excellent" | "good" | "needs_repair";
type Category =
  | "clothing"
  | "shoes"
  | "accessories"
  | "home_textile"
  | "kids"
  | "other";

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

const categoryLabels: Record<Category, string> = {
  clothing: "Одежда",
  shoes: "Обувь",
  accessories: "Аксессуары",
  home_textile: "Домашний текстиль",
  kids: "Детские вещи",
  other: "Другое",
};

const conditionLabels: Record<Condition, string> = {
  new: "Новое",
  excellent: "Отличное",
  good: "Хорошее",
  needs_repair: "Требует ремонта",
};

const categorySubcategories: Record<Category, string[]> = {
  clothing: [
    "Верхняя одежда",
    "Футболки и топы",
    "Рубашки и блузки",
    "Свитеры и толстовки",
    "Брюки и джинсы",
    "Платья и юбки",
    "Спортивная одежда",
    "Домашняя одежда",
  ],
  shoes: ["Демисезонная", "Спортивная", "Зимняя", "Летняя"],
  accessories: [
    "Сумки и рюкзаки",
    "Головные уборы",
    "Шарфы и перчатки",
    "Ремни",
  ],
  home_textile: [
    "Постельное белье",
    "Полотенца",
    "Пледы и одеяла",
    "Шторы",
  ],
  kids: [
    "Детская одежда",
    "Детская обувь",
    "Одежда для новорожденных",
    "Игрушки",
    "Детские книги",
    "Товары для ухода за ребенком",
    "Детский текстиль",
  ],
  other: ["Другое"],
};

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
      const target = event.target as Node;

      if (filterRef.current && !filterRef.current.contains(target)) {
        setFilterOpen(false);
      }

      if (transferRef.current && !transferRef.current.contains(target)) {
        setTransferOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const ads = useMemo(() => {
    return initialAds.filter((ad) => {
      const matchesTransfer =
        transfer.length === 0 || transfer.includes(ad.transfer);

      const matchesCategory = !category || ad.category === category;

      const matchesSubcategory =
        subcategories.length === 0 ||
        subcategories.includes(ad.subcategory);

      const matchesCondition =
        conditions.length === 0 || conditions.includes(ad.condition);

      return (
        matchesTransfer &&
        matchesCategory &&
        matchesSubcategory &&
        matchesCondition
      );
    });
  }, [transfer, category, subcategories, conditions]);

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
              src={getAvatarUrl(user.photo ?? null)}
              alt={`Фото пользователя ${profileName}`}
            />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {profileName.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className={styles.userInfo}>
            <h1>{profileName}</h1>
            <p className={styles.city}>{profileCity}</p>

            {user?.about && <p className={styles.about}>{user.about}</p>}
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
              onClick={() => {
                setFilterOpen((open) => !open);
                setTransferOpen(false);
              }}
            >
              Фильтрация
              <img src="/filter.svg" alt="" />
            </button>

            {filterOpen && (
              <aside className={styles.filterPanel}>
                <div className={styles.filterHeading}>Тип передачи</div>

                {(["exchange", "free"] as Transfer[]).map((value) => (
                  <label className={styles.checkRow} key={value}>
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

                <div className={styles.filterHeading}>Категория</div>

                <select
                  className={styles.select}
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value as Category | "");
                    setSubcategories([]);
                  }}
                >
                  <option value="">Все категории</option>
                  {(Object.keys(categoryLabels) as Category[]).map((key) => (
                    <option key={key} value={key}>
                      {categoryLabels[key]}
                    </option>
                  ))}
                </select>

                {category &&
                  categorySubcategories[category].map((value) => (
                    <label className={styles.checkRow} key={value}>
                      <input
                        type="checkbox"
                        checked={subcategories.includes(value)}
                        onChange={() =>
                          toggleValue(
                            value,
                            subcategories,
                            setSubcategories,
                          )
                        }
                      />
                      <span className={styles.customCheckbox}>
                        <img src="/checkbox.svg" alt="" />
                      </span>
                      <span>{value}</span>
                    </label>
                  ))}

                <div className={styles.filterHeading}>Состояние</div>

                {(Object.keys(conditionLabels) as Condition[]).map((key) => (
                  <label className={styles.checkRow} key={key}>
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
                ))}

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
          <div className={styles.transferWrap} ref={transferRef}>
            <button
              type="button"
              className={styles.transferTrigger}
              aria-expanded={transferOpen}
              onClick={() => {
                setTransferOpen((open) => !open);
                setFilterOpen(false);
              }}
            >
              {transfer.length === 0
                ? "Все объявления"
                : transfer.length === 1
                  ? transfer[0] === "exchange"
                    ? "Обмен"
                    : "Бесплатно"
                  : "Все объявления"}

              <img
                src="/strelka.svg"
                alt=""
                className={`${styles.arrow} ${
                  transferOpen ? styles.arrowOpen : ""
                }`}
              />
            </button>

            {transferOpen && (
              <div className={styles.transferMenu}>
                <button
                  type="button"
                  onClick={() => {
                    setTransfer([]);
                    setTransferOpen(false);
                  }}
                >
                  Все объявления
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTransfer(["exchange"]);
                    setTransferOpen(false);
                  }}
                >
                  Обмен
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTransfer(["free"]);
                    setTransferOpen(false);
                  }}
                >
                  Бесплатно
                </button>
              </div>
            )}
          </div>

          <span className={styles.resultCount}>
            Найдено: {ads.length}
          </span>
        </div>

        <div className={styles.cards}>
          {ads.map((ad) => (
            <article className={styles.adCard} key={ad.id}>
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
                <p className={styles.description}>{ad.description}</p>
                
                <span className={styles.locationPin} title={ad.city}>
                        <img src='/location.svg' alt="" />
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