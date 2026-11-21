import { OrganizationMapPage } from "./organization-map-page";

type OrganizationMapRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function OrganizationMapRoute({
  params,
}: OrganizationMapRouteProps) {
  const { id } = await params;

  return <OrganizationMapPage organizationId={id} />;
}
