import type { Item } from "../model/types";
import { ITEM_CATEGORY_LABELS, ITEM_STATUS_LABELS, TRANSFER_TYPE_LABELS } from "../model/labels";
import styles from "./ItemCard.module.css";

type ItemCardProps = {
  item: Item;
};

export function ItemCard({ item }: ItemCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.photo}>Фото вещи</div>
      <h3 className={styles.title}>{item.title}</h3>
      <p className={styles.meta}>
        {ITEM_CATEGORY_LABELS[item.category]} · {TRANSFER_TYPE_LABELS[item.transferType]}
      </p>
      <p className={styles.meta}>
        {item.city} · {ITEM_STATUS_LABELS[item.status]}
      </p>
    </article>
  );
}
