
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";

import {
  getMyOrganizations,
  getOrganizationInvitations,
  getOrganizationMembers,
  revokeOrganizationInvitation,
} from "@/entities/organization/api";

import type { MyOrganization } from "@/entities/organization/model/dto";
import type {
  OrganizationInvitationDto,
  OrganizationMemberDto,
} from "@/entities/organization/api/organizations";

import { getApiErrorMessage } from "@/shared/api/errors";
import { OrganizationPermissionGuard } from "@/shared/ui/OrganizationPermissionGuard/OrganizationPermissionGuard";

import styles from "./page.module.css";

const PERMISSION_LABELS: Record<string, string> = {
  edit_profile: "Редактирование всей страницы",
  edit_general_info: "Основная информация",
  edit_contacts: "Контактные данные",
  edit_addresses: "Пункты приёма",
  edit_acceptance_rules: "Правила приёма",
  manage_volunteer_tasks: "Волонтёрские задачи",
  review_volunteer_responses: "Отклики волонтёров",
  confirm_transfers: "Подтверждение получения вещей",
  chat: "Переписка",
};

function describePermissions(permissions: string[]): string {
  if (permissions.includes("edit_profile")) {
    return "Редактирование всей страницы";
  }

  const labels = permissions
    .map((permission) => PERMISSION_LABELS[permission])
    .filter(Boolean);

  return labels.length
    ? labels.join(" · ")
    : "Переписка с пользователями";
}

export default function EmployeesPage() {
  const [organization, setOrganization] =
    useState<MyOrganization | null>(null);

  const [members, setMembers] = useState<OrganizationMemberDto[]>([]);
  const [invitations, setInvitations] =
    useState<OrganizationInvitationDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [copiedInvitationId, setCopiedInvitationId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const organizations = await getMyOrganizations();
      const current = organizations[0] ?? null;

      setOrganization(current);

      if (!current) {
        setMembers([]);
        setInvitations([]);
        return;
      }

      const [memberItems, invitationItems] = await Promise.all([
        getOrganizationMembers(current.id),
        getOrganizationInvitations(current.id),
      ]);

      setMembers(memberItems);
      setInvitations(invitationItems);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Не удалось загрузить сотрудников организации.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revokeInvitation = async (
    invitation: OrganizationInvitationDto,
  ) => {
    if (
      !organization ||
      !window.confirm(
        `Отозвать приглашение для ${invitation.email}?`,
      )
    ) {
      return;
    }

    setRevokingId(invitation.id);
    setActionError("");

    try {
      await revokeOrganizationInvitation(
        organization.id,
        invitation.id,
      );

      setInvitations((current) =>
        current.filter((item) => item.id !== invitation.id),
      );
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError));
    } finally {
      setRevokingId(null);
    }
  };

  const copyInvitationLink = async (
    invitation: OrganizationInvitationDto,
  ) => {
    const invitationUrl =
      `${window.location.origin}/organization/invitations/${encodeURIComponent(invitation.token)}`;
  
    try {
      await navigator.clipboard.writeText(invitationUrl);
  
      setCopiedInvitationId(invitation.id);
  
      window.setTimeout(() => {
        setCopiedInvitationId((current) =>
          current === invitation.id ? null : current,
        );
      }, 2500);
    } catch {
      setActionError(
        "Не удалось скопировать ссылку. Проверьте разрешения браузера.",
      );
    }
  };

  return (
    <main className={styles.page}>
      <Sidebar variant="organization" activePage="employees" />

      <section className={styles.content}>
        <OrganizationPermissionGuard
          requiredPermissions={["manage_members"]}
        >
          <header className={styles.pageHeader}>
            <div>
              <h1>Сотрудники</h1>
              <p>
                Управляйте сотрудниками и правами.
                Без дополнительных прав доступна переписка.
              </p>
            </div>

            <Link
              href="/organization/employees/invite"
              className={styles.primaryButton}
            >
              Пригласить
            </Link>
          </header>

          {loading && (
            <p role="status">Загружаем сотрудников...</p>
          )}

          {error && (
            <div role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => void load()}>
                Повторить
              </button>
            </div>
          )}

          {actionError && (
            <p role="alert">{actionError}</p>
          )}

          {!loading && !error && !organization && (
            <p>У вашего аккаунта пока нет организации.</p>
          )}

          {!loading && !error && organization && (
            <>
              <div className={styles.employeesList}>
                {members.map((member) => (
                  <article
                    className={styles.employeeCard}
                    key={member.id}
                  >
                    <div className={styles.employeeInfo}>
                      <h2>{member.name || member.email}</h2>

                      <p>
                        {member.role === "representative"
                          ? "Представитель организации"
                          : `Сотрудник · ${describePermissions(
                              member.permissions,
                            )}`}
                      </p>

                      {member.role === "employee" && (
                        <p>{member.email}</p>
                      )}
                    </div>

                    {member.role === "employee" && (
                      <Link
                        href={`/organization/employees/${member.id}`}
                        className={styles.employeeAction}
                      >
                        Изменить права
                      </Link>
                    )}
                  </article>
                ))}

                {members.length === 0 && (
                  <p>Сотрудников пока нет.</p>
                )}
              </div>

              <div className={styles.pendingSection}>
                <h2>Ожидают принятия</h2>

                {invitations.map((invitation) => (
                  <article className={styles.employeeCard} key={invitation.id}>
                    <div className={styles.employeeInfo}>
                      <h2 className={styles.user}>{invitation.email}</h2>

                      <p>Приглашение отправлено · Ожидает принятия</p>

                      <p>{describePermissions(invitation.permissions)}</p>
                    </div>

                    <div className={styles.invitationActions}>
                      <button
                        type="button"
                        className={styles.employeeAction}
                        onClick={() => void copyInvitationLink(invitation)}
                      >
                        {copiedInvitationId === invitation.id
                          ? "Ссылка скопирована ✓"
                          : "Скопировать ссылку"}
                      </button>

                      <button
                        type="button"
                        className={styles.employeeAction}
                        disabled={revokingId === invitation.id}
                        onClick={() => void revokeInvitation(invitation)}
                      >
                        {revokingId === invitation.id
                          ? "Отзываем..."
                          : "Отозвать"}
                      </button>
                    </div>
                  </article>
                ))}

                {invitations.length === 0 && (
                  <p>Нет ожидающих приглашений.</p>
                )}
              </div>
            </>
          )}
        </OrganizationPermissionGuard>
      </section>
    </main>
  );
}
