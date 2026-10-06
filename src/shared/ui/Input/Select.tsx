import type { SelectHTMLAttributes } from "react";
import styles from "./Field.module.css";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
};

export function Select({ label, id, options, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className={styles.field} htmlFor={selectId}>
      <span className={styles.label}>{label}</span>
      <select id={selectId} className={styles.control} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
