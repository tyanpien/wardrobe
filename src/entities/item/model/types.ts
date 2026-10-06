export type ItemCategory =
  | "clothing"
  | "shoes"
  | "accessories"
  | "home_textile"
  | "kids"
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
  | "other";

export type ItemCondition = "new" | "excellent" | "good" | "needs_repair";

export type TransferType = "free" | "exchange" | "to_organization";

export type ItemStatus = "published" | "in_transfer" | "transferred" | "unpublished";

export type Item = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: ItemCategory;
  subcategory?: ItemSubcategory;
  condition: ItemCondition;
  photoUrls: string[];
  transferType: TransferType;
  exchangeWishes?: string;
  city: string;
  status: ItemStatus;
};
