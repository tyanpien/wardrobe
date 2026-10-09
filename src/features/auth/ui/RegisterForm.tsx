"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  validateEmail,
  validateName,
  validatePassword,
} from "../model/validation";

import styles from "./AuthForm.module.css";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [agreeError, setAgreeError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.push(from);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setAgreeError("");

    const nextNameError = validateName(name);
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    const nextAgreeError = agree
      ? ""
      : "Необходимо согласиться с обработкой персональных данных";

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setAgreeError(nextAgreeError);

    if (
      nextNameError ||
      nextEmailError ||
      nextPasswordError ||
      nextAgreeError
    ) {
      return;
    }

    setIsSubmitting(true);

    /*
     * Backend пока отсутствует.
     * После прохождения frontend-валидации
     * считаем регистрацию успешной.
     *
     * Позже здесь будет API-запрос регистрации.
     */

    router.push(
      `/register/success?from=${encodeURIComponent(from)}`
    );
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

                <span className={styles.authTitle}>Регистрация</span>
            </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="register-name">Имя</label>

              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError("");
                }}
                placeholder="Введите ваше имя"
                autoComplete="name"
                className={nameError ? styles.inputError : ""}
              />

              {nameError && (
                <span className={styles.error}>{nameError}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="register-email">E-mail</label>

              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError("");
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
              <label htmlFor="register-password">Пароль</label>

              <div className={styles.passwordWrapper}>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Придумайте пароль"
                  autoComplete="new-password"
                  className={passwordError ? styles.inputError : ""}
                />

                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Скрыть пароль"
                      : "Показать пароль"
                  }
                >
                  <Image
                    src={
                      showPassword
                        ? "/eye-close.svg"
                        : "/eye.svg"
                    }
                    alt=""
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              {passwordError && (
                <span className={styles.error}>
                  {passwordError}
                </span>
              )}
            </div>

            <label className={styles.agreement}>
                <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) => {
                    setAgree(event.target.checked);
                    setAgreeError("");
                    }}
                />

                <span className={styles.customCheckbox}>
                    {agree && (
                    <img
                        src="/galochka.svg"
                        alt=""
                        className={styles.checkboxIcon}
                    />
                    )}
                </span>

                <span className={styles.agreementText}>
                    Я даю согласие на{" "}
                    <span className={styles.agreementLink}>
                    обработку персональных данных
                    </span>
                </span>
            </label>

            {agreeError && (
              <span className={styles.error}>
                {agreeError}
              </span>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Создаем аккаунт..."
                : "Зарегистрироваться"}
            </button>
          </form>

          <p className={styles.switchText}>
            Уже есть аккаунт?{" "}
            <Link
              href={`/login?from=${encodeURIComponent(from)}`}
              className={styles.switchLink}
            >
              Войти
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}