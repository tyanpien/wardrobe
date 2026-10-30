import type { ItemCategory } from "@/entities/item";

export type CatalogFilters = {
  query: string;
  category: "" | ItemCategory;
  subcategories: string[];
  conditions: string[];
  cities: string[];
  transferTypes: string[];
};