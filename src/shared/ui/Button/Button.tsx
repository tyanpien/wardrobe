import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, variant = "primary", className, type = "button", ...props }: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
