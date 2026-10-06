import { Container, PageHeader } from "@/shared/ui";
import { ItemCatalog } from "@/widgets/item-catalog";
import { ItemFilters } from "@/widgets/item-filters";
import { stubItems } from "@/shared/lib/stubs";

export default function CatalogPage() {
  return (
    <Container>
      <PageHeader
        title="Каталог вещей"
        description="Поиск по названию и фильтрация по категории, способу передачи, местоположению и состоянию."
      />
      <ItemFilters />
      <ItemCatalog items={stubItems} />
    </Container>
  );
}
