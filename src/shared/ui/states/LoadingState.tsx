import styles from "./State.module.css";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Загрузка..." }: LoadingStateProps) {
  return (
    <div className={styles.state} role="status">
      {label}
    </div>
  );
}
