"use client";

import { Button, Input, Textarea } from "@/shared/ui";
import styles from "@/shared/ui/Form/Form.module.css";

export function CreateVolunteerTaskForm() {
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <Input name="title" label="Название задачи" />
      <Textarea name="description" label="Описание" />
      <Input name="location" label="Место выполнения" />
      <Input name="dateOrPeriod" label="Дата или период" />
      <Input name="volunteersNeeded" label="Необходимое количество волонтеров" type="number" />
      <Button type="submit">Опубликовать задачу</Button>
    </form>
  );
}
