import { notFound } from "next/navigation";
import { OrganizationDetails } from "./organization-details";
import { mockOrganizationDetails } from "./organization-detail-mock";

type OrganizationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { id } = await params;

  const organization = mockOrganizationDetails.find(
    (item) => item.id === id,
  );

  if (!organization) {
    notFound();
  }

  return <OrganizationDetails organization={organization} />;
}