
"use client";

import Link from "next/link";
import styles from "./AccessDenied.module.css";

type AccessDeniedProps = {
  message?: string;
};

export function AccessDenied({
  message = "У вас недостаточно прав для просмотра этого раздела. Обратитесь к владельцу организации, чтобы получить необходимые разрешения.",
}: AccessDeniedProps) {
  return (
    <div className={styles.wrapper} role="alert">
      <div className={styles.icon}>
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </div>

      <h2>Доступ запрещён</h2>

      <p>{message}</p>

      <Link href="/organization" className={styles.button}>
        Вернуться в организацию
      </Link>
    </div>
  );
}
