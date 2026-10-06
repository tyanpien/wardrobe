"use client";

import { Button, Input } from "@/shared/ui";
import styles from "@/shared/ui/Form/Form.module.css";

export function CreateOrganizationForm() {
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <Input name="name" label="Название организации" />
      <Input name="email" label="Электронная почта" type="email" />
      <Input name="password" label="Пароль" type="password" />
      <Button type="submit">Зарегистрировать организацию</Button>
    </form>
  );
}
