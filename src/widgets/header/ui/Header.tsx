"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/organizations", label: "Организации" },
  { href: "/volunteer", label: "Волонтерам" },
];

export function Header() {
  const pathname = usePathname();
  
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
        <Link href={`/login?from=${encodeURIComponent(pathname)}`}>
          Войти
        </Link>
      </div>
    </header>
  );
}
