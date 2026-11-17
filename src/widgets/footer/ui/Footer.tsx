import styles from "./Footer.module.css";
import Link from "next/link";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.columnLeft}>
            <h3 className={styles.logoTitle}>Добрый шкаф</h3>
            <p className={styles.description}>
              Даем вещам вторую жизнь и помогаем тем, кому они нужны.
            </p>
          </div>

          <div className={styles.columnCenter}>
            <h4 className={styles.sectionTitle1}>Разделы</h4>
            <nav className={styles.navList}>
              <a href="/catalog" className={styles.navLink}>Вещи</a>
              <a href="/organizations" className={styles.navLink}>Организации</a>
              <a href="/volunteer" className={styles.navLink}>Волонтерство</a>
            </nav>
          </div>

          <div className={styles.columnRight}>
            <h4 className={styles.sectionTitle}>Есть вещи, которыми готовы поделиться?</h4>
            <p className={styles.description}>
              Разместите объявление — это займет пару минут.
            </p>
            <Link href="/organization/create" className={styles.actionLink}>
              Создать объявление →
            </Link>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <p className={styles.copyright}>© 2026 Добрый шкаф</p>
        </div>
      </div>
    </footer>
  );
}