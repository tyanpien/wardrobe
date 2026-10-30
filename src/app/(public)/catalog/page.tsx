"use client";

import { useEffect, useState, useMemo } from "react";
import type { Item } from "@/entities/item";
import { Container, PageHeader } from "@/shared/ui";
import { ItemCatalog } from "@/widgets/item-catalog";
import { ItemFilters, type CatalogFilters } from "@/widgets/item-filters";
import { stubItems } from "@/shared/lib/stubs";

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
const emptyFilters: CatalogFilters = {
  query: "",
  category: "",
  subcategories: [],
  conditions: [],
  cities: [],
  transferTypes: [],
};
const STORAGE_KEY = "dobry-shkaf-created-ads";

function toCatalogItem(ad: StoredAd): Item {
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

export default function CatalogPage() {
  const [items, setItems] = useState<Item[]>(stubItems);
  const [filters, setFilters] = useState<CatalogFilters>(emptyFilters);

  useEffect(() => {
    function readPublishedAds() {
      try {
        const savedAds = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]",
        ) as StoredAd[];
        const publishedItems = savedAds
          .filter((ad) => ad.status === "published")
          .map(toCatalogItem);

        const itemsById = new Map<string, Item>();
        stubItems.forEach((item) => itemsById.set(item.id, item));
        publishedItems.forEach((item) => itemsById.set(item.id, item));
        setItems([...itemsById.values()]);
      } catch {
        setItems(stubItems);
      }
    }

    readPublishedAds();
    window.addEventListener("focus", readPublishedAds);
    window.addEventListener("dobry-shkaf-ads-updated", readPublishedAds);
    window.addEventListener("storage", readPublishedAds);

    return () => {
      window.removeEventListener("focus", readPublishedAds);
      window.removeEventListener("dobry-shkaf-ads-updated", readPublishedAds);
      window.removeEventListener("storage", readPublishedAds);
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const haystack = `${item.title} ${item.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.category && item.category !== filters.category) return false;
      if (
        filters.subcategories.length > 0 &&
        (!item.subcategory || !filters.subcategories.includes(item.subcategory))
      ) {
        return false;
      }
      if (
        filters.conditions.length > 0 &&
        !filters.conditions.includes(item.condition)
      ) {
        return false;
      }
      if (filters.cities.length > 0 && !filters.cities.includes(item.city)) {
        return false;
      }
      if (
        filters.transferTypes.length > 0 &&
        !filters.transferTypes.includes(item.transferType)
      ) {
        return false;
      }
      return true;
    });
  }, [items, filters]);

  return (
    <Container>
      <ItemFilters
        items={filteredItems}
        onApply={setFilters}
        onSearch={(query) => setFilters((prev) => ({ ...prev, query }))}
      />
      <ItemCatalog items={items} />
    </Container>
  );
}
