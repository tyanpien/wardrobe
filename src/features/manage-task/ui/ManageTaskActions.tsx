"use client";

import { Button } from "@/shared/ui";

export function ManageTaskActions() {
  return (
    <div>
      <Button>Принять отклик</Button>
      <Button variant="secondary">Отклонить отклик</Button>
      <Button variant="ghost">Отметить выполненной</Button>
    </div>
  );
}
