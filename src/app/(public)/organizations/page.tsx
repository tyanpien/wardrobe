import Link from "next/link";
import { Container, PageHeader } from "@/shared/ui";
import { MapView } from "@/widgets/map-view";
import { OrganizationCard } from "@/widgets/organization-card";
import { stubOrganizations } from "@/shared/lib/stubs";
import styles from "./organizations.module.css";

export default function OrganizationsPage() {
  return (
    <Container>
      <PageHeader
        title="Организации и пункты приема"
        description="Публичные страницы организаций, контакты, адреса и карта пунктов приема."
      />
      <div className={styles.list}>
        {stubOrganizations.map((organization) => (
          <Link key={organization.id} href={`/organizations/${organization.id}`}>
            <OrganizationCard organization={organization} />
          </Link>
        ))}
      </div>
      <MapView title="Карта пунктов организаций" />
    </Container>
  );
}
