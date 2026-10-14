import type { ReactNode } from "react";
import styles from "./protected.module.css";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <div>{children}</div>
    </div>
  );
}
