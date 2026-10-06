import type { Organization } from "@/entities/organization";
import { Card } from "@/shared/ui";
import styles from "./OrganizationCard.module.css";

type OrganizationCardProps = {
  organization: Organization;
};

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const firstAddress = organization.addresses[0];

  return (
    <Card>
      <article className={styles.card}>
        <h3 className={styles.title}>{organization.name}</h3>
        <p className={styles.meta}>{firstAddress?.address ?? "Адрес не указан"}</p>
        <p className={styles.meta}>{organization.workingHours ?? "Режим работы не указан"}</p>
      </article>
    </Card>
  );
}
