import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>Добрый шкаф — передача вещей, помощь организациям и волонтерство.</p>
      </div>
    </footer>
  );
}
