"use client";

import styles from "./StartTransferModal.module.css";

type Props = {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onStart: () => void;
};

export function StartTransferModal({ open, loading = false, onCancel, onStart }: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onMouseDown={onCancel}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-transfer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="start-transfer-title">Начать передачу вещи?</h2>
        <p>После этого обе стороны смогут подтвердить фактическую передачу.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel} disabled={loading}>
            Отмена
          </button>
          <button type="button" className={styles.start} onClick={onStart} disabled={loading}>
            {loading ? "Запускаем…" : "Начать"}
          </button>
        </div>
      </section>
    </div>
  );
}