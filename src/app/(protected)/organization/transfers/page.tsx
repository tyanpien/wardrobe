"use client";

import { useState } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import styles from "./page.module.css";

type TransferStatus = "pending_owner" | "pending_org" | "completed";

type Transfer = {
  id: string;
  title: string;
  userName: string;
  address: string;
  status: TransferStatus;
};

const INITIAL_TRANSFERS: Transfer[] = [
  {
    id: "t-1",
    title: "Куртка демисезонная",
    userName: "Анна",
    address: "ул. Ленина, 15",
    status: "pending_owner",
  },
  {
    id: "t-2",
    title: "Детские книги",
    userName: "Мария",
    address: "ул. Победы, 42",
    status: "pending_org",
  },
  {
    id: "t-3",
    title: "Плед и полотенца",
    userName: "Илья",
    address: "ул. Татищева, 88",
    status: "completed",
  },
];

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>(INITIAL_TRANSFERS);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  const confirmTransferReceipt = (id: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "completed" } : t))
    );
    if (selectedTransfer?.id === id) {
      setSelectedTransfer((prev) => (prev ? { ...prev, status: "completed" } : null));
    }
  };

  const pendingOwnerCount = transfers.filter((t) => t.status === "pending_owner").length;
  const pendingOrgCount = transfers.filter((t) => t.status === "pending_org").length;

  return (
    <main className={styles.page}>
      <Sidebar variant="organization" activePage="transfers" />

      <section className={styles.content}>
        {!selectedTransfer && (
          <>
            <header className={styles.pageHeader}>
              <div>
                <h1>Передачи</h1>
                <p>
                  Подтверждайте только фактически полученные вещи. Передача завершается после
                  подтверждения обеих сторон.
                </p>
              </div>
            </header>

            <div className={styles.tabs}>
              <span className={`${styles.tab} ${styles.tabActiveDark}`}>
                Ожидают пользователя: {pendingOwnerCount}
              </span>
              <span className={`${styles.tab} ${styles.tabActiveLight}`}>
                Нужно подтвердить: {pendingOrgCount}
              </span>
            </div>

            <div className={styles.transfersList}>
              {transfers.map((transfer) => (
                <article
                  key={transfer.id}
                  className={styles.transferCard}
                  onClick={() => setSelectedTransfer(transfer)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.transferHeader}>
                    <h2>{transfer.title}</h2>
                    {transfer.status === "pending_owner" && (
                      <span className={`${styles.badge} ${styles.badgePendingOwner}`}>
                        Ожидает передачи владельцем
                      </span>
                    )}
                    {transfer.status === "pending_org" && (
                      <span className={`${styles.badge} ${styles.badgePendingOrg}`}>
                        Владелец подтвердил передачу
                      </span>
                    )}
                    {transfer.status === "completed" && (
                      <span className={`${styles.badge} ${styles.badgeCompleted}`}>
                        Передача завершена
                      </span>
                    )}
                  </div>
                  <p className={styles.transferMeta}>
                    {transfer.userName} · {transfer.address}
                  </p>

                  {transfer.status === "pending_org" && (
                    <button
                      className={styles.confirmButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmTransferReceipt(transfer.id);
                      }}
                    >
                      Подтвердить получение
                    </button>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        {selectedTransfer && (
          <>
            <button className={styles.backButton} onClick={() => setSelectedTransfer(null)}>
              ← Передачи
            </button>

            <div className={styles.sectionHeading}>
              <h1>Передача вещи</h1>
            </div>

            <div className={styles.detailCard}>
              <span className={`${styles.badge} ${styles.badgePendingOrg}`} style={{ marginBottom: "16px" }}>
                Владелец подтвердил передачу
              </span>
              <h2 className={styles.detailTitle}>
                {selectedTransfer.title} · {selectedTransfer.userName} · {selectedTransfer.address}
              </h2>
              <p className={styles.detailHint}>
                Владелец отметил действие «Передал организации». Подтвердите получение только после
                фактического приёма вещи.
              </p>
            </div>

            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <span className={styles.timelineIconDone}>✓</span>
                <span className={styles.timelineText}>Передача создана</span>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineIconDone}>✓</span>
                <span className={styles.timelineText}>Владелец подтвердил фактическую передачу</span>
              </div>
              <div className={styles.timelineItem}>
                {selectedTransfer.status === "completed" ? (
                  <span className={styles.timelineIconDone}>✓</span>
                ) : (
                  <span className={styles.timelineIconPending}>○</span>
                )}
                <span className={styles.timelineText}>Ожидается подтверждение организации</span>
              </div>
            </div>

            {selectedTransfer.status === "pending_org" && (
              <button 
                className={styles.confirmButton} 
                onClick={() => confirmTransferReceipt(selectedTransfer.id)}
              >
                Подтвердить получение
              </button>
            )}
            
            {selectedTransfer.status === "completed" && (
              <p className={styles.muted}>Передача успешно завершена!</p>
            )}
          </>
        )}
      </section>
    </main>
  );
}