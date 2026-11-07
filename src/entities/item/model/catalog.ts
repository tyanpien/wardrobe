import type { ItemCategory, ItemCondition, ItemSubcategory, TransferType } from "./types";
import type { DeliveryMethod } from "./types";

export type CategoryOption = {
  value: ItemCategory;
  label: string;
  api: string;
  subcategories: Array<{ value: ItemSubcategory; label: string; api: string }>;
};

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "clothing",
    label: "Одежда",
    api: "Одежда",
    subcategories: [
      { value: "outerwear", label: "Верхняя одежда", api: "Верхняя одежда" },
      { value: "tshirts_tops", label: "Футболки и топы", api: "Футболки и топы" },
      { value: "shirts_blouses", label: "Рубашки и блузки", api: "Рубашки и блузки" },
      { value: "sweaters_hoodies", label: "Свитеры и толстовки", api: "Свитеры и толстовки" },
      { value: "pants_jeans", label: "Брюки и джинсы", api: "Брюки и джинсы" },
      { value: "dresses_skirts", label: "Платья и юбки", api: "Платья и юбки" },
      { value: "sportswear", label: "Спортивная одежда", api: "Спортивная одежда" },
      { value: "homewear", label: "Домашняя одежда", api: "Домашняя одежда" },
    ],
  },
  {
    value: "shoes",
    label: "Обувь",
    api: "Обувь",
    subcategories: [
      { value: "shoes_demi", label: "Демисезонная", api: "Демисезонная" },
      { value: "shoes_sport", label: "Спортивная", api: "Спортивная" },
      { value: "shoes_winter", label: "Зимняя", api: "Зимняя" },
      { value: "shoes_summer", label: "Летняя", api: "Летняя" },
    ],
  },
  {
    value: "accessories",
    label: "Аксессуары",
    api: "Аксессуары",
    subcategories: [
      { value: "bags_backpacks", label: "Сумки и рюкзаки", api: "Сумки и рюкзаки" },
      { value: "hats", label: "Головные уборы", api: "Головные уборы" },
      { value: "scarves_gloves", label: "Шарфы и перчатки", api: "Шарфы и перчатки" },
      { value: "belts", label: "Ремни", api: "Ремни" },
    ],
  },
  {
    value: "home_textile",
    label: "Дом и быт",
    api: "Дом и быт",
    subcategories: [
      { value: "dishes", label: "Посуда", api: "Посуда" },
      { value: "textile", label: "Текстиль", api: "Текстиль" },
      { value: "decor", label: "Декор", api: "Декор" },
      { value: "storage", label: "Хранение", api: "Хранение" },
      { value: "small_appliances", label: "Мелкая бытовая техника", api: "Мелкая бытовая техника" },
    ],
  },
  {
    value: "kids",
    label: "Детские вещи",
    api: "Детские вещи",
    subcategories: [
      { value: "kids_clothing", label: "Детская одежда", api: "Детская одежда" },
      { value: "kids_shoes", label: "Детская обувь", api: "Детская обувь" },
      { value: "newborn_clothing", label: "Одежда для новорожденных", api: "Одежда для новорожденных" },
      { value: "toys", label: "Игрушки", api: "Игрушки" },
      { value: "kids_books", label: "Детские книги", api: "Детские книги" },
      { value: "baby_care", label: "Товары для ухода за ребенком", api: "Товары для ухода за ребенком" },
      { value: "kids_textile", label: "Детский текстиль", api: "Детский текстиль" },
    ],
  },
  {
    value: "electronics",
    label: "Электроника",
    api: "Электроника",
    subcategories: [
      { value: "phones", label: "Телефоны и аксессуары", api: "Телефоны и аксессуары" },
      { value: "computers", label: "Компьютеры и аксессуары", api: "Компьютеры и аксессуары" },
      { value: "home_electronics", label: "Бытовая электроника", api: "Бытовая электроника" },
    ],
  },
  {
    value: "books_stationery",
    label: "Книги и канцелярия",
    api: "Книги и канцелярия",
    subcategories: [
      { value: "books", label: "Книги", api: "Книги" },
      { value: "textbooks", label: "Учебники", api: "Учебники" },
      { value: "stationery", label: "Канцтовары", api: "Канцтовары" },
    ],
  },
  {
    value: "hobby_sport",
    label: "Хобби и спорт",
    api: "Хобби и спорт",
    subcategories: [
      { value: "sport_equipment", label: "Спортивный инвентарь", api: "Спортивный инвентарь" },
      { value: "creativity", label: "Творчество", api: "Творчество" },
      { value: "board_games", label: "Настольные игры", api: "Настольные игры" },
      { value: "music", label: "Музыкальные товары", api: "Музыкальные товары" },
    ],
  },
  {
    value: "other",
    label: "Другое",
    api: "Другое",
    subcategories: [],
  },
];

