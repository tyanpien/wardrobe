"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Header.module.css";
import { getAvatarUrl } from "@/entities/user/api/profile";

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

  function logout() {
    localStorage.removeItem("dobry-shkaf-user");
    window.dispatchEvent(new Event("dobry-shkaf-user-updated"));
    setUser(null);
    setMenuOpen(false);
    router.push("/login");
  }

  const publicUserId = user?.id || user?.email || "1";

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
                    href={`/users/${encodeURIComponent(publicUserId)}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Моя публичная страница
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