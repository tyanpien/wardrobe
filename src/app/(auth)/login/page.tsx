import Link from "next/link";
import { Card, PageHeader } from "@/shared/ui";
import { LoginForm } from "@/features/auth";
import styles from "../auth.module.css";

export default function LoginPage() {
  return (
    <div className={styles.auth}>
      <PageHeader title="Вход" description="Авторизация по электронной почте и паролю." />
      <Card>
        <LoginForm />
      </Card>
      <p>
        Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
}
