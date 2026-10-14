import type { Item } from "../model/types";
import {
  ITEM_CATEGORY_LABELS,
  ITEM_STATUS_LABELS,
  TRANSFER_TYPE_LABELS,
  ITEM_CONDITION_LABELS,
} from "../model/labels";
import styles from "./ItemCard.module.css";

const subcategoryLabels: Record<string, string> = {
  outerwear: "Верхняя одежда",
  tshirts_tops: "Футболки и топы",
  shirts_blouses: "Рубашки и блузки",
  sweaters_hoodies: "Свитеры и толстовки",
  pants_jeans: "Брюки и джинсы",
  dresses_skirts: "Платья и юбки",
  sportswear: "Спортивная одежда",
  homewear: "Домашняя одежда",
  shoes_demi: "Демисезонная",
  shoes_sport: "Спортивная",
  shoes_winter: "Зимняя",
  shoes_summer: "Летняя",
  bags_backpacks: "Сумки и рюкзаки",
  hats: "Головные уборы",
  scarves_gloves: "Шарфы и перчатки",
  belts: "Ремни",
  bedding: "Постельное белье",
  towels: "Полотенца",
  blankets: "Пледы и одеяла",
  curtains: "Шторы",
  kids_clothing: "Детская одежда",
  kids_shoes: "Детская обувь",
  newborn_clothing: "Одежда для новорожденных",
  toys: "Игрушки",
  kids_books: "Детские книги",
  baby_care: "Товары для ухода за ребенком",
  kids_textile: "Детский текстиль",
  other: "Другое",
};

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
  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        {item.photoUrls[0] ? (
          <img src={item.photoUrls[0]} alt={item.title} />
        ) : (
          <span>Фото вещи</span>
        )}

        <span className={`${styles.status} ${statusClass[item.status]}`}>
          {ITEM_STATUS_LABELS[item.status]}
        </span>
      </div>

      <h3 className={styles.title}>{item.title}</h3>

      <p className={styles.description}>{item.description}</p>

      <div className={styles.tags}>
        <span className={styles.darkTag}>
          {TRANSFER_TYPE_LABELS[item.transferType]}
        </span>

        <span>{ITEM_CATEGORY_LABELS[item.category]}</span>

        {item.subcategory && (
          <span>
            {subcategoryLabels[item.subcategory] || item.subcategory}
          </span>
        )}

        <span>{ITEM_CONDITION_LABELS[item.condition]}</span>
      </div>

      <p className={styles.meta}>{item.city}</p>
    </article>
  );
}