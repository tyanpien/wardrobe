
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  getAuthErrorMessage,
  loginUser,
} from "@/shared/api/auth";
import { saveAuthSession } from "../model/session";

import {
  validateEmail,
  validatePassword,
} from "../model/validation";

import styles from "./AuthForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.push(from);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");
    setFormError("");

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      saveAuthSession(result);

      router.push(from);
      router.refresh();
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.authImage}>
        <Image
          src="/log-photo.png"
          alt=""
          fill
          priority
          className={styles.authImageContent}
        />
      </div>

      <section className={styles.authContent}>
        <div className={styles.formWrapper}>
          <div className={styles.authHeader}>
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
              aria-label="Вернуться назад"
            >
              <img src="/eva_arrow-back-fill.svg" alt="Назад" />
            </button>

            <span className={styles.authTitle}>Вход</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError("");
                  setFormError("");
                }}
                placeholder="Введите e-mail"
                autoComplete="email"
                className={emailError ? styles.inputError : ""}
              />
              {emailError && (
                <span className={styles.error}>{emailError}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password">Пароль</label>

              <div className={styles.passwordWrapper}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPasswordError("");
                    setFormError("");
                  }}
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  className={passwordError ? styles.inputError : ""}
                />

                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword ? "Скрыть пароль" : "Показать пароль"
                  }
                >
                  <Image
                    src={showPassword ? "/eye-close.svg" : "/eye.svg"}
                    alt=""
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              {passwordError && (
                <span className={styles.error}>{passwordError}</span>
              )}
            </div>

            <button
              type="button"
              className={styles.forgotPassword}
              onClick={() => {
                setFormError("Восстановление пароля пока не подключено.");
              }}
            >
              Забыли пароль?
            </button>

            {formError && (
              <p role="alert" className={styles.error}>
                {formError}
              </p>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Выполняем вход..." : "Войти"}
            </button>
          </form>

          <p className={styles.switchText}>
            Нет аккаунта?{" "}
            <Link
              href={`/register?from=${encodeURIComponent(from)}`}
              className={styles.switchLink}
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
