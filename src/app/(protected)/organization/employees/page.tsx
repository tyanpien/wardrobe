"use client";

import Link from "next/link";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import styles from "./page.module.css";

export default function EmployeesPage() {
  return (
    <main className={styles.page}>
      <Sidebar variant="organization" activePage="employees" />

      <section className={styles.content}>
        <header className={styles.pageHeader}>
          <div>
            <h1>Сотрудники</h1>
            <p>
              Управляйте сотрудниками и правами. Без дополнительных прав доступна переписка.
            </p>
          </div>
          <Link href="/organization/employees/invite" className={styles.primaryButton}>
            Пригласить
          </Link>
        </header>

        <div className={styles.employeesList}>
          <article className={styles.employeeCard}>
            <div className={styles.employeeInfo}>
              <h2>Имя владельца</h2>
              <p>Представитель организации</p>
            </div>
          </article>

          <article className={styles.employeeCard}>
            <div className={styles.employeeInfo}>
              <h2>Имя сотрудника</h2>
              <p>Сотрудник · Редактирование 2 блоков · Волонтёрские задачи · Отклики</p>
            </div>
            <Link href="/organization/employees/1" className={styles.employeeAction}>
              Изменить права
            </Link>
          </article>

          <article className={styles.employeeCard}>
            <div className={styles.employeeInfo}>
              <h2>Имя сотрудника</h2>
              <p>Сотрудник · Подтверждение получения вещей</p>
            </div>
            <Link href="/organization/employees/2" className={styles.employeeAction}>
              Изменить права
            </Link>
          </article>
        </div>

        <div className={styles.pendingSection}>
          <h2>Ожидают принятия</h2>
          <article className={styles.employeeCard}>
            <div className={styles.employeeInfo}>
              <h2 className={styles.user}>new.user@mail.ru</h2>
              <p>Приглашение отправлено · Ожидает принятия</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}