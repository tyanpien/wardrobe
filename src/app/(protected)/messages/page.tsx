import { Suspense } from "react";
import { Chat } from "@/widgets/chat";

export default function MessagesPage() {
  return (
    <Suspense fallback={<p style={{ padding: 32 }}>Загрузка переписки...</p>}>
      <Chat />
    </Suspense>
  );
}