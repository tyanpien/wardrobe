import type { ItemCategory, ItemCondition, ItemSubcategory } from "@/entities/item";

export type OrganizationAddress = {
  id: string;
  address: string;
  workingHours?: string;
};

export type AcceptedItemsPolicy = {
  categories: ItemCategory[];
  subcategories: ItemSubcategory[];
  allowedConditions: ItemCondition[];
  extraRequirements?: string;
};

export type RejectedItemsPolicy = {
  categories: ItemCategory[];
  exceptions?: string;
  extraRestrictions?: string;
};

export type Organization = {
  id: string;
  name: string;
  email: string;
  logoUrl?: string;
  contacts?: string;
  addresses: OrganizationAddress[];
  workingHours?: string;
  acceptedItems: AcceptedItemsPolicy;
  rejectedItems: RejectedItemsPolicy;
};
