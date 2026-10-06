"use client";

import { Button } from "@/shared/ui";

export function EditItemActions() {
  return (
    <div>
      <Button variant="secondary">Редактировать объявление</Button>
      <Button variant="ghost">Снять с публикации</Button>
    </div>
  );
}
