import type { InputHTMLAttributes } from "react";
import styles from "./Checkbox.module.css";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({ label, id, ...props }: CheckboxProps) {
  const checkboxId = id ?? props.name;

  return (
    <label className={styles.field} htmlFor={checkboxId}>
      <input id={checkboxId} type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
