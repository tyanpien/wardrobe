import { ConfirmTransferActions } from "@/features/confirm-transfer";
import { ManageRequestActions } from "@/features/manage-request";
import { EmptyState, PageHeader } from "@/shared/ui";

export default function RequestsPage() {
  return (
    <section>
      <PageHeader
        title="Запросы"
        description="Запросы на получение и передачу вещей, их статусы и подтверждение передачи."
      />
      <EmptyState title="Запросов пока нет" description="Когда появится запрос, здесь будут его статус и действия." />
      <ManageRequestActions />
      <ConfirmTransferActions />
    </section>
  );
}
