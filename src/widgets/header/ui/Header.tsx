import Link from "next/link";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/organizations", label: "Организации" },
  { href: "/volunteer", label: "Волонтерам" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Добрый шкаф
        </Link>
        <nav className={styles.nav} aria-label="Основная навигация">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Link href="/login">Вход</Link>
          <Link href="/register">Регистрация</Link>
          <Link href="/profile">Профиль</Link>
        </div>
      </div>
    </header>
  );
}
