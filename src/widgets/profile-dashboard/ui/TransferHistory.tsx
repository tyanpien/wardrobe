
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTransferHistory } from "@/entities/chat";
import type { TransferHistoryItemDto } from "@/entities/chat/model/types";
import styles from "./TransferHistory.module.css";
import { fetchListing } from "@/entities/item";
import { capitalizeFirstLetter } from "@/shared/lib/capitalizeFirstLetter";

type HistoryFilter = "all" | "sent" | "received" | "organizations";

type HistoryGroup = {
  key: string;
  title: string;
  items: TransferHistoryItemDto[];
};

const FILTERS: Array<{ value: HistoryFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "sent", label: "Передано" },
  { value: "received", label: "Получено" },
  { value: "organizations", label: "Организациям" },
];

function isOrganizationTransfer(item: TransferHistoryItemDto): boolean {
  return [
    "to_organization",
    "organization",
    "организации",
    "организациям",
  ].includes(item.transfer_type.trim().toLowerCase());
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function groupByMonth(items: TransferHistoryItemDto[]): HistoryGroup[] {
  const groups = new Map<string, HistoryGroup>();

  for (const item of items) {
    const date = new Date(item.completed_at);

    if (Number.isNaN(date.getTime())) continue;

    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!groups.has(key)) {
      const month = new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric",
      }).format(date);

      groups.set(key, {
        key,
        title: month.charAt(0).toUpperCase() + month.slice(1),
        items: [],
      });
    }

    groups.get(key)!.items.push(item);
  }

  return Array.from(groups.values());
}

export function TransferHistory() {
  const [items, setItems] = useState<TransferHistoryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [listingImages, setListingImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const response = await fetchTransferHistory(1, 100);

        if (!cancelled) {
          setItems(response.items);
        }
      } catch (loadError) {
        if (cancelled) return;

        setItems([]);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не удалось загрузить историю передач. Попробуйте ещё раз.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!items.length) return;
  
    let cancelled = false;
  
    async function loadListingImages() {
      const listingIds = [...new Set(items.map((item) => item.listing_id))];
  
      const results = await Promise.allSettled(
        listingIds.map(async (id) => {
          const listing = await fetchListing(id);
  
          const image =
            listing.coverUrl ||
            listing.photoUrls?.[0] ||
            listing.photos?.[0]?.url ||
            "";
  
          return { id, image };
        }),
      );
  
      if (cancelled) return;
  
      const images: Record<string, string> = {};
  
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.image) {
          images[result.value.id] = result.value.image;
        }
      });
  
      setListingImages((previous) => ({
        ...previous,
        ...images,
      }));
    }
  
    void loadListingImages();
  
    return () => {
      cancelled = true;
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const organizationTransfer = isOrganizationTransfer(item);

      switch (filter) {
        case "sent":
          return item.role === "owner" && !organizationTransfer;

        case "received":
          return item.role === "recipient";

        case "organizations":
          return organizationTransfer;

        default:
          return true;
      }
    });
  }, [filter, items]);

  const groups = useMemo(
    () => groupByMonth(filteredItems),
    [filteredItems],
  );

  function openListing(listingId: string) {
    window.location.href = `/catalog/${listingId}`;
  }

  return (
    <section className={styles.section} aria-label="История обмена">
      <div
        className={styles.filters}
        role="group"
        aria-label="Фильтр истории передач"
      >
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={filter === value ? styles.activeFilter : ""}
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.message} role="status">
          Загружаем историю передач...
        </p>
      ) : error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : groups.length ? (
        <div className={styles.groups}>
          {groups.map((group) => (
            <section className={styles.month} key={group.key}>
              <h2>{group.title}</h2>

              <div className={styles.grid}>
                {group.items.map((item) => {
                  const organizationTransfer =
                    isOrganizationTransfer(item);

                  const received = item.role === "recipient";

                  const badge = organizationTransfer
                    ? "Передано организации"
                    : received
                      ? "Получено"
                      : "Передано";

                  return (
                    <article
                      className={styles.card}
                      key={item.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => openListing(item.listing_id)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          openListing(item.listing_id);
                        }
                      }}
                    >

                    <div className={styles.imageWrapper}>
                        {listingImages[item.listing_id] ? (
                            <img
                            className={styles.listingImage}
                            src={listingImages[item.listing_id]}
                            alt={item.listing_title}
                            loading="lazy"
                            />
                        ) : (
                            <div
                            className={styles.imagePlaceholder}
                            aria-hidden="true"
                            />
                        )}
                    </div>

                      <div className={styles.cardInfo}>
                        <h3 title={capitalizeFirstLetter(item.listing_title)}>
                          {capitalizeFirstLetter(item.listing_title)}
                        </h3>

                        <p>
                          <span title={item.counterpart_name}>
                            {item.counterpart_name}
                          </span>

                          <span className={styles.dot}>·</span>

                          <time dateTime={item.completed_at}>
                            {formatDate(item.completed_at)}
                          </time>
                        </p>
                      </div>

                      <span
                        className={`${styles.badge} ${
                          organizationTransfer
                            ? styles.organizationBadge
                            : received
                              ? styles.receivedBadge
                              : styles.sentBadge
                        }`}
                      >
                        {badge}
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className={styles.message}>
          История передач пока пуста.
        </p>
      )}
    </section>
  );
}
