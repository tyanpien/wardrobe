
import { http } from "@/shared/api/http";
import { authHeaders, getAccessToken } from "@/shared/api/auth-headers";
import type {
  OrganizationCard,
  OrganizationListDto,
  OrganizationMapPointDto,
  OrganizationMapPointsDto,
  OrganizationDetailDto,
  OrganizationDetail,
  MyOrganizationDto,
  MyOrganization,
  OrganizationStatusDto,
  OrganizationStatus,
  OrganizationCreateRequest,
  OrganizationGeneralUpdateRequest,
  OrganizationContactsUpdateRequest,
  AcceptanceRulesUpdateRequest,
  AddressUpsertRequest,
} from "../model/dto";
import {
  mapOrganizationCard,
  mapOrganizationDetail,
  mapMyOrganization,
  mapOrganizationStatus,
} from "../model/dto";

export type OrganizationListParams = {
  q?: string;
  city?: string[];
  page?: number;
  pageSize?: number;
};

export type OrganizationListResult = {
  items: OrganizationCard[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getOrganizations(
  params: OrganizationListParams = {},
): Promise<OrganizationListResult> {
  const query = new URLSearchParams();

  if (params.q?.trim()) query.set("q", params.q.trim());
  params.city?.forEach((city) => query.append("city", city));
  query.set("page", String(params.page ?? 1));
  query.set("page_size", String(params.pageSize ?? 20));

  const response = await http.get<OrganizationListDto>(
    `/api/v1/organizations?${query.toString()}`,
  );

  return {
    items: response.data.items.map(mapOrganizationCard),
    total: response.data.total,
    page: response.data.page,
    pageSize: response.data.page_size,
  };
}

export type OrganizationMapPoint = OrganizationMapPointDto;

export async function getOrganizationMapPoints(
  params: {
    q?: string;
    city?: string[];
  } = {},
): Promise<OrganizationMapPoint[]> {
  const query = new URLSearchParams();

  if (params.q?.trim()) query.set("q", params.q.trim());
  params.city?.forEach((city) => query.append("city", city));

  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : "";

  const response = await http.get<OrganizationMapPointsDto>(
    `/api/v1/organizations/map-points${suffix}`,
  );

  return response.data.items;
}

export async function getOrganizationDto(
  organizationId: string,
): Promise<OrganizationDetailDto> {
  const token = getAccessToken();

  const response = await http.get<OrganizationDetailDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}`,
    token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined,
  );

  return response.data;
}

export async function getOrganization(
  organizationId: string,
): Promise<OrganizationDetail> {
  return mapOrganizationDetail(await getOrganizationDto(organizationId));
}

export async function createOrganization(
  payload: OrganizationCreateRequest,
): Promise<OrganizationDetail> {
  const response = await http.post<OrganizationDetailDto>(
    "/api/v1/organizations",
    {
      name: payload.name.trim(),
      email: payload.email.trim(),
    },
    {
      headers: authHeaders(),
    },
  );

  return mapOrganizationDetail(response.data);
}

export async function getMyOrganizations(): Promise<MyOrganization[]> {
  const response = await http.get<MyOrganizationDto[]>(
    "/api/v1/me/organizations",
    {
      headers: authHeaders(),
    },
  );

  return response.data.map(mapMyOrganization);
}

export async function getOrganizationStatus(): Promise<OrganizationStatus> {
  const response = await http.get<OrganizationStatusDto>(
    "/api/v1/me/organization-status",
    {
      headers: authHeaders(),
    },
  );

  return mapOrganizationStatus(response.data);
}

export async function updateOrganizationGeneral(
  organizationId: string,
  payload: OrganizationGeneralUpdateRequest,
): Promise<OrganizationDetail> {
  const response = await http.patch<OrganizationDetailDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/general`,
    payload,
    { headers: authHeaders() },
  );

  return mapOrganizationDetail(response.data);
}

