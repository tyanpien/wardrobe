import Link from "next/link";
import { Card, PageHeader } from "@/shared/ui";
import { CreateOrganizationForm } from "@/features/create-organization";
import { RegisterForm } from "@/features/auth";
import styles from "../auth.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.auth}>
      <PageHeader
        title="Регистрация"
        description="Создайте личный аккаунт или зарегистрируйте организацию."
      />
      <Card>
        <h2>Личный аккаунт</h2>
        <RegisterForm />
      </Card>
      <Card>
        <h2>Регистрация организации</h2>
        <CreateOrganizationForm />
      </Card>
      <p>
        Уже есть аккаунт? <Link href="/login">Войти</Link>
      </p>
    </div>
  );
}
