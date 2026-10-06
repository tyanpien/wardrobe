import { EmptyState, PageHeader } from "@/shared/ui";

export default function NotificationsPage() {
  return (
    <section>
      <PageHeader
        title="Уведомления"
        description="Уведомления о запросах, сообщениях, откликах и статусах."
      />
      <EmptyState title="Нет уведомлений" description="Новые события появятся в этом разделе." />
    </section>
  );
}
