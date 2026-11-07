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
import type {
  Item,
  ItemCategory,
  ItemCondition,
  ItemStatus,
} from "@/entities/item";
import {
  CATEGORY_OPTIONS,
  ITEM_CATEGORY_LABELS,
  ITEM_CONDITION_LABELS,
  ITEM_STATUS_LABELS,
  fetchMyListings,
  getListingErrorMessage,
  getSubcategoryOptions,
  subcategoryLabel,
  unpublishListing,
} from "@/entities/item";

type Transfer = "exchange" | "free";
type Status = ItemStatus;
type Category = ItemCategory;
type Condition = ItemCondition;

type ProfileData = {
  name: string;
  city: string;
  photo: string;
  about: string;
};

const categoryLabels = ITEM_CATEGORY_LABELS;
const statusLabels = ITEM_STATUS_LABELS;
const conditionLabels = ITEM_CONDITION_LABELS;

export function ProfileDashboard() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "Имя Пользователя",
    city: "Местоположение",
    photo: "",
    about: "",
  });

  const [profileError, setProfileError] = useState("");
  const [ads, setAds] = useState<Item[]>([]);
  const [adsError, setAdsError] = useState("");
  const [adsLoading, setAdsLoading] = useState(true);

  const statusFilterRef = useRef<HTMLDivElement>(null);
  const filterWrapRef = useRef<HTMLDivElement>(null);

  const [activeAdMenu, setActiveAdMenu] = useState<string | null>(null);
  const [tab, setTab] = useState<"ads" | "history" | "volunteer">("ads");
  const [status, setStatus] = useState<Status | "">("");
  const [transfer, setTransfer] = useState<Transfer[]>(["exchange", "free"]);
  const [category, setCategory] = useState<Category | "">("");
  const [subcategory, setSubcategory] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([
    "new",
    "excellent",
    "good",
    "needs_repair",
  ]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

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

  useEffect(() => {
    let cancelled = false;

    async function loadAds() {
      setAdsLoading(true);
      setAdsError("");

      try {
        const statuses: ItemStatus[] | undefined =
          tab === "history"
            ? ["transferred"]
            : status
              ? [status]
              : undefined;

        const response = await fetchMyListings({
          category: category || undefined,
          subcategory:
            subcategory.length === 1 ? subcategory[0] : undefined,
          conditions:
            conditions.length > 0 && conditions.length < 4
              ? conditions
              : undefined,
          transferTypes: transfer.length > 0 ? transfer : undefined,
          statuses,
          page: 1,
          pageSize: 100,
        });

        if (cancelled) return;

        let nextItems = response.items;

        if (subcategory.length > 1) {
          nextItems = nextItems.filter(
            (item) =>
              item.subcategory && subcategory.includes(item.subcategory),
          );
        }

        if (tab === "ads") {
          nextItems = nextItems.filter((item) => item.status !== "transferred");
        }

        if (transfer.length > 0 && transfer.length < 2) {
          nextItems = nextItems.filter((item) =>
            transfer.includes(item.transferType as Transfer),
          );
        }

        setAds(nextItems);
      } catch (error) {
        if (cancelled) return;
        setAds([]);
        setAdsError(getListingErrorMessage(error));
      } finally {
        if (!cancelled) setAdsLoading(false);
      }
    }

    void loadAds();

    return () => {
      cancelled = true;
    };
  }, [status, transfer, category, subcategory, conditions, tab]);

  const subcategoryOptions = useMemo(
    () => (category ? getSubcategoryOptions(category) : []),
    [category],
  );

  async function unpublishAd(ad: Item) {
    if (ad.status !== "published") return;

    try {
      const updated = await unpublishListing(ad.id);
      setAds((current) =>
        current.map((item) => (item.id === ad.id ? { ...item, ...updated } : item)),
      );
      setAdsError("");
    } catch (error) {
      setAdsError(
        getListingErrorMessage(
          error,
          "Не удалось изменить статус объявления. Попробуйте ещё раз.",
        ),
      );
    }
  }

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

      {profileError && <p role="alert">{profileError}</p>}
      {adsError && <p role="alert">{adsError}</p>}

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

        <Link href="/my-items/create" className={styles.createButton}>
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
                    options={CATEGORY_OPTIONS.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))}
                    placeholder="Все категории"
                    onChange={(value) => {
                      setCategory(value);
                      setSubcategory([]);
                    }}
                  />

                  {subcategoryOptions.map((item) => (
                    <label className={styles.checkRow} key={item.value}>
                      <input
                        type="checkbox"
                        checked={subcategory.includes(item.value)}
                        onChange={() =>
                          toggleValue(item.value, subcategory, setSubcategory)
                        }
                      />
                      <span
                        className={styles.checkboxMark}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
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
            {adsLoading && <p>Загрузка объявлений...</p>}

            {!adsLoading &&
              ads.map((ad) => (
                <article
                  className={styles.adCard}
                  key={ad.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => {
                    window.location.href = `/catalog/${ad.id}`;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      window.location.href = `/catalog/${ad.id}`;
                    }
                  }}
                >
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
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveAdMenu((current) =>
                            current === ad.id ? null : ad.id,
                          );
                        }}
                      >
                        •••
                      </button>

                      {activeAdMenu === ad.id && (
                        <div className={styles.adActionsMenu}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveAdMenu(null);
                              window.location.href = `/my-items/edit/${ad.id}`;
                            }}
                          >
                            Редактировать
                          </button>

                          <button
                            type="button"
                            disabled={ad.status !== "published"}
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveAdMenu(null);
                              void unpublishAd(ad);
                            }}
                          >
                            Снять с публикации
                          </button>
                        </div>
                      )}
                    </div>

                    {ad.photoUrls[0] || ad.coverUrl ? (
                      <img
                        src={ad.photoUrls[0] || ad.coverUrl || ""}
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
                      <img src="/location.svg" alt="" />
                      {ad.city}
                    </span>

                    <div className={styles.tags}>
                      <span className={styles.darkTag}>
                        {ad.transferType === "exchange" ? "Обмен" : "Бесплатно"}
                      </span>
                      <span>{categoryLabels[ad.category]}</span>
                      {ad.subcategory ? (
                        <span>
                          {subcategoryLabel(ad.category, ad.subcategory)}
                        </span>
                      ) : null}
                      <span>{conditionLabels[ad.condition]}</span>
                    </div>
                  </div>
                </article>
              ))}

            {!adsLoading && ads.length === 0 && (
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
