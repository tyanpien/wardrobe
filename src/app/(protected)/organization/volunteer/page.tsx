
"use client";

import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { OrganizationPermissionGuard } from "@/shared/ui/OrganizationPermissionGuard/OrganizationPermissionGuard";

import styles from "./page.module.css";

export default function VolunteerPage() {
  return (
    <main className={styles.page}>
      <Sidebar
        variant="organization"
        activePage="volunteer"
      />

      <section className={styles.content}>
        <OrganizationPermissionGuard
          requiredPermissions={[
            "manage_volunteer_tasks",
            "review_volunteer_responses",
          ]}
        >
          <header className={styles.pageHeader}>
            <div>
              <h1>Волонтёрство</h1>
              <p>Управление волонтёрскими задачами и откликами.</p>
            </div>
          </header>
        </OrganizationPermissionGuard>
      </section>
    </main>
  );
}
