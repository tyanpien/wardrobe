"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import styles from "./AuthForm.module.css";

export function RegistrationSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "/";

  const handleSkip = () => {
    router.push("/");
  };

  const handleContinue = () => {
    // Пока переход не реализован.
    // Позже здесь можно открыть страницу
    // заполнения дополнительной информации о пользователе.
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.authImage}>
        <img
          src="/log-photo.png"
          alt=""
          className={styles.successImage}
        />
      </div>

      <section className={styles.authContent}>
        <div className={styles.successWrapper}>
          <div className={styles.successIcon}>
            <span><img src="/success.svg" /></span>
          </div>

          <h1 className={styles.successTitle}>
            Вы успешно
            <br />
            зарегистрировались!
          </h1>

          <p className={styles.successDescription}>
            Вы можете дополнить информацию о себе.
          </p>

          <div className={styles.successActions}>
            <button
              type="button"
              className={styles.successContinue}
              onClick={handleContinue}
            >
              Перейти
            </button>

            <button
              type="button"
              className={styles.successSkip}
              onClick={handleSkip}
            >
              Пропустить
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}