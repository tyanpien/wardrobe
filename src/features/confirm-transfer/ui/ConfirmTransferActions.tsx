"use client";

import type { Transfer } from "@/entities/chat";
import styles from "./ConfirmTransferActions.module.css";

type Props = {
  transfer: Transfer;
  currentUserId: string;
  loading: boolean;
  onConfirm: () => void;
};

export function ConfirmTransferActions({ transfer, currentUserId, loading, onConfirm }: Props) {
  const isOwner = currentUserId === transfer.ownerId;
  const isRecipient = currentUserId === transfer.recipientId;
  const isCompleted = transfer.status === "completed";
  const currentConfirmed = Boolean(transfer.currentUserConfirmed);
  const otherConfirmed = isOwner ? transfer.recipientConfirmed : transfer.ownerConfirmed;

  if (!isOwner && !isRecipient) return null;

  if (isCompleted) {
    return (
      <section className={styles.panel} aria-live="polite">
        <h3>Передача завершена!</h3>
        <div className={styles.completedButton}>
          {isOwner ? "Вещь передана" : "Вещь получена"}
        </div>
      </section>
    );
  }

  if (currentConfirmed) {
    return (
      <section className={styles.panel} aria-live="polite">
        <h3>Вы подтвердили</h3>
        <p>Осталось подтверждение {isOwner ? "получателя" : "владельца"}.</p>
      </section>
    );
  }

  const canConfirm = Boolean(transfer.canConfirm);
  const title = isOwner
    ? "Отметьте, когда действительно передадите вещь получателю."
    : "Владелец начал передачу. Отметьте, когда действительно получите вещь.";

  return (
    <section className={styles.panel} aria-live="polite">
      <h3>{title}</h3>
      <button type="button" onClick={onConfirm} disabled={!canConfirm || loading}>
        {loading
          ? "Подтверждаем…"
          : isOwner
            ? "Подтвердить передачу"
            : "Подтвердить получение"}
      </button>
      {!canConfirm && <p>Подтверждение сейчас недоступно.</p>}
      {otherConfirmed && <p>Вторая сторона уже подтвердила передачу.</p>}
    </section>
  );
}