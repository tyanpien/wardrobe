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

export type OrganizationCardDto = {
  id: string;
  name: string;
  city: string | null;
  cities: string[];
  logo_url: string | null;
  description: string | null;
  acceptance_tags: string[];
  points_count: number;
};

export type OrganizationListDto = {
  items: OrganizationCardDto[];
  total: number;
  page: number;
  page_size: number;
};

export type OrganizationMapPointDto = {
  id: string;
  organization_id: string;
  organization_name: string;
  organization_logo_url: string | null;
  title: string;
  address_line: string;
  city: string;
  working_hours: string;
  latitude: number | null;
  longitude: number | null;
};

export type OrganizationMapPointsDto = {
  items: OrganizationMapPointDto[];
  total: number;
};

export type OrganizationMapPoint = OrganizationMapPointDto;

export type OrganizationCard = {
  id: string;
  name: string;
  city: string;
  cities: string[];
  logoUrl: string | null;
  description: string;
  tags: string[];
  receivingPointsCount: number;
};

export type MyOrganizationDto = {
  id: string;
  name: string;
  city: string | null;
  logo_url: string | null;
  role: string;
  permissions: string[];
  action: string;
};

export type OrganizationStatusDto = {
  has_organization: boolean;
  action: string;
  organization: MyOrganizationDto | null;
};

export type OrganizationCreateRequest = {
  name: string;
  email: string;
};

export type MyOrganization = {
  id: string;
  name: string;
  city: string | null;
  logoUrl: string | null;
  role: string;
  permissions: string[];
  action: string;
};

export type OrganizationStatus = {
  hasOrganization: boolean;
  action: string;
  organization: MyOrganization | null;
};

export function mapMyOrganization(dto: MyOrganizationDto): MyOrganization {
  return {
    id: dto.id,
    name: dto.name,
    city: dto.city,
    logoUrl: dto.logo_url,
    role: dto.role,
    permissions: dto.permissions,
    action: dto.action,
  };
}

export function mapOrganizationStatus(
  dto: OrganizationStatusDto,
): OrganizationStatus {
  return {
    hasOrganization: dto.has_organization,
    action: dto.action,
    organization: dto.organization
      ? mapMyOrganization(dto.organization)
      : null,
  };
}

export type OrganizationDetailDto = {
  id: string;
  name: string;
  city: string | null;
  cities: string[];
  logo_url: string | null;
  description: string | null;
  about: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  social_links: Array<Record<string, unknown> | string>;
  acceptance_tags: string[];
  points_count: number;
  acceptance_rules: {
    categories: Array<{ name: string; subcategories: string[] }>;
    conditions: string[];
    additional_requirements: string | null;
    not_accepted: string[];
  };
  addresses: Array<{
    id: string;
    title: string;
    address_line: string;
    city: string;
    working_hours: string;
    schedule: Record<string, unknown>;
    latitude: number | null;
    longitude: number | null;
    sort_order: number;
  }>;
  viewer_permissions: string[];
  viewer_role: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationDetail = {
  id: string;
  name: string;
  city: string;
  logoUrl: string | null;
  description: string;
  aboutParagraphs: string[];
  phone: string | null;
  email: string;
  website: string | null;
  socialLinks: Array<Record<string, unknown> | string>;
  categories: Array<{ title: string; icon: string; items: string[] }>;
  allowedConditions: string[];
  extraRequirements: string;
  rejectedItems: string[];
  points: Array<{
    id: string;
    title: string;
    address: string;
    hours: string;
  }>;
  viewerRole: string | null;
  viewerPermissions: string[];
};

const CATEGORY_ICONS: Record<string, string> = {
  "Одежда": "/coolicons_shirt.svg",
  "Обувь": "/lucide_sport-shoe.svg",
  "Аксессуары": "/bi_handbag.svg",
  "Дом и быт": "/bi_house-door.svg",
  "Детские вещи": "/cil_baby-carriage.svg",
  "Электроника": "/energy-icons_smartphone-20.svg",
  "Книги и канцелярия": "/bi_book.svg",
  "Хобби и спорт": "/solar_dumbbell-large-minimalistic-broken.svg",
};

export function mapOrganizationCard(dto: OrganizationCardDto): OrganizationCard {
  return {
    id: dto.id,
    name: dto.name,
    city: dto.city ?? dto.cities[0] ?? "Город не указан",
    cities: dto.cities,
    logoUrl: dto.logo_url,
    description: dto.description ?? "",
    tags: dto.acceptance_tags,
    receivingPointsCount: dto.points_count,
  };
}

export function mapOrganizationDetail(
  dto: OrganizationDetailDto,
): OrganizationDetail {
  return {
    id: dto.id,
    name: dto.name,
    city: dto.city ?? dto.cities[0] ?? "Город не указан",
    logoUrl: dto.logo_url,
    description: dto.description ?? "",
    aboutParagraphs: (dto.about ?? "")
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean),
    phone: dto.phone,
    email: dto.email,
    website: dto.website,
    socialLinks: dto.social_links,
    categories: dto.acceptance_rules.categories.map((category) => ({
      title: category.name,
      icon: CATEGORY_ICONS[category.name] ?? "/bi_book.svg",
      items: category.subcategories,
    })),
    allowedConditions: dto.acceptance_rules.conditions,
    extraRequirements:
      dto.acceptance_rules.additional_requirements ??
      "Дополнительные требования не указаны.",
    rejectedItems: dto.acceptance_rules.not_accepted,
    points: dto.addresses.map((address) => ({
      id: address.id,
      title: address.title,
      address: [address.address_line, address.city]
        .filter(Boolean)
        .join(", "),
      hours: address.working_hours,
    })),
    viewerRole: dto.viewer_role,
    viewerPermissions: dto.viewer_permissions,
  };
}



export type OrganizationGeneralUpdateRequest = {
  name?: string | null;
  description?: string | null;
  about?: string | null;
  logo_url?: string | null;
  city?: string | null;
  website?: string | null;
  social_links?: Array<Record<string, unknown> | string> | null;
};

export type OrganizationContactsUpdateRequest = {
  email?: string | null;
  phone?: string | null;
  website?: string | null;
};

export type AcceptanceRulesUpdateRequest = {
  categories: Array<{ name: string; subcategories: string[] }>;
  conditions: string[];
  additional_requirements: string | null;
  not_accepted: string[];
};

export type AddressUpsertRequest = {
  id?: string;
  title?: string;
  address_line: string;
  city: string;
  working_hours?: string | null;
  schedule: {
    monday: { is_open: boolean; from: string | null; to: string | null };
    tuesday: { is_open: boolean; from: string | null; to: string | null };
    wednesday: { is_open: boolean; from: string | null; to: string | null };
    thursday: { is_open: boolean; from: string | null; to: string | null };
    friday: { is_open: boolean; from: string | null; to: string | null };
    saturday: { is_open: boolean; from: string | null; to: string | null };
    sunday: { is_open: boolean; from: string | null; to: string | null };
  };
  sort_order?: number;
};

export type AddressesReplaceRequest = { addresses: AddressUpsertRequest[] };
