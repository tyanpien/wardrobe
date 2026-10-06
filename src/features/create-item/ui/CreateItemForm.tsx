"use client";

import { Button, Input, Select, Textarea } from "@/shared/ui";
import { ITEM_CATEGORY_LABELS, ITEM_CONDITION_LABELS, TRANSFER_TYPE_LABELS } from "@/entities/item";
import styles from "@/shared/ui/Form/Form.module.css";

export function CreateItemForm() {
  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <Input name="title" label="Название" />
      <Textarea name="description" label="Описание" />
      <Select
        name="category"
        label="Категория"
        options={Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <Select
        name="condition"
        label="Состояние"
        options={Object.entries(ITEM_CONDITION_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <Select
        name="transferType"
        label="Способ передачи"
        options={Object.entries(TRANSFER_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <Input name="photos" label="Фотографии (от 1 до 5)" type="file" />
      <Button type="submit">Создать объявление</Button>
    </form>
  );
}
