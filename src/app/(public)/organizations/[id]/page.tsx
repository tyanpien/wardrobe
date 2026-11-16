import { OrganizationDetails } from "./organization-details";

type OrganizationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { id } = await params;
  return <OrganizationDetails organizationId={id} />;
}
