
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Header.module.css";
import { getAvatarUrl } from "@/entities/user/api/profile";
import { getMyOrganizations } from "@/entities/organization/api";
import type { MyOrganization } from "@/entities/organization/model/dto";
import { logoutUser } from "@/shared/api/auth";

type SavedUser = {
  id?: string;
  name?: string;
  city?: string;
  photo?: string;
  email?: string;
};

const NAV_LINKS = [
  { href: "/catalog", label: "Вещи" },
  { href: "/organizations", label: "Организации" },
  { href: "/volunteer", label: "Волонтерство" },
];

export function Header() {
  const router = useRouter();

  const [user, setUser] = useState<SavedUser | null>(null);
  const [organization, setOrganization] =
    useState<MyOrganization | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const readUser = () => {
      try {
        const raw = localStorage.getItem("dobry-shkaf-user");
        setUser(raw ? (JSON.parse(raw) as SavedUser) : null);
      } catch {
        setUser(null);
      }
    };

    readUser();

    window.addEventListener("storage", readUser);
    window.addEventListener("dobry-shkaf-user-updated", readUser);

    return () => {
      window.removeEventListener("storage", readUser);
      window.removeEventListener("dobry-shkaf-user-updated", readUser);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganization() {
      if (!user) {
        setOrganization(null);
        return;
      }

      try {
        const organizations = await getMyOrganizations();

        if (!cancelled) {
          setOrganization(organizations[0] ?? null);
        }
      } catch {
        if (!cancelled) {
          setOrganization(null);
        }
      }
    }

    void loadOrganization();

    const refreshOrganization = () => {
      void loadOrganization();
    };

    window.addEventListener(
      "dobry-shkaf-organization-updated",
      refreshOrganization
    );

    window.addEventListener("focus", refreshOrganization);

    return () => {
      cancelled = true;

      window.removeEventListener(
        "dobry-shkaf-organization-updated",
        refreshOrganization
      );

      window.removeEventListener("focus", refreshOrganization);
    };
  }, [user]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  async function logout() {
    const refreshToken = localStorage.getItem("dobry-shkaf-refresh-token");

    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch (error) {
      console.error("Не удалось завершить сессию на сервере:", error);
    } finally {
      localStorage.removeItem("dobry-shkaf-user");
      localStorage.removeItem("dobry-shkaf-access-token");
      localStorage.removeItem("dobry-shkaf-refresh-token");

      window.dispatchEvent(new Event("dobry-shkaf-user-updated"));

      setUser(null);
      setOrganization(null);
      setMenuOpen(false);

      router.push("/login");
    }
  }

  const publicUserId = user?.id || user?.email || "1";

  const organizationHref = organization
    ? "/organization"
    : "/organization/create";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Добрый шкаф
        </Link>

        <nav className={styles.nav} aria-label="Основная навигация">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.link}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link
            href="/notifications"
            className={styles.iconLink}
            aria-label="Уведомления"
            title="Уведомления"
          >
            <img src="/call.svg" alt="" />
          </Link>

          <Link
            href="/messages"
            className={styles.iconLink}
            aria-label="Сообщения"
            title="Сообщения"
          >
            <img src="/sms.svg" alt="" />
          </Link>

          {user ? (
            <div className={styles.profileMenuWrap} ref={menuRef}>
              <Link
                href="/profile"
                className={styles.profileLink}
                aria-label="Личный кабинет"
                title="Личный кабинет"
              >
                {user.photo ? (
                  <img
                    className={styles.avatar}
                    src={getAvatarUrl(user.photo ?? null)}
                    alt=""
                  />
                ) : (
                  <span className={styles.avatarFallback}>
                    {(user.name || "П").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </Link>

              <button
                type="button"
                className={styles.chevronButton}
                aria-label="Открыть меню профиля"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <img
                  src="/strelka-white.svg"
                  alt=""
                  className={`${styles.chevron} ${
                    menuOpen ? styles.chevronOpen : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div className={styles.profileDropdown}>
                  <Link
                    href="/profile"
                    aria-label="Личный кабинет"
                    title="Личный кабинет"
                  >
                    Моя профиль
                  </Link>

                  <Link
                    href={organizationHref}
                    onClick={() => setMenuOpen(false)}
                  >
                    {organization
                      ? "Управление организацией"
                      : "Создать организацию"}
                  </Link>

                  <button type="button" onClick={logout}>
                    Выйти из профиля
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.loginLink}>
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
