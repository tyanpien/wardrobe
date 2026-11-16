
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";

import {
  getMyOrganizations,
  getOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMemberPermissions,
} from "@/entities/organization/api";

import type { MyOrganization } from "@/entities/organization/model/dto";

import type {
  OrganizationMemberDto,
  OrganizationPermission,
} from "@/entities/organization/api/organizations";

import { getApiErrorMessage } from "@/shared/api/errors";
import { OrganizationPermissionGuard } from "@/shared/ui/OrganizationPermissionGuard/OrganizationPermissionGuard";

import styles from "../page.module.css";

const EDIT_PERMISSIONS = [
  "edit_general_info",
  "edit_contacts",
  "edit_acceptance_rules",
  "edit_addresses",
] as const;

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const memberId = params.id;

  const [organization, setOrganization] =
    useState<MyOrganization | null>(null);

  const [member, setMember] =
    useState<OrganizationMemberDto | null>(null);

  const [permissions, setPermissions] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const org = (await getMyOrganizations())[0] ?? null;

      setOrganization(org);

      if (!org) {
        throw new Error("Организация не найдена.");
      }

      const members = await getOrganizationMembers(org.id);

      const current = members.find(
        (item) => item.id === memberId,
      );

      if (!current) {
        throw new Error("Сотрудник не найден.");
      }

      setMember(current);

      setPermissions(
        current.permissions.filter((value) => value !== "chat"),
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Не удалось загрузить права сотрудника.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = (permission: string, checked: boolean) => {
    setPermissions((current) =>
      checked
        ? [...new Set([...current, permission])]
        : current.filter((item) => item !== permission),
    );
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!organization || !member) return;

    const normalized = permissions.includes("edit_profile")
      ? permissions.filter(
          (item) =>
            !EDIT_PERMISSIONS.includes(
              item as (typeof EDIT_PERMISSIONS)[number],
            ),
        )
      : permissions;

    setSaving(true);
    setError("");

    try {
      await updateOrganizationMemberPermissions(
        organization.id,
        member.id,
        normalized as OrganizationPermission[],
      );

      router.push("/organization/employees");
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Не удалось сохранить права.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !organization ||
      !member ||
      !window.confirm(
        "Вы уверены, что хотите удалить сотрудника из организации?",
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await removeOrganizationMember(
        organization.id,
        member.id,
      );

      router.push("/organization/employees");
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Не удалось удалить сотрудника.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <Sidebar variant="organization" activePage="employees" />

      <section className={styles.content}>
        <OrganizationPermissionGuard
          requiredPermissions={["manage_members"]}
        >
          <Link
            href="/organization/employees"
            className={styles.backButton}
          >
            ← Сотрудники
          </Link>

          <div className={styles.sectionHeading}>
            <h1>Права доступа</h1>

            <p>
              {member
                ? `${member.name} · сотрудник · ${member.email}`
                : "Настройка доступа сотрудника"}
            </p>
          </div>

          {loading && (
            <p role="status">Загружаем права...</p>
          )}

          {error && (
            <p role="alert">{error}</p>
          )}

          {!loading && member && (
            <form
              className={styles.formPage}
              onSubmit={handleSave}
            >
              <div className={styles.permissionsBlock}>
                <h2>Права доступа</h2>

                <label className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={permissions.includes("edit_profile")}
                    onChange={(event) =>
                      setPermissions((current) =>
                        event.target.checked
                          ? [
                              ...current.filter(
                                (item) =>
                                  !EDIT_PERMISSIONS.includes(
                                    item as (typeof EDIT_PERMISSIONS)[number],
                                  ),
                              ),
                              "edit_profile",
                            ]
                          : current.filter(
                              (item) => item !== "edit_profile",
                            ),
                      )
                    }
                  />
                  Редактировать всю страницу организации
                </label>

                <div className={styles.subBlocks}>
                  {(
                    [
                      ["edit_general_info", "Основная информация"],
                      ["edit_contacts", "Контактные данные"],
                      ["edit_acceptance_rules", "Правила приёма"],
                      ["edit_addresses", "Пункты приёма"],
                    ] as const
                  ).map(([permission, label]) => (
                    <label
                      className={styles.customCheckboxLabel}
                      key={permission}
                    >
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={
                          permissions.includes("edit_profile") ||
                          permissions.includes(permission)
                        }
                        disabled={permissions.includes("edit_profile")}
                        onChange={(event) =>
                          toggle(permission, event.target.checked)
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {(
                  [
                    [
                      "manage_volunteer_tasks",
                      "Создавать и управлять волонтёрскими задачами",
                    ],
                    [
                      "review_volunteer_responses",
                      "Рассматривать отклики волонтёров",
                    ],
                    [
                      "confirm_transfers",
                      "Подтверждать получение вещей",
                    ],
                  ] as const
                ).map(([permission, label]) => (
                  <label
                    className={styles.customCheckboxLabel}
                    key={permission}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={permissions.includes(permission)}
                      onChange={(event) =>
                        toggle(permission, event.target.checked)
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className={styles.infoBanner}>
                Подключённый сотрудник без дополнительных прав
                может вести переписку от имени организации.
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={saving}
                >
                  {saving
                    ? "Сохраняем..."
                    : "Сохранить изменения"}
                </button>

                <Link
                  href="/organization/employees"
                  className={styles.secondaryButton}
                >
                  Отмена
                </Link>
              </div>

              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => void handleDelete()}
                disabled={saving}
              >
                Удалить из организации
              </button>
            </form>
          )}
        </OrganizationPermissionGuard>
      </section>
    </main>
  );
}
