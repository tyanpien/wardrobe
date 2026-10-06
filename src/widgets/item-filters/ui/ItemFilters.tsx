"use client";

import { Input, Select } from "@/shared/ui";
import { ITEM_CATEGORY_LABELS, ITEM_CONDITION_LABELS, TRANSFER_TYPE_LABELS } from "@/entities/item";
import styles from "./ItemFilters.module.css";

export function ItemFilters() {
  return (
    <form className={styles.filters} onSubmit={(event) => event.preventDefault()}>
      <div className={styles.search}>
        <Input name="query" label="Поиск по названию" placeholder="Например, пальто" />
      </div>
      <Select
        name="category"
        label="Категория"
        defaultValue=""
        options={[{ value: "", label: "Все категории" }, ...Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))]}
      />
      <Select
        name="transferType"
        label="Способ передачи"
        defaultValue=""
        options={[{ value: "", label: "Любой способ" }, ...Object.entries(TRANSFER_TYPE_LABELS).map(([value, label]) => ({ value, label }))]}
      />
      <Select
        name="condition"
        label="Состояние"
        defaultValue=""
        options={[{ value: "", label: "Любое состояние" }, ...Object.entries(ITEM_CONDITION_LABELS).map(([value, label]) => ({ value, label }))]}
      />
      <Input name="city" label="Местоположение" placeholder="Город" />
    </form>
  );
}
