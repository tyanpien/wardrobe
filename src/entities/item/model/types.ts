export type ItemCategory =
  | "clothing"
  | "shoes"
  | "accessories"
  | "home_textile"
  | "kids"
  | "electronics"
  | "books_stationery"
  | "hobby_sport"
  | "other";

export type ItemSubcategory =
  | "outerwear"
  | "tshirts_tops"
  | "shirts_blouses"
  | "sweaters_hoodies"
  | "pants_jeans"
  | "dresses_skirts"
  | "sportswear"
  | "homewear"
  | "shoes_demi"
  | "shoes_sport"
  | "shoes_winter"
  | "shoes_summer"
  | "bags_backpacks"
  | "hats"
  | "scarves_gloves"
  | "belts"
  | "dishes"
  | "textile"
  | "decor"
  | "storage"
  | "small_appliances"
  | "bedding"
  | "towels"
  | "blankets"
  | "curtains"
  | "kids_clothing"
  | "kids_shoes"
  | "newborn_clothing"
  | "toys"
  | "kids_books"
  | "baby_care"
  | "kids_textile"
  | "phones"
  | "computers"
  | "home_electronics"
  | "books"
  | "textbooks"
  | "stationery"
  | "sport_equipment"
  | "creativity"
  | "board_games"
  | "music"
  | "other";

export type ItemCondition = "new" | "excellent" | "good" | "needs_repair";

export type TransferType = "free" | "exchange" | "to_organization";

export type ItemStatus = "published" | "in_transfer" | "transferred" | "unpublished";

export type DeliveryMethod = "meeting" | "pickup" | "agreement";

export type ItemPhoto = {
  id: string;
  url: string;
  sortOrder: number;
};

export type Item = {
  id: string;
  ownerId: string;
  ownerName?: string;
  title: string;
  description: string;
  category: ItemCategory;
  subcategory?: ItemSubcategory;
  condition: ItemCondition;
  photoUrls: string[];
  photos?: ItemPhoto[];
  transferType: TransferType;
  exchangeWishes?: string;
  deliveryMethod?: DeliveryMethod;
  city: string;
  status: ItemStatus;
  createdAt?: string;
  updatedAt?: string;
  coverUrl?: string | null;
};
