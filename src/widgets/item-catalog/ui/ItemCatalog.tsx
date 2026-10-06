import Link from "next/link";
import type { Item } from "@/entities/item";
import { ItemCard } from "@/entities/item";
import { EmptyState, ErrorState, LoadingState } from "@/shared/ui";
import type { LoadingState as AsyncLoadingState } from "@/shared/types";
import styles from "./ItemCatalog.module.css";

type ItemCatalogProps = {
  items: Item[];
  status?: AsyncLoadingState;
};

export function ItemCatalog({ items, status = "success" }: ItemCatalogProps) {
  if (status === "loading") {
    return <LoadingState label="Загрузка каталога вещей..." />;
  }

  if (status === "error") {
    return <ErrorState title="Каталог временно недоступен" />;
  }

  if (items.length === 0) {
    return <EmptyState title="Вещи не найдены" description="Измените фильтры или поисковый запрос." />;
  }

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <Link key={item.id} href={`/catalog/${item.id}`} className={styles.link}>
          <ItemCard item={item} />
        </Link>
      ))}
    </div>
  );
}
