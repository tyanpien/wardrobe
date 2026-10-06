import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import styles from "./shell.module.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Добрый шкаф",
  description: "Платформа для передачи вещей, помощи организациям и волонтерства.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <div className={styles.shell}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
