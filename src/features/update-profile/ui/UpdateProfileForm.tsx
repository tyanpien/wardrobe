"use client";

import { Button, Checkbox, Input, Textarea } from "@/shared/ui";
import styles from "@/shared/ui/Form/Form.module.css";

export function UpdateProfileForm() {
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <Input name="name" label="Имя" />
      <Input name="city" label="Город" />
      <Textarea name="description" label="Описание" />
      <Input name="photo" label="Фотография" type="file" />
      <Checkbox name="wantsToVolunteer" label="Хочу помогать как волонтер" />
      <Textarea name="volunteerSkills" label="Навыки и возможности волонтера" />
      <Button type="submit">Сохранить профиль</Button>
    </form>
  );
}
