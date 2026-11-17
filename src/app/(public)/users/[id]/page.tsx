
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { capitalizeFirstLetter } from "@/shared/lib/capitalizeFirstLetter";
import styles from "./page.module.css";

import {
  getAvatarUrl,
  getProfileErrorMessage,
  getPublicUser,
  type PublicUserProfile,
} from "@/entities/user/api/profile";
import { fetchUserListings } from "@/entities/item";
import type { Item } from "@/entities/item";
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
  subcategoryLabel,
} from "@/entities/item";

type Transfer = "exchange" | "free";
type Category = ItemCategory;
type Condition = ItemCondition;

const categoryLabels = ITEM_CATEGORY_LABELS;
const conditionLabels = ITEM_CONDITION_LABELS;

export default function PublicUserPage() {
  const params = useParams<{ id: string }>();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [user, setUser] = useState<PublicUserProfile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [transfer, setTransfer] = useState<Transfer[]>([]);
  const [category, setCategory] = useState<Category | "">("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const transferRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      setError("Не удалось определить пользователя.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const profile = await getPublicUser(userId);
        if (cancelled) return;
        setUser(profile);

        try {
          const result = await fetchUserListings(userId, 1, 100);
          if (!cancelled) setItems(result.items);
        } catch {
          if (!cancelled) {
            setItems([]);
            setError("Профиль загружен, но объявления получить не удалось.");
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setUser(null);
          setItems([]);
          setError(getProfileErrorMessage(requestError));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

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
    return items.filter((item) => {
      const matchesTransfer =
        transfer.length === 0 ||
        (item.transferType !== "to_organization" &&
          transfer.includes(item.transferType));
      const matchesCategory = !category || item.category === category;
      const matchesSubcategory =
        subcategories.length === 0 ||
        (item.subcategory !== undefined &&
          subcategories.includes(item.subcategory));
      const matchesCondition =
        conditions.length === 0 || conditions.includes(item.condition);

      return (
        item.status === "published" &&
        matchesTransfer &&
        matchesCategory &&
        matchesSubcategory &&
        matchesCondition
      );
    });
  }, [items, transfer, category, subcategories, conditions]);

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

  const profileName = user?.name || "Пользователь";
  const profileCity = user?.city || "Город не указан";

  return (
    <main className={styles.page}>
      <section className={styles.profile}>
        <div className={styles.userCard}>
          {user?.avatar_url ? (
            <img
              className={styles.avatar}
              src={getAvatarUrl(user.avatar_url)}
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
            {user?.items_saved ?? 0}<span>ед</span>
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

        {loading ? (
          <div className={styles.emptyState}>Загружаем профиль и объявления...</div>
        ) : error ? (
          <div className={styles.emptyState} role="alert">{error}</div>
        ) : (
          <div className={styles.cards}>
          {ads.map((ad) => (
            <Link
              href={`/catalog/${ad.id}`}
              className={styles.adCard}
              key={ad.id}
            >
              <div className={styles.photoArea}>
                {ad.coverUrl ? (
                  <img
                    src={ad.coverUrl}
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
                <h3>{capitalizeFirstLetter(ad.title)}</h3>

                <p className={styles.description}>
                  {capitalizeFirstLetter(ad.description)}
                </p>

                <span
                  className={styles.locationPin}
                  title={ad.city}
                >
                  <img src="/location.svg" alt="" />
                  {ad.city || "Город не указан"}
                </span>

                <div className={styles.tags}>
                  <span className={styles.darkTag}>
                    {ad.transferType === "exchange" ? "Обмен" : "Бесплатно"}
                  </span>

                  <span>{categoryLabels[ad.category]}</span>
                  {ad.subcategory && (
                    <span>{subcategoryLabel(ad.category, ad.subcategory)}</span>
                  )}
                  <span>{conditionLabels[ad.condition]}</span>
                </div>
              </div>
            </Link>
          ))}

          {ads.length === 0 && (
            <div className={styles.emptyState}>
              {items.length === 0
                ? "У пользователя пока нет опубликованных объявлений."
                : "По выбранным фильтрам объявлений нет."}
            </div>
          )}
          </div>
        )}
      </section>
    </main>
  );
}
