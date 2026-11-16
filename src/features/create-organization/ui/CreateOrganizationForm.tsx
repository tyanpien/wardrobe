
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createOrganization } from "@/entities/organization/api";
import { getApiErrorMessage } from "@/shared/api/errors";
import styles from "./CreateOrganizationForm.module.css";

export function CreateOrganizationForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) {
      setError("Введите название организации.");
      return;
    }

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setError("Введите корректный адрес электронной почты.");
      return;
    }

    setIsSubmitting(true);

    try {
      const organization = await createOrganization({
        name: normalizedName,
        email: normalizedEmail,
      });

      window.dispatchEvent(
        new Event("dobry-shkaf-organization-updated")
      );

      router.replace(`/organizations/${organization.id}`);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Не удалось создать организацию."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link href="/profile" className={styles.backLink}>
          ← Вернуться в профиль
        </Link>

        <h1>Создание организации</h1>

        <p className={styles.description}>
          Укажите название и контактную почту. Остальную информацию
          можно будет заполнить позже.
        </p>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
        >
          <label className={styles.field} htmlFor="organization-name">
            <span>Название организации</span>

            <input
              id="organization-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              autoComplete="organization"
              required
            />
          </label>

          <label className={styles.field} htmlFor="organization-email">
            <span>Электронная почта организации</span>

            <input
              id="organization-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Создаём..." : "Создать организацию"}
          </button>
        </form>
      </section>
    </main>
  );
}
