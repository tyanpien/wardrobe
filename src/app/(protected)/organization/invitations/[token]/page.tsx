
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  acceptOrganizationInvitation,
} from "@/entities/organization/api";

import { getApiErrorMessage } from "@/shared/api/errors";
import { getAccessToken } from "@/shared/api/auth-headers";

import styles from "./page.module.css";

export default function AcceptOrganizationInvitationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const token = params.token;

  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (!token || loading) return;

    if (!getAccessToken()) {
      setError(
        "Для принятия приглашения необходимо войти в аккаунт, на который оно было отправлено.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const organization = await acceptOrganizationInvitation(token);

      setOrganizationName(organization.name);
      setAccepted(true);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Не удалось принять приглашение.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push("/organization");
    router.refresh();
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        {accepted ? (
          <>
            <div className={styles.successIcon}><img src='/success.svg'/></div>

            <h1>Приглашение принято!</h1>

            <p className={styles.description}>
              Теперь вы являетесь сотрудником организации
              {organizationName ? ` «${organizationName}»` : ""}.
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleContinue}
            >
              Перейти в организацию
            </button>
          </>
        ) : (
          <>
            <div className={styles.icon}>✉</div>

            <h1>Приглашение в организацию</h1>

            <p className={styles.description}>
              Вас пригласили стать сотрудником организации
              «Добрый шкаф».
              После принятия приглашения вам будут назначены
              права доступа, выбранные владельцем организации.
            </p>

            {!getAccessToken() && (
              <div className={styles.info}>
                Для принятия приглашения необходимо авторизоваться
                под аккаунтом с почтой, на которую оно было отправлено.
              </div>
            )}

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleAccept}
              disabled={loading || !token}
            >
              {loading ? "Принимаем приглашение..." : "Принять приглашение"}
            </button>

            {!getAccessToken() && (
                <Link
                    href={`/login?from=${encodeURIComponent(
                        `/organization/invitations/${token}`,
                    )}`}
                    className={styles.secondaryButton}
                >
                    Войти в аккаунт
                </Link>
            )}

            <Link href="/" className={styles.backLink}>
              Вернуться на главную
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
