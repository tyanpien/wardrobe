import type { ItemCategory, ItemCondition, ItemStatus, TransferType } from "./types";
import { CATEGORY_OPTIONS } from "./catalog";

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((item) => [item.value, item.label]),
) as Record<ItemCategory, string>;

export const ITEM_CONDITION_LABELS: Record<ItemCondition, string> = {
  new: "Новое",
  excellent: "Отличное",
  good: "Хорошее",
  needs_repair: "Требует ремонта",
};

export const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  free: "Бесплатно",
  exchange: "Обмен",
  to_organization: "Передать организации",
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  published: "Опубликовано",
  in_transfer: "В процессе передачи",
  transferred: "Передано",
  unpublished: "Снято с публикации",
};

export const CATALOG_TRANSFER_OPTIONS: Array<{
  value: "free" | "exchange";
  label: string;
}> = [
  { value: "free", label: "Бесплатно" },
  { value: "exchange", label: "Обмен" },
];
