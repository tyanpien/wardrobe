import { notFound } from "next/navigation";
import { Badge, Card, Container, PageHeader } from "@/shared/ui";
import { ITEM_CATEGORY_LABELS, ITEM_CONDITION_LABELS, ITEM_STATUS_LABELS, TRANSFER_TYPE_LABELS } from "@/entities/item";
import { RequestItemActions } from "@/features/request-item";
import { ReportButton } from "@/features/report";
import { stubItems } from "@/shared/lib/stubs";
import styles from "./item.module.css";

type ItemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const item = stubItems.find((entry) => entry.id === id);

  if (!item) {
    notFound();
  }

  return (
    <Container>
      <PageHeader title={item.title} description={item.description} />
      <div className={styles.layout}>
        <Card>
          <p>Категория: {ITEM_CATEGORY_LABELS[item.category]}</p>
          <p>Состояние: {ITEM_CONDITION_LABELS[item.condition]}</p>
          <p>Способ передачи: {TRANSFER_TYPE_LABELS[item.transferType]}</p>
          <p>Местоположение: {item.city}</p>
          <Badge>{ITEM_STATUS_LABELS[item.status]}</Badge>
        </Card>
        <div className={styles.actions}>
          <RequestItemActions />
          <ReportButton />
        </div>
      </div>
    </Container>
  );
}
