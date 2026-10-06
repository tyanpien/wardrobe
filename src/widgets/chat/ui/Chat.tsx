import { EmptyState } from "@/shared/ui";
import { SendMessageForm } from "@/features/send-message";
import styles from "./Chat.module.css";

export function Chat() {
  return (
    <section className={styles.chat} aria-label="Чат">
      <div className={styles.list}>
        <p>Диалоги</p>
        <EmptyState title="Нет диалогов" description="Чат доступен только двум сторонам взаимодействия." />
      </div>
      <div className={styles.thread}>
        <p>Переписка</p>
        <SendMessageForm />
      </div>
    </section>
  );
}
