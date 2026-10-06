import { notFound } from "next/navigation";
import { Card, Container, PageHeader } from "@/shared/ui";
import { MapView } from "@/widgets/map-view";
import { stubOrganizations } from "@/shared/lib/stubs";

type OrganizationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { id } = await params;
  const organization = stubOrganizations.find((entry) => entry.id === id) ?? stubOrganizations[0];

  if (!organization) {
    notFound();
  }

  return (
    <Container>
      <PageHeader title={organization.name} description={organization.contacts} />
      <Card>
        <p>Режим работы: {organization.workingHours}</p>
        <p>Адрес: {organization.addresses[0]?.address}</p>
        <p>Принимаем вещи: {organization.acceptedItems.extraRequirements}</p>
        <p>Не принимаем вещи: {organization.rejectedItems.extraRestrictions}</p>
      </Card>
      <MapView title="Пункт приема организации" />
    </Container>
  );
}
