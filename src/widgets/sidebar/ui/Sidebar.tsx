import Link from "next/link";
import styles from "./Sidebar.module.css";

const CABINET_LINKS = [
  { href: "/profile", label: "Профиль" },
  { href: "/my-items", label: "Мои вещи" },
  { href: "/requests", label: "Запросы" },
  { href: "/messages", label: "Сообщения" },
  { href: "/notifications", label: "Уведомления" },
  { href: "/eco", label: "Эко-трекер" },
  { href: "/volunteer/my", label: "Волонтерский раздел" },
  { href: "/organization", label: "Раздел организации" },
];

export function Sidebar() {
  return (
    <aside className={styles.aside}>
      <nav className={styles.nav} aria-label="Кабинет">
        {CABINET_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={styles.link}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
