import styles from "./State.module.css";

type ErrorStateProps = {
  title?: string;
  message?: string;
};

export function ErrorState({
  title = "Не удалось загрузить данные",
  message = "Попробуйте обновить страницу позже.",
}: ErrorStateProps) {
  return (
    <div className={`${styles.state} ${styles.error}`} role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
