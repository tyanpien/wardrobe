"use client";

import { Button, Textarea } from "@/shared/ui";
import styles from "@/shared/ui/Form/Form.module.css";

export function SendMessageForm() {
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <Textarea name="text" label="Сообщение" />
      <Button type="submit">Отправить</Button>
    </form>
  );
}
