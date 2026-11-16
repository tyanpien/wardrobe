"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import styles from "../page.module.css";

export default function EditEmployeePage() {
  const router = useRouter();
  
  const employeeName = "Имя сотрудника";

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Сохранение прав:", { editAccess, editType, blocks, tasksAccess, reviewsAccess, confirmAccess });
    router.push("/organization/employees");
  };

  const handleDelete = () => {
    if (window.confirm("Вы уверены, что хотите удалить сотрудника из организации?")) {
      router.push("/organization/employees");
    }
  };

  return (
    <main className={styles.page}>
      <Sidebar variant="organization" activePage="employees" />

      <section className={styles.content}>
        <Link href="/organization/employees" className={styles.backButton}>
          ← Сотрудники
        </Link>

        <div className={styles.sectionHeading}>
          <h1>Права доступа</h1>
          <p>{employeeName} · сотрудник</p>
        </div>

        <form className={styles.formPage} onSubmit={handleSave}>
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
            Даже без дополнительных прав сотрудник может вести переписку от имени организации.
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>
              Сохранить изменения
            </button>
            <Link href="/organization/employees" className={styles.secondaryButton}>
              Отмена
            </Link>
          </div>

          <button type="button" className={styles.deleteButton} onClick={handleDelete}>
            Удалить из организации
          </button>
        </form>
      </section>
    </main>
  );
}