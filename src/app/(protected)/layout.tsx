import type { ReactNode } from "react";
import { Sidebar } from "@/widgets/sidebar";
import styles from "./protected.module.css";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div>{children}</div>
    </div>
  );
}
