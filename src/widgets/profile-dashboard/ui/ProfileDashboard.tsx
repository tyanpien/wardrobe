"use client";
import { CategorySelect } from "@/shared/ui/CategorySelect/CategorySelect";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ProfileDashboard.module.css";
import {
  getAvatarUrl,
  getMyProfile,
  getProfileErrorMessage,
} from "@/entities/user/api/profile";

type Transfer = "exchange" | "free";
type Status = "published" | "in_transfer" | "transferred" | "unpublished";

type Category =
  | "clothing"
  | "shoes"
  | "accessories"
  | "home_textile"
  | "kids"
  | "other";

type Condition = "new" | "excellent" | "good" | "needs_repair";

type Ad = {
  id: number;
  title: string;
  description: string;
  transfer: Transfer;
  category: Category;
  subcategory: string;
  condition: Condition;
  status: Status;
  city: string;
  photo?: string;
};

type ProfileData = {
  name: string;
  city: string;
  photo: string;
  about: string;
};

const categoryLabels: Record<Category, string> = {
  clothing: "Одежда",
  shoes: "Обувь",
  accessories: "Аксессуары",
  home_textile: "Домашний текстиль",
  kids: "Детские вещи",
  other: "Другое",
};

const subcategories: Record<Category, string[]> = {
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

const statusLabels: Record<Status, string> = {
  published: "Опубликовано",
  in_transfer: "В процессе передачи",
  transferred: "Передано",
  unpublished: "Снято с публикации",
};

const conditionLabels: Record<Condition, string> = {
  new: "Новое",
  excellent: "Отличное",
  good: "Хорошее",
  needs_repair: "Требует ремонта",
};

const initialAds: Ad[] = [
  {
    id: 1,
    title: "Заголовок объявления",
    description:
      "Описание объявленияОписание объявления Описание объявления Описание объявления",
    transfer: "exchange",
    category: "shoes",
    subcategory: "Демисезонная",
    condition: "good",
    status: "in_transfer",
    city: "Екатеринбург",
  },
  {
    id: 2,
    title: "Заголовок объявления",
    description:
      "Описание объявленияОписание объявления Описание объявления Описание объявления",
    transfer: "free",
    category: "clothing",
    subcategory: "Верхняя одежда",
    condition: "excellent",
    status: "published",
    city: "Екатеринбург",
  },
  {
    id: 3,
    title: "Заголовок объявления",
    description:
      "Описание объявленияОписание объявления Описание объявления Описание объявления",
    transfer: "exchange",
    category: "kids",
    subcategory: "Детская одежда",
    condition: "new",
    status: "unpublished",
    city: "Екатеринбург",
  },
  {
    id: 4,
    title: "Пальто",
    description: "Теплое пальто, аккуратное состояние.",
    transfer: "free",
    category: "clothing",
    subcategory: "Верхняя одежда",
    condition: "good",
    status: "transferred",
    city: "Екатеринбург",
  },
];

export function ProfileDashboard() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "Имя Пользователя",
    city: "Местоположение",
    photo: "",
    about: "",
  });

  const [profileError, setProfileError] = useState("");
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const filterWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function readProfile() {
      try {
        const saved = await getMyProfile();

        if (cancelled) return;

        setProfile({
          name: saved.name ?? "",
          city: saved.city ?? "",
          photo: getAvatarUrl(saved.avatar_url),
          about: saved.about ?? "",
        });

        setProfileError("");
      } catch (error) {
        if (!cancelled) {
          setProfileError(getProfileErrorMessage(error));
        }
      }
    }

    function handleProfileUpdated() {
      void readProfile();
    }

    void readProfile();

    window.addEventListener("focus", handleProfileUpdated);
    window.addEventListener(
      "dobry-shkaf-user-updated",
      handleProfileUpdated,
    );

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleProfileUpdated);
      window.removeEventListener(
        "dobry-shkaf-user-updated",
        handleProfileUpdated,
      );
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!statusFilterRef.current?.contains(target)) {
        setStatusOpen(false);
      }

      if (!filterWrapRef.current?.contains(target)) {
        setFilterOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setStatusOpen(false);
        setFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const [activeAdMenu, setActiveAdMenu] = useState<number | null>(null);
  const [tab, setTab] = useState<"ads" | "history" | "volunteer">("ads");
  const [status, setStatus] = useState<Status | "">("");
  const [transfer, setTransfer] = useState<Transfer[]>(["exchange", "free"]);
  const [category, setCategory] = useState<Category | "">("shoes");
  const [subcategory, setSubcategory] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([
    "new",
    "excellent",
    "good",
    "needs_repair",
  ]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const ads = useMemo(
    () =>
      initialAds.filter(
        (ad) =>
          (!status || ad.status === status) &&
          (transfer.length === 0 || transfer.includes(ad.transfer)) &&
          (!category || ad.category === category) &&
          (subcategory.length === 0 ||
            subcategory.includes(ad.subcategory)) &&
          (conditions.length === 0 ||
            conditions.includes(ad.condition)) &&
          (tab !== "history" || ad.status === "transferred") &&
          (tab !== "ads" || ad.status !== "transferred"),
      ),
    [status, transfer, category, subcategory, conditions, tab],
  );

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
    setStatus("");
    setTransfer(["exchange", "free"]);
    setCategory("");
    setSubcategory([]);
    setConditions(["new", "excellent", "good", "needs_repair"]);
  }

  function selectStatus(nextStatus: Status | "") {
    setStatus(nextStatus);
    setStatusOpen(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.top}>
        <div className={styles.userCard}>
          {profile.photo ? (
            <img className={styles.avatar} src={profile.photo} alt="" />
          ) : (
            <div className={styles.avatar} aria-hidden="true" />
          )}

          <div className={styles.userInfo}>
            <h1>{profile.name || "Имя Пользователя"}</h1>
            <p>{profile.city || "Местоположение"}</p>
          </div>

          <Link href="/profile/edit" className={styles.editButton}>
            Редактировать профиль
          </Link>
        </div>

        <div className={styles.impact}>
          <strong>
            13<span>ед</span>
          </strong>
          <span>спасено</span>
        </div>
      </section>

      {profileError && (
        <p role="alert">{profileError}</p>
      )}

      <nav className={styles.tabs} aria-label="Разделы профиля">
        <button
          type="button"
          className={tab === "ads" ? styles.activeTab : ""}
          onClick={() => setTab("ads")}
        >
          Мои объявления
        </button>

        <button
          type="button"
          className={tab === "history" ? styles.activeTab : ""}
          onClick={() => setTab("history")}
        >
          История обмена
        </button>

        <button
          type="button"
          className={tab === "volunteer" ? styles.activeTab : ""}
          onClick={() => setTab("volunteer")}
        >
          Волонтерство
        </button>

        <span className={styles.tabSpacer} />

        <Link href="/my-items" className={styles.createButton}>
          Создать объявление
        </Link>
      </nav>

      {tab === "volunteer" ? (
        <div className={styles.emptyPanel}>Раздел волонтерства</div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div
              className={styles.statusFilterWrap}
              ref={statusFilterRef}
            >
              <button
                type="button"
                className={styles.statusTrigger}
                onClick={() => {
                  setStatusOpen((open) => !open);
                  setFilterOpen(false);
                }}
                aria-expanded={statusOpen}
                aria-haspopup="true"
              >
                <span className={styles.statusTriggerText}>
                  {status ? statusLabels[status] : "Все объявления"}
                </span>

                <img
                  src="/strelka.svg"
                  alt=""
                  className={`${styles.statusArrow} ${
                    statusOpen ? styles.statusArrowOpen : ""
                  }`}
                />
              </button>

              {statusOpen && (
                <div className={styles.statusMenu}>
                  <button
                    type="button"
                    className={!status ? styles.selectedStatus : ""}
                    onClick={() => selectStatus("")}
                  >
                    Все объявления
                  </button>

                  {(Object.keys(statusLabels) as Status[]).map((key) => (
                    <button
                      type="button"
                      key={key}
                      className={status === key ? styles.selectedStatus : ""}
                      onClick={() => selectStatus(key)}
                    >
                      {statusLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.filterWrap} ref={filterWrapRef}>
              <button
                type="button"
                className={styles.filterTrigger}
                onClick={() => {
                  setFilterOpen((open) => !open);
                  setStatusOpen(false);
                }}
                aria-expanded={filterOpen}
                aria-haspopup="true"
              >
                Фильтрация
                <span className={styles.funnel} aria-hidden="true">
                  <img src="/filter.svg" alt="" />
                </span>
              </button>

              {filterOpen && (
                <aside
                  className={styles.filterPanel}
                  aria-label="Фильтры объявлений"
                >
                  <div className={styles.filterHeading}>Тип передачи</div>

                  {(["exchange", "free"] as Transfer[]).map((key) => (
                    <label className={styles.checkRow} key={key}>
                      <input
                        type="checkbox"
                        checked={transfer.includes(key)}
                        onChange={() =>
                          toggleValue(key, transfer, setTransfer)
                        }
                      />
                      <span className={styles.checkboxMark} aria-hidden="true" />
                      <span>
                        {key === "exchange" ? "Обмен" : "Бесплатно"}
                      </span>
                    </label>
                  ))}

                  <div className={styles.filterHeading}>Категория</div>

                  <CategorySelect<Category>
                    value={category}
                    options={(Object.keys(categoryLabels) as Category[]).map((key) => ({
                      value: key,
                      label: categoryLabels[key],
                    }))}
                    placeholder="Все категории"
                    onChange={(value) => {
                      setCategory(value);
                    }}
                  />

                  {category &&
                    subcategories[category].map((name) => (
                      <label className={styles.checkRow} key={name}>
                        <input
                          type="checkbox"
                          checked={subcategory.includes(name)}
                          onChange={() =>
                            toggleValue(name, subcategory, setSubcategory)
                          }
                        />
                        <span
                          className={styles.checkboxMark}
                          aria-hidden="true"
                        />
                        <span>{name}</span>
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
                      <span className={styles.checkboxMark} aria-hidden="true" />
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

          <section className={styles.cards} aria-label="Объявления">
            {ads.map((ad) => (
              <article className={styles.adCard} key={ad.id}>
                <div className={styles.photoArea}>
                  <span
                    className={`${styles.statusBadge} ${styles[ad.status]}`}
                  >
                    {statusLabels[ad.status]}
                  </span>

                  <div className={styles.adActions}>
                    <button
                      type="button"
                      className={styles.moreButton}
                      aria-label="Действия с объявлением"
                      aria-expanded={activeAdMenu === ad.id}
                      onClick={() =>
                        setActiveAdMenu((current) =>
                          current === ad.id ? null : ad.id,
                        )
                      }
                    >
                      •••
                    </button>

                    {activeAdMenu === ad.id && (
                      <div className={styles.adActionsMenu}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAdMenu(null);
                            window.location.href = `/my-items/edit/${ad.id}`;
                          }}
                        >
                          Редактировать
                        </button>

                        <button
                          type="button"
                          disabled={ad.status === "unpublished"}
                          onClick={() => {
                            setActiveAdMenu(null);
                            // потом подключить изменение статуса объявления
                          }}
                        >
                          Снять с публикации
                        </button>
                      </div>
                    )}
                  </div>

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
                  <h2>{ad.title}</h2>
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
              <p className={styles.noResults}>
                По выбранным фильтрам объявлений нет.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}