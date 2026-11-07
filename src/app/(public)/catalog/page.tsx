"use client";

import { useEffect, useMemo, useState } from "react";
import type { Item, ItemCondition } from "@/entities/item";
import {
  fetchCatalog,
  getListingErrorMessage,
} from "@/entities/item";
import { Container } from "@/shared/ui";
import type { LoadingState } from "@/shared/types";
import { ItemCatalog } from "@/widgets/item-catalog";
import { ItemFilters, type CatalogFilters } from "@/widgets/item-filters";

const emptyFilters: CatalogFilters = {
  query: "",
  category: "",
  subcategories: [],
  conditions: [],
  cities: [],
  transferTypes: [],
};

export default function CatalogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<CatalogFilters>(emptyFilters);
  const [status, setStatus] = useState<LoadingState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setStatus("loading");
      setError("");

      try {
        const subcategory =
          filters.subcategories.length === 1
            ? filters.subcategories[0]
            : undefined;

        const response = await fetchCatalog({
          q: filters.query,
          category: filters.category || undefined,
          subcategory,
          conditions: filters.conditions as ItemCondition[],
          cities: filters.cities,
          transferTypes: filters.transferTypes as Array<"free" | "exchange">,
          page: 1,
          pageSize: 100,
        });

        if (cancelled) return;

        let nextItems = response.items;

        if (filters.subcategories.length > 1) {
          nextItems = nextItems.filter(
            (item) =>
              item.subcategory &&
              filters.subcategories.includes(item.subcategory),
          );
        }

        setItems(nextItems);
        setTotal(
          filters.subcategories.length > 1 ? nextItems.length : response.total,
        );
        setStatus("success");
      } catch (loadError) {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setStatus("error");
        setError(getListingErrorMessage(loadError));
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const catalogStatus = useMemo(() => status, [status]);

  return (
    <Container>
      <ItemFilters
        items={items}
        totalCount={total}
        onApply={setFilters}
        onSearch={(query) => setFilters((prev) => ({ ...prev, query }))}
      />
      {error && status === "error" ? (
        <p role="alert">{error}</p>
      ) : null}
      <ItemCatalog items={items} status={catalogStatus} />
    </Container>
  );
}
