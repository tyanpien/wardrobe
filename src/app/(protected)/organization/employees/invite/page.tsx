
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";

import {
  createOrganizationInvitation,
  getMyOrganizations,
} from "@/entities/organization/api";

import type { MyOrganization } from "@/entities/organization/model/dto";
import type { OrganizationPermission } from "@/entities/organization/api/organizations";

import { getApiErrorMessage } from "@/shared/api/errors";
import { OrganizationPermissionGuard } from "@/shared/ui/OrganizationPermissionGuard/OrganizationPermissionGuard";

import styles from "../page.module.css";

export default function InviteEmployeePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [organization, setOrganization] =
    useState<MyOrganization | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    getMyOrganizations()
      .then((items) => setOrganization(items[0] ?? null))
      .catch((error) =>
        setRequestError(getApiErrorMessage(error)),
      )
      .finally(() => setLoading(false));
  }, []);

  const [editAccess, setEditAccess] = useState(true);
  const [editType, setEditType] = useState<"all" | "selected">(
    "selected",
  );

  const [blocks, setBlocks] = useState({
    info: true,
    rules: true,
    points: false,
  });

  const [tasksAccess, setTasksAccess] = useState(true);
  const [reviewsAccess, setReviewsAccess] = useState(true);
  const [confirmAccess, setConfirmAccess] = useState(true);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Введите корректный e-mail");
      return;
    }

    if (!organization) {
      setRequestError("Не удалось определить организацию.");
      return;
    }

    const permissions: OrganizationPermission[] = [];

    if (editAccess) {
      if (editType === "all") {
        permissions.push("edit_profile");
      } else {
        if (blocks.info) {
          permissions.push(
            "edit_general_info",
            "edit_contacts",
          );
        }

        if (blocks.rules) {
          permissions.push("edit_acceptance_rules");
        }

        if (blocks.points) {
          permissions.push("edit_addresses");
        }
      }
    }

    if (tasksAccess) {
      permissions.push("manage_volunteer_tasks");
    }

    if (reviewsAccess) {
      permissions.push("review_volunteer_responses");
    }

    if (confirmAccess) {
      permissions.push("confirm_transfers");
    }

    setEmailError("");
    setRequestError("");
    setSaving(true);

    try {
      await createOrganizationInvitation(
        organization.id,
        email,
        [...new Set(permissions)],
      );

      router.push("/organization/employees");
    } catch (error) {
      setRequestError(
        getApiErrorMessage(
          error,
          "Не удалось отправить приглашение.",
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
            <h1>Пригласить сотрудника</h1>
            <p>
              После принятия приглашения пользователь получает
              выбранные права.
            </p>
          </div>

          {loading && (
            <p role="status">Загружаем данные организации...</p>
          )}

          {requestError && (
            <p role="alert">{requestError}</p>
          )}

          <form
            className={styles.formPage}
            onSubmit={handleSubmit}
          >
            <label className={styles.fieldLabel}>
              E-mail сотрудника

              <input
                type="email"
                placeholder="Введите e-mail"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (emailError) {
                    setEmailError("");
                  }
                }}
                className={emailError ? styles.inputError : ""}
              />

              {emailError && (
                <span className={styles.errorText}>
                  {emailError}
                </span>
              )}
            </label>

            <div className={styles.permissionsBlock}>
              <h2>Права доступа</h2>

              <label className={styles.customCheckboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={editAccess}
                  onChange={(event) =>
                    setEditAccess(event.target.checked)
                  }
                />
                Редактировать информацию организации
              </label>

              {editAccess && (
                <div className={styles.nestedPermissions}>
                  <label className={styles.customRadioLabel}>
                    <input
                      type="radio"
                      name="editType"
                      className={styles.radio}
                      checked={editType === "all"}
                      onChange={() => setEditType("all")}
                    />
                    Вся страница
                  </label>

                  <label className={styles.customRadioLabel}>
                    <input
                      type="radio"
                      name="editType"
                      className={styles.radio}
                      checked={editType === "selected"}
                      onChange={() => setEditType("selected")}
                    />
                    Только выбранные блоки
                  </label>

                  {editType === "selected" && (
                    <div className={styles.subBlocks}>
                      <label className={styles.customCheckboxLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={blocks.info}
                          onChange={(event) =>
                            setBlocks({
                              ...blocks,
                              info: event.target.checked,
                            })
                          }
                        />
                        Основная информация
                      </label>

                      <label className={styles.customCheckboxLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={blocks.rules}
                          onChange={(event) =>
                            setBlocks({
                              ...blocks,
                              rules: event.target.checked,
                            })
                          }
                        />
                        Правила приёма
                      </label>

                      <label className={styles.customCheckboxLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={blocks.points}
                          onChange={(event) =>
                            setBlocks({
                              ...blocks,
                              points: event.target.checked,
                            })
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
                  checked={tasksAccess}
                  onChange={(event) =>
                    setTasksAccess(event.target.checked)
                  }
                />
                Создавать и управлять волонтёрскими задачами
              </label>

              <label className={styles.customCheckboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={reviewsAccess}
                  onChange={(event) =>
                    setReviewsAccess(event.target.checked)
                  }
                />
                Рассматривать отклики волонтёров
              </label>

              <label className={styles.customCheckboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={confirmAccess}
                  onChange={(event) =>
                    setConfirmAccess(event.target.checked)
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
                disabled={loading || saving || !organization}
              >
                {saving
                  ? "Отправляем..."
                  : "Отправить приглашение"}
              </button>

              <Link
                href="/organization/employees"
                className={styles.secondaryButton}
              >
                Отмена
              </Link>
            </div>
          </form>
        </OrganizationPermissionGuard>
      </section>
    </main>
  );
}
