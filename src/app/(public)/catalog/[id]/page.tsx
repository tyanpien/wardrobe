"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Item } from "@/entities/item";
import {
  ITEM_CATEGORY_LABELS,
  ITEM_CONDITION_LABELS,
  fetchListing,
  getListingErrorMessage,
  publishListing,
  subcategoryLabel,
  unpublishListing,
} from "@/entities/item";
import { getAvatarUrl } from "@/entities/user/api/profile";
import { Container, EmptyState } from "@/shared/ui";
import { EditItemActions } from "@/features/edit-item";
import styles from "./item.module.css";
import { getAccessToken } from "@/shared/api/auth-headers";

type SavedUser = {
  id?: string;
  email?: string;
  name?: string;
  photo?: string;
};

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [sellerName, setSellerName] = useState("Пользователь");
  const [sellerPhoto, setSellerPhoto] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadItem() {
      setLoaded(false);
      setError("");

      try {
        const rawUser = localStorage.getItem("dobry-shkaf-user");
        const user = rawUser ? (JSON.parse(rawUser) as SavedUser) : null;
        const detail = await fetchListing(id);

        if (cancelled) return;

        const owner = Boolean(user?.id && user.id === detail.ownerId);
        setItem(detail);
        setIsOwner(owner);
        setActivePhoto(0);

        if (owner) {
          setSellerName(user?.name || "Вы");
          setSellerPhoto(getAvatarUrl(user?.photo || null));
        } else {
          setSellerName(detail.ownerName || "Пользователь");
          setSellerPhoto("");
        }
      } catch (loadError) {
        if (cancelled) return;
        setItem(null);
        setError(getListingErrorMessage(loadError, "Объявление недоступно"));
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void loadItem();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const photos = useMemo(
    () => item?.photoUrls.filter(Boolean) ?? [],
    [item],
  );

  async function handleUnpublish() {
    if (!item || !isOwner || item.status !== "published" || busy) return;

    setBusy(true);
    try {
      const updated = await unpublishListing(item.id);
      setItem(updated);
    } catch (unpublishError) {
      window.alert(
        getListingErrorMessage(
          unpublishError,
          "Не удалось снять объявление с публикации. Попробуйте ещё раз.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    if (!item || !isOwner || item.status !== "unpublished" || busy) return;

    setBusy(true);
    try {
      const updated = await publishListing(item.id);
      setItem(updated);
    } catch (publishError) {
      window.alert(
        getListingErrorMessage(
          publishError,
          "Не удалось опубликовать объявление. Попробуйте ещё раз.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) {
    return (
      <Container>
        <p>Загрузка объявления...</p>
      </Container>
    );
  }

  if (!item || (item.status !== "published" && !isOwner)) {
    return (
      <Container>
        <EmptyState
          title="Объявление недоступно"
          description={
            error ||
            "Возможно, оно было снято с публикации или больше не существует."
          }
        />
      </Container>
    );
  }
  function isUserAuthorized(): boolean {
    if (typeof window === "undefined") return false;
  
    const token = getAccessToken();
    const rawUser = localStorage.getItem("dobry-shkaf-user");
  
    if (!token || !rawUser) return false;
  
    try {
      const user = JSON.parse(rawUser) as SavedUser;
      return Boolean(user.id);
    } catch {
      return false;
    }
  }
  const chatHref = `/messages?user=${encodeURIComponent(item.ownerId)}&userName=${encodeURIComponent(sellerName)}&item=${encodeURIComponent(item.id)}`;

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.layout}>
          <div className={styles.galleryColumn}>
            <Link href="/catalog" className={styles.backButton} aria-label="Назад в каталог">
              <img src="/eva_arrow-back-fill.svg" alt="" />
            </Link>

            <div className={styles.gallery}>
              {photos.length > 0 ? (
                <img
                  className={styles.mainPhoto}
                  src={photos[activePhoto] || photos[0]}
                  alt={item.title}
                />
              ) : (
                <div className={styles.photoPlaceholder}>Фото пока не добавлены</div>
              )}

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.galleryArrow} ${styles.previous}`}
                    aria-label="Предыдущее фото"
                    onClick={() =>
                      setActivePhoto((current) =>
                        current === 0 ? photos.length - 1 : current - 1,
                      )
                    }
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={`${styles.galleryArrow} ${styles.next}`}
                    aria-label="Следующее фото"
                    onClick={() =>
                      setActivePhoto((current) => (current + 1) % photos.length)
                    }
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {photos.length > 1 && (
              <div className={styles.thumbnails}>
                {photos.map((photo, index) => (
                  <button
                    type="button"
                    key={`${item.id}-${index}`}
                    className={`${styles.thumbnail} ${activePhoto === index ? styles.thumbnailActive : ""}`}
                    onClick={() => setActivePhoto(index)}
                    aria-label={`Показать фото ${index + 1}`}
                    aria-pressed={activePhoto === index}
                  >
                    <img src={photo} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className={styles.details}>
            <div className={styles.titleRow}>
              <h1>{item.title}</h1>
              {isOwner && item.status !== "published" && (
                <span className={styles.unpublishedBadge}>Снято с публикации</span>
              )}
            </div>

            {item.transferType === "exchange" ? (
              <div className={styles.transferNotice}>
                <span className={styles.transferTag}>Обмен</span>

                {item.exchangeWishes && (
                  <>
                    <span className={styles.noticeChevron}>›</span>
                    <p>
                      <span className={styles.noticeLabel}>
                        Пожелания по обмену:{" "}
                      </span>
                      {item.exchangeWishes}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.freeBadge}>Бесплатно</div>
            )}

            <dl className={styles.meta}>
              <div>
                <dt>Категория:</dt>
                <dd>
                  {ITEM_CATEGORY_LABELS[item.category]}
                  {item.subcategory
                    ? ` · ${subcategoryLabel(item.category, item.subcategory)}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt>Состояние:</dt>
                <dd>{ITEM_CONDITION_LABELS[item.condition]}</dd>
              </div>
              <div>
                <dt>Город:</dt>
                <dd>{item.city}</dd>
              </div>
            </dl>

            <div className={styles.descriptionBlock}>
              <h2>Описание</h2>
              <p>{item.description}</p>
            </div>

            {isOwner ? (
              <div className={styles.ownerActions}>
                <EditItemActions
                  itemId={item.id}
                  status={item.status}
                  onUnpublish={() => {
                    void handleUnpublish();
                  }}
                  onPublish={() => {
                    void handlePublish();
                  }}
                />
              </div>
            ) : (
              <div className={styles.sellerCard}>
                {sellerPhoto ? (
                  <img
                    className={styles.sellerAvatar}
                    src={sellerPhoto}
                    alt=""
                  />
                ) : (
                  <span
                    className={styles.sellerAvatar}
                    aria-hidden="true"
                  />
                )}

                <span className={styles.sellerName}>
                  {sellerName}
                </span>

                <button
                  type="button"
                  className={styles.messageButton}
                  onClick={() => {
                    if (!isUserAuthorized()) {
                      router.push(
                        `/login?from=${encodeURIComponent(chatHref)}`,
                      );
                      return;
                    }
                  
                    router.push(chatHref);
                  }}
                >
                  Написать
                </button>
              </div>
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
