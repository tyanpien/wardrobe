import styles from "./State.module.css";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className={styles.state}>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
