import { env } from "@/shared/config";
import type { Item, ItemPhoto } from "./types";
import {
  categoryFromApi,
  conditionFromApi,
  deliveryFromApi,
  statusFromApi,
  subcategoryFromApi,
  transferFromApi,
} from "./catalog";

export type ListingPhotoDto = {
  id: string;
  url: string;
  sort_order: number;
};

export type ListingCardDto = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  condition: string;
  transfer_type: string;
  city: string;
  status: string;
  cover_url: string | null;
  created_at: string;
};

export type ListingDetailDto = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  condition: string;
  transfer_type: string;
  exchange_wishes: string | null;
  delivery_method: string;
  city: string;
  status: string;
  photos: ListingPhotoDto[];
  created_at: string;
  updated_at: string;
};

export type ListingListDto = {
  items: ListingCardDto[];
  total: number;
  page: number;
  page_size: number;
};

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  return new URL(url, env.apiUrl).toString();
}

function mapPhoto(photo: ListingPhotoDto): ItemPhoto {
  return {
    id: photo.id,
    url: resolveMediaUrl(photo.url),
    sortOrder: photo.sort_order,
  };
}

export function mapListingCard(dto: ListingCardDto): Item {
  const category = categoryFromApi(dto.category);

  return {
    id: dto.id,
    ownerId: "",
    title: dto.title,
    description: dto.description,
    category,
    subcategory: subcategoryFromApi(category, dto.subcategory),
    condition: conditionFromApi(dto.condition),
    photoUrls: dto.cover_url ? [resolveMediaUrl(dto.cover_url)] : [],
    transferType: transferFromApi(dto.transfer_type),
    city: dto.city,
    status: statusFromApi(dto.status),
    createdAt: dto.created_at,
    coverUrl: dto.cover_url ? resolveMediaUrl(dto.cover_url) : null,
  };
}

export function mapListingDetail(dto: ListingDetailDto): Item {
  const category = categoryFromApi(dto.category);
  const photos = [...dto.photos]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapPhoto);

  return {
    id: dto.id,
    ownerId: dto.owner_id,
    title: dto.title,
    description: dto.description,
    category,
    subcategory: subcategoryFromApi(category, dto.subcategory),
    condition: conditionFromApi(dto.condition),
    photoUrls: photos.map((photo) => photo.url),
    photos,
    transferType: transferFromApi(dto.transfer_type),
    exchangeWishes: dto.exchange_wishes ?? undefined,
    deliveryMethod: deliveryFromApi(dto.delivery_method),
    city: dto.city,
    status: statusFromApi(dto.status),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    coverUrl: photos[0]?.url ?? null,
  };
}
