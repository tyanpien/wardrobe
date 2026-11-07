import { http } from "@/shared/api/http";
import { authHeaders, getAccessToken } from "@/shared/api/auth-headers";
import { getApiErrorMessage } from "@/shared/api/errors";
import type { Item, ItemCategory, ItemCondition, ItemStatus, TransferType } from "../model/types";
import type { DeliveryMethod } from "../model/types";
import {
  categoryToApi,
  conditionToApi,
  deliveryToApi,
  statusToApi,
  subcategoryToApi,
  transferToApi,
} from "../model/catalog";
import {
  mapListingCard,
  mapListingDetail,
  type ListingDetailDto,
  type ListingListDto,
} from "../model/mappers";

export type ListingsQuery = {
  q?: string;
  category?: ItemCategory | "";
  subcategory?: string;
  conditions?: ItemCondition[];
  cities?: string[];
  transferTypes?: Array<"free" | "exchange" | TransferType>;
  statuses?: ItemStatus[];
  page?: number;
  pageSize?: number;
};

export type CreateListingInput = {
  title: string;
  description: string;
  category: ItemCategory;
  subcategory?: string;
  condition: ItemCondition;
  transferType: "free" | "exchange";
  exchangeWishes?: string;
  deliveryMethod: DeliveryMethod;
  photos: File[];
};

export type UpdateListingInput = {
  title?: string;
  description?: string;
  category?: ItemCategory;
  subcategory?: string | null;
  condition?: ItemCondition;
  transferType?: "free" | "exchange";
  exchangeWishes?: string | null;
  deliveryMethod?: DeliveryMethod;
};

export type CategoriesResponse = {
  categories: Array<{ name: string; subcategories: string[] }>;
};

export type DictionariesResponse = {
  conditions: string[];
  transfer_types: string[];
  delivery_methods: string[];
  statuses: string[];
};

export type PaginatedItems = {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
};

function buildListParams(query: ListingsQuery = {}, includeStatus = false) {
  const params = new URLSearchParams();

  if (query.q?.trim()) {
    params.set("q", query.q.trim());
  }

  if (query.category) {
    params.set("category", categoryToApi(query.category));
  }

  if (query.subcategory && query.category) {
    const apiSub = subcategoryToApi(query.category, query.subcategory);
    if (apiSub) params.set("subcategory", apiSub);
  } else if (query.subcategory) {
    params.set("subcategory", query.subcategory);
  }

  query.conditions?.forEach((value) => {
    params.append("condition", conditionToApi(value));
  });

  query.cities?.forEach((value) => {
    params.append("city", value);
  });

  query.transferTypes
    ?.filter((value): value is "free" | "exchange" => value === "free" || value === "exchange")
    .forEach((value) => {
      params.append("transfer_type", transferToApi(value));
    });

  if (includeStatus) {
    query.statuses?.forEach((value) => {
      params.append("status", statusToApi(value));
    });
  }

  params.set("page", String(query.page ?? 1));
  params.set("page_size", String(query.pageSize ?? 20));

  return params;
}

function mapListResponse(data: ListingListDto): PaginatedItems {
  return {
    items: data.items.map(mapListingCard),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
  };
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await http.get<CategoriesResponse>("/api/v1/listings/categories");
  return response.data;
}

export async function fetchDictionaries(): Promise<DictionariesResponse> {
  const response = await http.get<DictionariesResponse>("/api/v1/listings/dictionaries");
  return response.data;
}

export async function fetchCatalog(query: ListingsQuery = {}): Promise<PaginatedItems> {
  const response = await http.get<ListingListDto>("/api/v1/listings", {
    params: buildListParams(query),
  });
  return mapListResponse(response.data);
}

export async function fetchMyListings(query: ListingsQuery = {}): Promise<PaginatedItems> {
  const response = await http.get<ListingListDto>("/api/v1/listings/mine", {
    headers: authHeaders(),
    params: buildListParams(query, true),
  });
  return mapListResponse(response.data);
}

export async function fetchListing(id: string): Promise<Item> {
  const token = getAccessToken();
  const response = await http.get<ListingDetailDto>(`/api/v1/listings/${id}`, {
    headers: token ? authHeaders(token) : undefined,
  });
  return mapListingDetail(response.data);
}

export async function createListing(input: CreateListingInput): Promise<Item> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description);
  formData.append("category", categoryToApi(input.category));
  formData.append("condition", conditionToApi(input.condition));
  formData.append("transfer_type", transferToApi(input.transferType));
  formData.append("delivery_method", deliveryToApi(input.deliveryMethod));

  if (input.category !== "other") {
    const subcategory = subcategoryToApi(input.category, input.subcategory);
    if (subcategory) {
      formData.append("subcategory", subcategory);
    }
  }

  if (input.transferType === "exchange" && input.exchangeWishes) {
    formData.append("exchange_wishes", input.exchangeWishes);
  }

  input.photos.forEach((file) => {
    formData.append("photos", file);
  });

  const response = await http.post<ListingDetailDto>("/api/v1/listings", formData, {
    headers: authHeaders(),
  });

  return mapListingDetail(response.data);
}

export async function updateListing(id: string, input: UpdateListingInput): Promise<Item> {
  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.category !== undefined) payload.category = categoryToApi(input.category);
  if (input.subcategory !== undefined) {
    payload.subcategory =
      input.category && input.category !== "other"
        ? subcategoryToApi(input.category, input.subcategory)
        : input.subcategory;
  }
  if (input.condition !== undefined) payload.condition = conditionToApi(input.condition);
  if (input.transferType !== undefined) {
    payload.transfer_type = transferToApi(input.transferType);
  }
  if (input.exchangeWishes !== undefined) {
    payload.exchange_wishes = input.exchangeWishes;
  }
  if (input.deliveryMethod !== undefined) {
    payload.delivery_method = deliveryToApi(input.deliveryMethod);
  }

  const response = await http.patch<ListingDetailDto>(`/api/v1/listings/${id}`, payload, {
    headers: authHeaders(),
  });

  return mapListingDetail(response.data);
}

export async function unpublishListing(id: string): Promise<Item> {
  const response = await http.post<ListingDetailDto>(
    `/api/v1/listings/${id}/unpublish`,
    null,
    { headers: authHeaders() },
  );
  return mapListingDetail(response.data);
}

export async function publishListing(id: string): Promise<Item> {
  const response = await http.post<ListingDetailDto>(
    `/api/v1/listings/${id}/publish`,
    null,
    { headers: authHeaders() },
  );
  return mapListingDetail(response.data);
}

export async function addListingPhotos(id: string, photos: File[]): Promise<Item> {
  const formData = new FormData();
  photos.forEach((file) => formData.append("photos", file));

  const response = await http.post<ListingDetailDto>(
    `/api/v1/listings/${id}/photos`,
    formData,
    { headers: authHeaders() },
  );

  return mapListingDetail(response.data);
}

export async function deleteListingPhoto(listingId: string, photoId: string): Promise<Item> {
  const response = await http.delete<ListingDetailDto>(
    `/api/v1/listings/${listingId}/photos/${photoId}`,
    { headers: authHeaders() },
  );
  return mapListingDetail(response.data);
}

export { getApiErrorMessage as getListingErrorMessage };
