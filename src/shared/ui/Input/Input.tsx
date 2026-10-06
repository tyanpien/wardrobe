import type { InputHTMLAttributes } from "react";
import styles from "./Field.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input id={inputId} className={styles.control} {...props} />
    </label>
  );
}
