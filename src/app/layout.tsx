import "./globals.css";
import type { ReactNode } from "react";
import { Roboto } from "next/font/google";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className={roboto.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}