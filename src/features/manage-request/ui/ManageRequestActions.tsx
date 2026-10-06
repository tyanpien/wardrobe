"use client";

import { Button } from "@/shared/ui";

export function ManageRequestActions() {
  return (
    <div>
      <Button>Принять запрос</Button>
      <Button variant="secondary">Отклонить запрос</Button>
    </div>
  );
}
