import { EmptyState, PageHeader } from "@/shared/ui";
import { VolunteerTaskCard } from "@/widgets/volunteer-task-card";
import { stubVolunteerTasks } from "@/shared/lib/stubs";

export default function MyVolunteerPage() {
  return (
    <section>
      <PageHeader
        title="Волонтерский раздел"
        description="Активные и завершенные волонтерские задачи, а также статусы откликов."
      />
      <VolunteerTaskCard task={stubVolunteerTasks[0]} />
      <EmptyState
        title="Нет завершенных задач"
        description="Статусы отклика: на рассмотрении, принят, отклонен, отменен вами, выполнено."
      />
    </section>
  );
}
