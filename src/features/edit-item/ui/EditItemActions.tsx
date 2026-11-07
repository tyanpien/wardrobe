"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import styles from "./EditItemActions.module.css";

type EditItemActionsProps = {
  itemId: string;
  status: "published" | "in_transfer" | "transferred" | "unpublished";
  onUnpublish: () => void;
  onPublish?: () => void;
};

export function EditItemActions({
  itemId,
  status,
  onUnpublish,
  onPublish,
}: EditItemActionsProps) {
  const router = useRouter();
  const canEdit = status === "published" || status === "unpublished";

  return (
    <div className={styles.actions}>
      <Button
        type="button"
        variant="secondary"
        disabled={!canEdit}
        onClick={() => router.push(`/my-items/edit/${itemId}`)}
      >
        Редактировать
      </Button>
      {status === "unpublished" && onPublish ? (
        <Button type="button" variant="ghost" onClick={onPublish}>
          Опубликовать
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          disabled={status !== "published"}
          onClick={onUnpublish}
        >
          Снять с публикации
        </Button>
      )}
    </div>
  );
}
