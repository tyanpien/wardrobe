import type { VolunteerTask } from "@/entities/volunteer-task";
import { Badge, Card } from "@/shared/ui";
import styles from "./VolunteerTaskCard.module.css";

const TASK_STATUS_LABELS: Record<VolunteerTask["status"], string> = {
  open: "Набор открыт",
  recruitment_closed: "Набор завершен",
  completed: "Выполнено",
  cancelled: "Отменено",
};

type VolunteerTaskCardProps = {
  task: VolunteerTask;
};

export function VolunteerTaskCard({ task }: VolunteerTaskCardProps) {
  return (
    <Card>
      <article className={styles.card}>
        <h3>{task.title}</h3>
        <Badge>{TASK_STATUS_LABELS[task.status]}</Badge>
        <p className={styles.meta}>{task.location}</p>
        <p className={styles.meta}>{task.dateOrPeriod}</p>
        <p className={styles.meta}>Нужно волонтеров: {task.volunteersNeeded}</p>
      </article>
    </Card>
  );
}