export const CONDITION_API: Record<ItemCondition, string> = {
  new: "Новое",
  excellent: "Отличное",
  good: "Хорошее",
  needs_repair: "Требует ремонта",
};

export const TRANSFER_API: Record<"free" | "exchange", string> = {
  free: "Бесплатно",
  exchange: "Обмен",
};

export const STATUS_API: Record<
  "published" | "in_transfer" | "transferred" | "unpublished",
  string
> = {
  published: "Опубликовано",
  in_transfer: "В процессе передачи",
  transferred: "Передано",
  unpublished: "Снято с публикации",
};

export const DELIVERY_API: Record<DeliveryMethod, string> = {
  meeting: "Встреча",
  pickup: "Самовывоз",
  agreement: "По договоренности",
};

export function getCategoryOption(category: ItemCategory): CategoryOption | undefined {
  return CATEGORY_OPTIONS.find((item) => item.value === category);
}

export function getSubcategoryOptions(category: ItemCategory) {
  return getCategoryOption(category)?.subcategories ?? [];
}

export function categoryToApi(category: ItemCategory): string {
  return getCategoryOption(category)?.api ?? category;
}

export function subcategoryToApi(
  category: ItemCategory,
  subcategory?: string | null,
): string | null {
  if (!subcategory) return null;
  const found = getSubcategoryOptions(category).find(
    (item) => item.value === subcategory || item.api === subcategory || item.label === subcategory,
  );
  return found?.api ?? subcategory;
}

export function categoryFromApi(apiValue: string): ItemCategory {
  const found = CATEGORY_OPTIONS.find((item) => item.api === apiValue);
  return found?.value ?? "other";
}

export function subcategoryFromApi(
  category: ItemCategory,
  apiValue: string | null | undefined,
): ItemSubcategory | undefined {
  if (!apiValue) return undefined;
  const found = getSubcategoryOptions(category).find(
    (item) => item.api === apiValue || item.label === apiValue || item.value === apiValue,
  );
  return found?.value;
}

export function conditionFromApi(apiValue: string): ItemCondition {
  const entry = Object.entries(CONDITION_API).find(([, label]) => label === apiValue);
  return (entry?.[0] as ItemCondition) ?? "good";
}

export function conditionToApi(value: ItemCondition): string {
  return CONDITION_API[value];
}

export function transferFromApi(apiValue: string): TransferType {
  if (apiValue === TRANSFER_API.exchange) return "exchange";
  if (apiValue === TRANSFER_API.free) return "free";
  return "free";
}

export function transferToApi(value: TransferType): string {
  if (value === "exchange") return TRANSFER_API.exchange;
  return TRANSFER_API.free;
}

export function statusFromApi(apiValue: string): keyof typeof STATUS_API {
  const entry = Object.entries(STATUS_API).find(([, label]) => label === apiValue);
  return (entry?.[0] as keyof typeof STATUS_API) ?? "published";
}

export function statusToApi(value: keyof typeof STATUS_API): string {
  return STATUS_API[value];
}

export function deliveryFromApi(apiValue: string): DeliveryMethod {
  const entry = Object.entries(DELIVERY_API).find(([, label]) => label === apiValue);
  return (entry?.[0] as DeliveryMethod) ?? "meeting";
}

export function deliveryToApi(value: DeliveryMethod): string {
  return DELIVERY_API[value];
}

export function subcategoryLabel(
  category: ItemCategory,
  subcategory?: string | null,
): string {
  if (!subcategory) return "";
  const found = getSubcategoryOptions(category).find(
    (item) => item.value === subcategory || item.api === subcategory || item.label === subcategory,
  );
  return found?.label ?? subcategory;
}
