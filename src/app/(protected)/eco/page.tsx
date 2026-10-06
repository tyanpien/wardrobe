import { PageHeader } from "@/shared/ui";
import { EcoTracker } from "@/widgets/eco-tracker";
import { stubEcoStats } from "@/shared/lib/stubs";

export default function EcoPage() {
  return (
    <section>
      <PageHeader
        title="Эко-трекер"
        description="История завершенных передач и расчет текстиля, спасенного от свалки."
      />
      <EcoTracker stats={stubEcoStats} />
    </section>
  );
}
