"use client";

import { Button } from "@/shared/ui";

export function ConfirmTransferActions() {
  return (
    <div>
      <Button>Подтвердить передачу</Button>
      <Button variant="secondary">Получил вещь</Button>
      <Button variant="ghost">Передал организации</Button>
    </div>
  );
}
