import { Container, PageHeader } from "@/shared/ui";
import { VolunteerTaskCard } from "@/widgets/volunteer-task-card";
import { ApplyToTaskButton } from "@/features/apply-to-task";
import { stubVolunteerTasks } from "@/shared/lib/stubs";
import styles from "./volunteer.module.css";

export default function VolunteerTasksPage() {
  return (
    <Container>
      <PageHeader
        title="Волонтерские задачи"
        description="Доступные задачи организаций. Можно фильтровать по территории и типу помощи."
      />
      <div className={styles.list}>
        {stubVolunteerTasks.map((task) => (
          <div key={task.id}>
            <VolunteerTaskCard task={task} />
            <ApplyToTaskButton />
          </div>
        ))}
      </div>
    </Container>
  );
}
