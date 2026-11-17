import type { ReactNode } from "react";
import styles from "./protected.module.css";
import { AuthGuard } from "@/shared/ui/AuthGuard/AuthGuard";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <div className={styles.layout}>
        <div>{children}</div>
      </div>
    </AuthGuard>
  );
}
