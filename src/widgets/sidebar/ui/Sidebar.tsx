"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getMyOrganizations } from "@/entities/organization/api";
import type { MyOrganization } from "@/entities/organization/model/dto";
import { env } from "@/shared/config";
import styles from "./Sidebar.module.css";

type SidebarLink = { href: string; label: string; key?: string };
type SidebarProps = { variant?: "user" | "organization"; activePage?: string };

const ORGANIZATION_LINKS: SidebarLink[] = [
  { href: "/organization", label: "Страница организации", key: "overview" },
  { href: "/organization/transfers", label: "Передачи", key: "transfers" },
  { href: "/messages", label: "Сообщения", key: "messages" },
  { href: "/organization/employees", label: "Сотрудники", key: "employees" },
  { href: "/organization/volunteer", label: "Волонтёрство", key: "volunteer" },
];

function resolveLogo(path: string | null): string | null {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return new URL(path, env.apiUrl).toString();
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("ru") ?? "").join("");
}

export function Sidebar({ variant = "user", activePage }: SidebarProps) {
  const isOrganization = variant === "organization";
  const [organization, setOrganization] = useState<MyOrganization | null>(null);
  const [organizationLoading, setOrganizationLoading] = useState(isOrganization);
  const links = ORGANIZATION_LINKS;

  useEffect(() => {
    if (!isOrganization) return;
    let cancelled = false;
    getMyOrganizations()
      .then((items) => { if (!cancelled) setOrganization(items[0] ?? null); })
      .catch(() => { if (!cancelled) setOrganization(null); })
      .finally(() => { if (!cancelled) setOrganizationLoading(false); });
    return () => { cancelled = true; };
  }, [isOrganization]);

  const logoUrl = resolveLogo(organization?.logoUrl ?? null);

  return (
    <aside className={`${styles.aside} ${isOrganization ? styles.organizationAside : ""}`}>
      {isOrganization && (
        <div className={styles.organizationBrand}>
          {logoUrl ? (
            <img className={styles.organizationLogo} src={logoUrl} alt={`Логотип ${organization?.name ?? "организации"}`} />
          ) : (
            <div className={styles.organizationLogo} aria-hidden="true">
              {organization?.name ? getInitials(organization.name) : "ДШ"}
            </div>
          )}
          <div>
            <strong>{organizationLoading ? "Загрузка..." : organization?.name ?? "Организация"}</strong>
            <span>Кабинет организации</span>
          </div>
        </div>
      )}

      <nav className={styles.nav} aria-label="Кабинет">
        {links.map((link) => {
          const isActive = isOrganization && (activePage ? link.key === activePage : link.href === "/organization");
          return <Link key={link.href} href={link.href} className={`${styles.link} ${isActive ? styles.activeLink : ""}`}>{link.label}</Link>;
        })}
      </nav>

      {isOrganization && (
        <Link href={organization?.id ? `/organizations/${organization.id}` : "/organizations"} className={styles.publicLink}>
          Открыть публичную страницу
        </Link>
      )}
    </aside>
  );
}
