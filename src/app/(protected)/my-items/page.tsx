import { CreateItemForm } from "@/features/create-item";
import { EditItemActions } from "@/features/edit-item";
import { Card, PageHeader } from "@/shared/ui";
import { ItemCatalog } from "@/widgets/item-catalog";
import { stubItems } from "@/shared/lib/stubs";

export default function MyItemsPage() {
  return (
    <section>
      <PageHeader
        title="Мои вещи"
        description="Опубликованные объявления и управление публикациями."
      />
      <Card>
        <CreateItemForm />
      </Card>
      <EditItemActions />
      <ItemCatalog items={stubItems} />
    </section>
  );
}
