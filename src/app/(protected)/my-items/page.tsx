
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Item } from "@/entities/item";
import {
  fetchMyListings,
  getListingErrorMessage,
  publishListing,
  unpublishListing,
  ItemCard,
} from "@/entities/item";
import { EditItemActions } from "@/features/edit-item";
import { PageHeader } from "@/shared/ui";
import styles from "./my-items.module.css";

export default function MyItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchMyListings({
        page: 1,
        pageSize: 100,
      });

      setItems(response.items);
    } catch (loadError) {
      setError(getListingErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function handleListingAction(
    itemId: string,
    action: typeof unpublishListing | typeof publishListing,
  ) {
    setBusyItemId(itemId);
    setActionError("");

    try {
      const updatedItem = await action(itemId);

      setItems((current) =>
        current.map((item) =>
          item.id === itemId ? updatedItem : item,
        ),
      );
    } catch (actionError) {
      setActionError(getListingErrorMessage(actionError));
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <section className={styles.page}>
      <PageHeader
        title="Мои вещи"
        description="Опубликованные объявления и управление публикациями."
      />

      <Link href="/my-items/create" className={styles.createLink}>
        Создать объявление
      </Link>

      {actionError && (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className={styles.message}>
          Загрузка ваших объявлений...
        </p>
      ) : error ? (
        <div className={styles.errorBlock}>
          <p className={styles.error} role="alert">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadItems()}
            className={styles.retryButton}
          >
            Повторить
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>У вас пока нет объявлений</h2>
          <p>
            Создайте первое объявление, чтобы оно появилось в этом разделе.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div className={styles.item} key={item.id}>
              <Link
                href={`/catalog/${item.id}`}
                className={styles.itemLink}
              >
                <ItemCard item={item} />
              </Link>

              <div className={styles.itemActions}>
                <EditItemActions
                  itemId={item.id}
                  status={item.status}
                  onUnpublish={() =>
                    void handleListingAction(
                      item.id,
                      unpublishListing,
                    )
                  }
                  onPublish={() =>
                    void handleListingAction(
                      item.id,
                      publishListing,
                    )
                  }
                />

                {busyItemId === item.id && (
                  <span className={styles.actionLoading}>
                    Сохранение...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
