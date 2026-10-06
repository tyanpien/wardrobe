import { CreateVolunteerTaskForm } from "@/features/create-volunteer-task";
import { ManageTaskActions } from "@/features/manage-task";
import { Card, PageHeader } from "@/shared/ui";

export default function OrganizationCabinetPage() {
  return (
    <section>
      <PageHeader
        title="Раздел организации"
        description="Управление описанием организации, правилами приема вещей, сотрудниками и потребностями в волонтерах."
      />
      <Card>
        <p>Права сотрудника назначаются при приглашении. Базовый доступ — переписка с пользователями.</p>
      </Card>
      <Card>
        <CreateVolunteerTaskForm />
      </Card>
      <ManageTaskActions />
    </section>
  );
}
