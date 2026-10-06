import type { TextareaHTMLAttributes } from "react";
import styles from "./Field.module.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ label, id, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label className={styles.field} htmlFor={textareaId}>
      <span className={styles.label}>{label}</span>
      <textarea id={textareaId} className={`${styles.control} ${styles.textarea}`} {...props} />
    </label>
  );
}
