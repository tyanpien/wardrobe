"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import styles from "../page.module.css";

export default function InviteEmployeePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(""); 

  const [editAccess, setEditAccess] = useState(true);
  const [editType, setEditType] = useState<"all" | "selected">("selected");
  
  const [blocks, setBlocks] = useState({
    info: true,
    rules: true,
    points: false,
  });
  
  const [tasksAccess, setTasksAccess] = useState(true);
  const [reviewsAccess, setReviewsAccess] = useState(true);
  const [confirmAccess, setConfirmAccess] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Введите корректный e-mail");
      return;
    }

    setEmailError(""); 
    console.log("Отправка приглашения:", { email, editAccess, editType, blocks, tasksAccess, reviewsAccess, confirmAccess });
    router.push("/organization/employees");
  };

  return (
    <main className={styles.page}>
      <Sidebar variant="organization" activePage="employees" />

      <section className={styles.content}>
        <Link href="/organization/employees" className={styles.backButton}>
          ← Сотрудники
        </Link>

        <div className={styles.sectionHeading}>
          <h1>Пригласить сотрудника</h1>
          <p>После принятия приглашения пользователь получает выбранные права.</p>
        </div>

        <form className={styles.formPage} onSubmit={handleSubmit}>
          <label className={styles.fieldLabel}>
            E-mail сотрудника
            <input
              type="email"
              placeholder="Введите e-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className={emailError ? styles.inputError : ""}
            />
            {emailError && <span className={styles.errorText}>{emailError}</span>}
          </label>

          <div className={styles.permissionsBlock}>
            <h2>Права доступа</h2>
            
            <label className={styles.customCheckboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={editAccess}
                onChange={(e) => setEditAccess(e.target.checked)}
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
                        onChange={(e) => setBlocks({ ...blocks, info: e.target.checked })}
                      />
                      Основная информация
                    </label>
                    <label className={styles.customCheckboxLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={blocks.rules}
                        onChange={(e) => setBlocks({ ...blocks, rules: e.target.checked })}
                      />
                      Правила приёма
                    </label>
                    <label className={styles.customCheckboxLabel}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={blocks.points}
                        onChange={(e) => setBlocks({ ...blocks, points: e.target.checked })}
                      />
                      Пункты приёма
                    </label>
                  </div>
                )}
              </div>
            )}

            <label className={styles.customCheckboxLabel} style={{ marginTop: '8px' }}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={tasksAccess}
                onChange={(e) => setTasksAccess(e.target.checked)}
              />
              Создавать и управлять волонтёрскими задачами
            </label>

            <label className={styles.customCheckboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={reviewsAccess}
                onChange={(e) => setReviewsAccess(e.target.checked)}
              />
              Рассматривать отклики волонтёров
            </label>

            <label className={styles.customCheckboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={confirmAccess}
                onChange={(e) => setConfirmAccess(e.target.checked)}
              />
              Подтверждать получение вещей
            </label>
          </div>

          <div className={styles.infoBanner}>
            Подключённый сотрудник без дополнительных прав может вести переписку от имени организации.
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>
              Отправить приглашение
            </button>
            <Link href="/organization/employees" className={styles.secondaryButton}>
              Отмена
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}