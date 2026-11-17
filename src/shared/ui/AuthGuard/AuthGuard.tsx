
"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SavedUser = {
  id?: string;
};

const ACCESS_TOKEN_KEY = "dobry-shkaf-access-token";
const USER_KEY = "dobry-shkaf-user";

function hasValidLocalSession(): boolean {
  if (typeof window === "undefined") return false;

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  if (!token || !rawUser) return false;

  try {
    const user = JSON.parse(rawUser) as SavedUser;
    return Boolean(user.id);
  } catch {
    return false;
  }
}

export function AuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      if (hasValidLocalSession()) {
        setAuthorized(true);
        return;
      }

      setAuthorized(false);

      const currentPath =
        `${window.location.pathname}${window.location.search}`;

      router.replace(
        `/login?from=${encodeURIComponent(currentPath)}`
      );
    };

    checkSession();

    window.addEventListener("storage", checkSession);
    window.addEventListener(
      "dobry-shkaf-user-updated",
      checkSession
    );

    return () => {
      window.removeEventListener("storage", checkSession);
      window.removeEventListener(
        "dobry-shkaf-user-updated",
        checkSession
      );
    };
  }, [router]);

  if (!authorized) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: "50vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        Проверяем авторизацию...
      </div>
    );
  }

  return <>{children}</>;
}
