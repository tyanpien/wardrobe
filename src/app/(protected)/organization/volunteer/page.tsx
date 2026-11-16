"use client";

import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import styles from "./page.module.css";


export default function VolunteerPage() {
  return (
    <main className={styles.page}>
      <Sidebar variant="organization" activePage="volunteer" />
      <section className={styles.content}>
        <header className={styles.pageHeader}>
            <div>
            <h1>Волонтёрство</h1>
            <p>В разработке</p>
            </div>
        </header>
      </section>
    </main>
  );
}