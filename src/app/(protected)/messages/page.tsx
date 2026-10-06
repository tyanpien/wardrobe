import { PageHeader } from "@/shared/ui";
import { Chat } from "@/widgets/chat";

export default function MessagesPage() {
  return (
    <section>
      <PageHeader
        title="Сообщения"
        description="Двусторонние чаты с пользователями и организациями."
      />
      <Chat />
    </section>
  );
}
