
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
  const [editAccessEnabled, setEditAccessEnabled] = useState(false);
  const [editMode, setEditMode] = useState<"all" | "selected">("selected");

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

      const loadedPermissions = current.permissions.filter(
        (value) => value !== "chat",
      );

      setPermissions(loadedPermissions);

      const hasEditPermission =
        loadedPermissions.includes("edit_profile") ||
        EDIT_PERMISSIONS.some((permission) =>
          loadedPermissions.includes(permission),
        );

      setEditAccessEnabled(hasEditPermission);

      setEditMode(
        loadedPermissions.includes("edit_profile")
          ? "all"
          : "selected",
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

  const handleEditAccessChange = (checked: boolean) => {
    setEditAccessEnabled(checked);

    if (checked) {
      setEditMode("all");

      setPermissions((current) => [
        ...new Set([...current, "edit_profile"]),
      ]);

      return;
    }

    setEditMode("selected");

    setPermissions((current) =>
      current.filter(
        (item) =>
          item !== "edit_profile" &&
          !EDIT_PERMISSIONS.includes(
            item as (typeof EDIT_PERMISSIONS)[number],
          ),
      ),
    );
  };

  const handleSelectAllMode = () => {
    setEditMode("all");

    setPermissions((current) => [
      ...new Set([...current, "edit_profile"]),
    ]);
  };

  const handleSelectBlocksMode = () => {
    setEditMode("selected");

    setPermissions((current) =>
      current.filter((item) => item !== "edit_profile"),
    );
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!organization || !member) return;

    const normalized: OrganizationPermission[] = permissions.filter(
      (item) =>
        !EDIT_PERMISSIONS.includes(
          item as (typeof EDIT_PERMISSIONS)[number],
        ) && item !== "edit_profile",
    ) as OrganizationPermission[];

    if (editAccessEnabled && editMode === "all") {
      normalized.push("edit_profile");
    } else if (editAccessEnabled && editMode === "selected") {

      if (
        permissions.includes("edit_general_info") ||
        permissions.includes("edit_contacts")
      ) {
        normalized.push("edit_general_info", "edit_contacts");
      }

      if (permissions.includes("edit_acceptance_rules")) {
        normalized.push("edit_acceptance_rules");
      }

      if (permissions.includes("edit_addresses")) {
        normalized.push("edit_addresses");
      }
    }

    setSaving(true);
    setError("");

    try {
      await updateOrganizationMemberPermissions(
        organization.id,
        member.id,
        [...new Set(normalized)],
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
                    checked={editAccessEnabled}
                    onChange={(event) =>
                      handleEditAccessChange(event.target.checked)
                    }
                  />

                  Редактировать информацию организации
                </label>

                {editAccessEnabled && (
                  <div className={styles.nestedPermissions}>
                    <label className={styles.customRadioLabel}>
                      <input
                        type="radio"
                        name="editType"
                        className={styles.radio}
                        checked={editMode === "all"}
                        onChange={handleSelectAllMode}
                      />

                      Вся страница
                    </label>

                    <label className={styles.customRadioLabel}>
                      <input
                        type="radio"
                        name="editType"
                        className={styles.radio}
                        checked={editMode === "selected"}
                        onChange={handleSelectBlocksMode}
                      />

                      Только выбранные блоки
                    </label>

                    {editMode === "selected" && (
                      <div className={styles.subBlocks}>
                        <label className={styles.customCheckboxLabel}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={
                              permissions.includes("edit_general_info") ||
                              permissions.includes("edit_contacts")
                            }
                            onChange={(event) =>
                              setPermissions((current) =>
                                event.target.checked
                                  ? [
                                      ...current.filter(
                                        (item) =>
                                          item !== "edit_general_info" &&
                                          item !== "edit_contacts",
                                      ),
                                      "edit_general_info",
                                      "edit_contacts",
                                    ]
                                  : current.filter(
                                      (item) =>
                                        item !== "edit_general_info" &&
                                        item !== "edit_contacts",
                                    ),
                              )
                            }
                          />

                          Основная информация
                        </label>

                        <label className={styles.customCheckboxLabel}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={permissions.includes(
                              "edit_acceptance_rules",
                            )}
                            onChange={(event) =>
                              toggle(
                                "edit_acceptance_rules",
                                event.target.checked,
                              )
                            }
                          />

                          Правила приёма
                        </label>

                        <label className={styles.customCheckboxLabel}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={permissions.includes("edit_addresses")}
                            onChange={(event) =>
                              toggle(
                                "edit_addresses",
                                event.target.checked,
                              )
                            }
                          />

                          Пункты приёма
                        </label>
                      </div>
                    )}
                  </div>
                )}

                <label
                  className={styles.customCheckboxLabel}
                  style={{ marginTop: "8px" }}
                >
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={permissions.includes(
                      "manage_volunteer_tasks",
                    )}
                    onChange={(event) =>
                      toggle(
                        "manage_volunteer_tasks",
                        event.target.checked,
                      )
                    }
                  />

                  Создавать и управлять волонтёрскими задачами
                </label>

                <label className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={permissions.includes(
                      "review_volunteer_responses",
                    )}
                    onChange={(event) =>
                      toggle(
                        "review_volunteer_responses",
                        event.target.checked,
                      )
                    }
                  />

                  Рассматривать отклики волонтёров
                </label>

                <label className={styles.customCheckboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={permissions.includes("confirm_transfers")}
                    onChange={(event) =>
                      toggle(
                        "confirm_transfers",
                        event.target.checked,
                      )
                    }
                  />

                  Подтверждать получение вещей
                </label>
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
