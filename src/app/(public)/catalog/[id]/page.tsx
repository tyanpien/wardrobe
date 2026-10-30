"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Item } from "@/entities/item";
import { Badge, Card, Container, EmptyState, PageHeader } from "@/shared/ui";
import {
  ITEM_CATEGORY_LABELS,
  ITEM_CONDITION_LABELS,
  ITEM_STATUS_LABELS,
  TRANSFER_TYPE_LABELS,
} from "@/entities/item";
import { RequestItemActions } from "@/features/request-item";
import { ReportButton } from "@/features/report";
import { stubItems } from "@/shared/lib/stubs";
import styles from "./item.module.css";

type StoredAd = {
  id: number;
  title: string;
  description: string;
  transfer: "exchange" | "free";
  category: Item["category"];
  subcategory?: string;
  condition: Item["condition"];
  status: Item["status"];
  city: string;
  photo?: string;
  photos?: string[];
  exchangeWishes?: string;
};

function toItem(ad: StoredAd): Item {
  return {
    id: String(ad.id),
    ownerId: "current-user",
    title: ad.title,
    description: ad.description,
    category: ad.category,
    subcategory: ad.subcategory as Item["subcategory"],
    condition: ad.condition,
    photoUrls: ad.photos?.length ? ad.photos : ad.photo ? [ad.photo] : [],
    transferType: ad.transfer,
    exchangeWishes: ad.exchangeWishes,
    city: ad.city,
    status: ad.status,
  };
}

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(() =>
    stubItems.find((entry) => entry.id === id) ?? null,
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedAds = JSON.parse(
        localStorage.getItem("dobry-shkaf-created-ads") || "[]",
      ) as StoredAd[];
      const savedItem = savedAds.find((ad) => String(ad.id) === id);
      if (savedItem) {
        setItem(toItem(savedItem));
      } else {
        setItem(stubItems.find((entry) => entry.id === id) ?? null);
      }
    } catch {
      setItem(stubItems.find((entry) => entry.id === id) ?? null);
    } finally {
      setLoaded(true);
    }
  }, [id]);

  if (!loaded) return null;
  if (!item || item.status !== "published") {
    return (
      <Container>
        <EmptyState
          title="Объявление недоступно"
          description="Возможно, оно было снято с публикации или больше не существует."
        />
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title={item.title} description={item.description} />
      <div className={styles.layout}>
        <Card>
          {item.photoUrls[0] && (
            <img
              src={item.photoUrls[0]}
              alt={item.title}
              style={{ width: "100%", maxHeight: 420, objectFit: "contain" }}
            />
          )}
          <p>Категория: {ITEM_CATEGORY_LABELS[item.category]}</p>
          <p>Состояние: {ITEM_CONDITION_LABELS[item.condition]}</p>
          <p>Способ передачи: {TRANSFER_TYPE_LABELS[item.transferType]}</p>
          <p>Местоположение: {item.city}</p>
          {item.exchangeWishes && <p>Пожелания по обмену: {item.exchangeWishes}</p>}
          <Badge>{ITEM_STATUS_LABELS[item.status]}</Badge>
        </Card>
        <div className={styles.actions}>
          <RequestItemActions />
          <ReportButton />
        </div>
      </div>
    </Container>
  );
}
