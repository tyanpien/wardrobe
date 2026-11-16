
"use client";

import { useEffect, useState, type ReactNode } from "react";

import { getMyOrganizations } from "@/entities/organization/api";
import { AccessDenied } from "@/shared/ui/AccessDenied/AccessDenied";

import styles from "./OrganizationPermissionGuard.module.css";

type OrganizationPermissionGuardProps = {
  children: ReactNode;
  requiredPermissions: string[];
  requireAll?: boolean;
};

export function OrganizationPermissionGuard({
  children,
  requiredPermissions,
  requireAll = false,
}: OrganizationPermissionGuardProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const permissionsKey = requiredPermissions.join("|");

  useEffect(() => {
    let cancelled = false;

    async function checkPermissions() {
      try {
        const organizations = await getMyOrganizations();
        const organization = organizations[0];

        if (!organization) {
          if (!cancelled) {
            setAllowed(false);
          }
          return;
        }

        if (organization.role === "representative") {
          if (!cancelled) {
            setAllowed(true);
          }
          return;
        }

        const permissions = organization.permissions ?? [];
        const permissionsToCheck = permissionsKey
          ? permissionsKey.split("|")
          : [];

        const hasAccess = requireAll
          ? permissionsToCheck.every((permission) =>
              permissions.includes(permission),
            )
          : permissionsToCheck.some((permission) =>
              permissions.includes(permission),
            );

        if (!cancelled) {
          setAllowed(hasAccess);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Не удалось проверить права доступа. Попробуйте обновить страницу.",
          );
          setAllowed(false);
        }
      }
    }

    void checkPermissions();

    return () => {
      cancelled = true;
    };
  }, [permissionsKey, requireAll]);

  if (allowed === null) {
    return (
      <div className={styles.loading} role="status">
        Проверяем права доступа...
      </div>
    );
  }

  if (!allowed) {
    return (
      <AccessDenied
        message={
          error ||
          "У вас недостаточно прав для просмотра этого раздела. Обратитесь к владельцу организации, чтобы получить необходимые разрешения."
        }
      />
    );
  }

  return <>{children}</>;
}
