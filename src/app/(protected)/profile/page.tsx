import { LogoutButton } from "@/features/auth";
import { UpdateProfileForm } from "@/features/update-profile";
import { Card, PageHeader } from "@/shared/ui";
import { EcoTracker } from "@/widgets/eco-tracker";
import { stubEcoStats } from "@/shared/lib/stubs";

export default function ProfilePage() {
  return (
    <section>
      <PageHeader
        title="Профиль"
        description="Личные данные, статус волонтера, история обменов и экологический трекер."
        actions={<LogoutButton />}
      />
      <Card>
        <UpdateProfileForm />
      </Card>
      <h2>Эко-трекер</h2>
      <EcoTracker stats={stubEcoStats} />
    </section>
  );
}
