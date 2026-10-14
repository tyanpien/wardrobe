import "./globals.css";
import type { ReactNode } from "react";
import { Roboto, Jura, Inter } from "next/font/google";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-roboto",
});

const jura = Jura({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jura",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${roboto.className} ${jura.variable} ${inter.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}