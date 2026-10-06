"use client";

import { Button } from "@/shared/ui";

export function RequestItemActions() {
  return (
    <div>
      <Button>Отправить запрос</Button>
      <Button variant="secondary">Предложить обмен</Button>
      <Button variant="ghost">Передать организации</Button>
    </div>
  );
}
