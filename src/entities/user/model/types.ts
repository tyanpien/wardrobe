export const USER_ROLES = ["user", "organization_representative", "organization_staff", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type OrganizationPermission =
  | "edit_organization_description"
  | "edit_organization_blocks"
  | "manage_volunteer_needs"
  | "confirm_item_receipt"
  | "chat_with_users";

export type UserOrganizationMembership = {
  organizationId: string;
  isRepresentative: boolean;
  permissions: OrganizationPermission[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  description?: string;
  city?: string;
  wantsToVolunteer: boolean;
  volunteerSkills?: string;
  volunteerCapabilities?: string;
  roles: UserRole[];
  organizations: UserOrganizationMembership[];
};