export async function updateOrganizationContacts(
  organizationId: string,
  payload: OrganizationContactsUpdateRequest,
): Promise<OrganizationDetail> {
  const response = await http.patch<OrganizationDetailDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/contacts`,
    payload,
    { headers: authHeaders() },
  );

  return mapOrganizationDetail(response.data);
}

export async function updateOrganizationAcceptanceRules(
  organizationId: string,
  payload: AcceptanceRulesUpdateRequest,
): Promise<OrganizationDetail> {
  const response = await http.put<OrganizationDetailDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/acceptance-rules`,
    payload,
    { headers: authHeaders() },
  );

  return mapOrganizationDetail(response.data);
}

export async function createOrganizationAddress(
  organizationId: string,
  payload: AddressUpsertRequest,
): Promise<OrganizationDetail> {
  const response = await http.post<OrganizationDetailDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/addresses`,
    payload,
    { headers: authHeaders() },
  );

  return mapOrganizationDetail(response.data);
}

export async function updateOrganizationAddress(
  organizationId: string,
  addressId: string,
  payload: AddressUpsertRequest,
): Promise<OrganizationDetail> {
  const response = await http.patch<OrganizationDetailDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/addresses/${encodeURIComponent(addressId)}`,
    payload,
    { headers: authHeaders() },
  );

  return mapOrganizationDetail(response.data);
}

export async function deleteOrganizationAddress(
  organizationId: string,
  addressId: string,
): Promise<OrganizationDetail> {
  const response = await http.delete<OrganizationDetailDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/addresses/${encodeURIComponent(addressId)}`,
    { headers: authHeaders() },
  );

  return mapOrganizationDetail(response.data);
}

export async function uploadOrganizationLogo(
  organizationId: string,
  file: File,
): Promise<OrganizationDetail> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post<OrganizationDetailDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/logo`,
    formData,
    { headers: authHeaders() },
  );

  return mapOrganizationDetail(response.data);
}

export type OrganizationMemberDto = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: "representative" | "employee";
  permissions: string[];
  permission_labels: string[];
};

export type OrganizationInvitationDto = {
  id: string;
  email: string;
  permissions: string[];
  permission_labels: string[];
  status: string;
  token: string;
  created_at: string;
};

export type OrganizationPermission =
  | "edit_profile"
  | "edit_general_info"
  | "edit_contacts"
  | "edit_addresses"
  | "edit_acceptance_rules"
  | "manage_volunteer_tasks"
  | "review_volunteer_responses"
  | "confirm_transfers";

export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMemberDto[]> {
  const { data } = await http.get<{
    items: OrganizationMemberDto[];
  }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/members`,
    { headers: authHeaders() },
  );

  return data.items;
}

export async function updateOrganizationMemberPermissions(
  organizationId: string,
  memberId: string,
  permissions: OrganizationPermission[],
): Promise<OrganizationMemberDto> {
  const { data } = await http.patch<OrganizationMemberDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(memberId)}`,
    { permissions },
    { headers: authHeaders() },
  );

  return data;
}

export async function removeOrganizationMember(
  organizationId: string,
  memberId: string,
): Promise<void> {
  await http.delete(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(memberId)}`,
    { headers: authHeaders() },
  );
}

export async function getOrganizationInvitations(
  organizationId: string,
): Promise<OrganizationInvitationDto[]> {
  const { data } = await http.get<{
    items: OrganizationInvitationDto[];
  }>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/invitations`,
    { headers: authHeaders() },
  );

  return data.items;
}

export async function createOrganizationInvitation(
  organizationId: string,
  email: string,
  permissions: OrganizationPermission[],
): Promise<OrganizationInvitationDto> {
  const { data } = await http.post<OrganizationInvitationDto>(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/invitations`,
    {
      email: email.trim(),
      permissions,
    },
    { headers: authHeaders() },
  );

  return data;
}

export async function revokeOrganizationInvitation(
  organizationId: string,
  invitationId: string,
): Promise<void> {
  await http.delete(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/invitations/${encodeURIComponent(invitationId)}`,
    { headers: authHeaders() },
  );
}

export async function acceptOrganizationInvitation(
  token: string,
): Promise<OrganizationDetail> {
  if (!token?.trim()) {
    throw new Error("Отсутствует токен приглашения.");
  }

  const { data } = await http.post<OrganizationDetailDto>(
    `/api/v1/organization-invitations/${encodeURIComponent(token)}/accept`,
    {},
    {
      headers: authHeaders(),
    },
  );

  return mapOrganizationDetail(data);
}
