import type { EcoStats } from "@/entities/eco-stats";
import { Card, EmptyState } from "@/shared/ui";
import styles from "./EcoTracker.module.css";

type EcoTrackerProps = {
  stats: EcoStats;
};

export function EcoTracker({ stats }: EcoTrackerProps) {
  if (stats.completedTransfersCount === 0) {
    return (
      <EmptyState
        title="Пока нет завершенных передач"
        description="В эко-трекере учитываются только фактически состоявшиеся передачи."
      />
    );
  }

  return (
    <div className={styles.grid}>
      <Card>
        <p className={styles.value}>{stats.completedTransfersCount}</p>
        <p className={styles.label}>Завершенных передач</p>
      </Card>
      <Card>
        <p className={styles.value}>{stats.textileSavedAmount}</p>
        <p className={styles.label}>Текстиля спасено от свалки</p>
      </Card>
    </div>
  );
}
