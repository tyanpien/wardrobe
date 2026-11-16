import Link from "next/link";
import styles from "./Sidebar.module.css";

type SidebarLink = {
  href: string;
  label: string;
  key?: string;
};

type SidebarProps = {
  variant?: "user" | "organization";
  activePage?: string;
};

const ORGANIZATION_LINKS: SidebarLink[] = [
  { href: "/organization", label: "Страница организации", key: "overview" },
  { href: "/organization/transfers", label: "Передачи", key: "transfers" },
  { href: "/messages", label: "Сообщения", key: "messages" },
  { href: "/organization/employees", label: "Сотрудники", key: "employees" },
  { href: "/organization/volunteer", label: "Волонтёрство", key: "volunteer" },
];

export function Sidebar({ variant = "user", activePage }: SidebarProps) {
  const isOrganization = variant === "organization";
  const links = ORGANIZATION_LINKS;

  return (
    <aside
      className={`${styles.aside} ${
        isOrganization ? styles.organizationAside : ""
      }`}
    >
      {isOrganization && (
        <div className={styles.organizationBrand}>
          <div className={styles.organizationLogo} />
          <div>
            <strong>Добрые вещи</strong>
            <span>Кабинет организации</span>
          </div>
        </div>
      )}

      <nav className={styles.nav} aria-label="Кабинет">
        {links.map((link) => {
          const isActive = isOrganization
            ? activePage
              ? link.key === activePage
              : link.href === "/organization"
            : false;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${
                isActive ? styles.activeLink : ""
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {isOrganization && (
        <Link href="/organizations" className={styles.publicLink}>
          Открыть публичную страницу
        </Link>
      )}
    </aside>
  );
}