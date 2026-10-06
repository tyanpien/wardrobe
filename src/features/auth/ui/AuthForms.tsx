"use client";

import { Button, Checkbox, Input } from "@/shared/ui";
import styles from "@/shared/ui/Form/Form.module.css";

export function LoginForm() {
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <Input name="email" label="Электронная почта" type="email" autoComplete="email" />
      <Input name="password" label="Пароль" type="password" autoComplete="current-password" />
      <Button type="submit">Войти</Button>
    </form>
  );
}

export function RegisterForm() {
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <Input name="name" label="Имя" autoComplete="name" />
      <Input name="email" label="Электронная почта" type="email" autoComplete="email" />
      <Input name="password" label="Пароль" type="password" autoComplete="new-password" />
      <Checkbox name="consent" label="Согласен на обработку персональных данных" />
      <Button type="submit">Зарегистрироваться</Button>
    </form>
  );
}

export function LogoutButton() {
  return (
    <Button variant="secondary" type="button">
      Выйти
    </Button>
  );
}
