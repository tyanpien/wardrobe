import type { Item } from "../model/types";
import {
  ITEM_CATEGORY_LABELS,
  ITEM_STATUS_LABELS,
  TRANSFER_TYPE_LABELS,
  ITEM_CONDITION_LABELS,
} from "../model/labels";
import { subcategoryLabel } from "../model/catalog";
import styles from "./ItemCard.module.css";

const statusClass: Record<string, string> = {
  published: styles.published,
  in_transfer: styles.inTransfer,
  transferred: styles.transferred,
  unpublished: styles.unpublished,
};

type ItemCardProps = {
  item: Item;
};

export function ItemCard({ item }: ItemCardProps) {
  const cover = item.photoUrls[0] || item.coverUrl || "";

  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        {cover ? (
          <img src={cover} alt={item.title} />
        ) : (
          <span>Фото вещи</span>
        )}

        <span className={`${styles.status} ${statusClass[item.status]}`}>
          {ITEM_STATUS_LABELS[item.status]}
        </span>
      </div>

      <h3 className={styles.title}>{item.title}</h3>

      <p className={styles.description}>{item.description}</p>

      <span className={styles.locationPin} title={item.city}>
        <img src="/location.svg" alt="" />
        {item.city}
      </span>

      <div className={styles.tags}>
        <span className={styles.darkTag}>
          {TRANSFER_TYPE_LABELS[item.transferType]}
        </span>

        <span>{ITEM_CATEGORY_LABELS[item.category]}</span>

        {item.subcategory && (
          <span>{subcategoryLabel(item.category, item.subcategory)}</span>
        )}

        <span>{ITEM_CONDITION_LABELS[item.condition]}</span>
      </div>
    </article>
  );
}
