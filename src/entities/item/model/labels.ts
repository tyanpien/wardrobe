import type { ItemCategory, ItemCondition, ItemStatus, TransferType } from "./types";

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  clothing: "Одежда",
  shoes: "Обувь",
  accessories: "Аксессуары",
  home_textile: "Домашний текстиль",
  kids: "Детские вещи",
  other: "Другое",
};

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
