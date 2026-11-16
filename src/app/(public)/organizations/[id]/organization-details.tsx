"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui";
import type { OrganizationDetailMock } from "./organization-detail-mock";
import styles from "./organization-details.module.css";

type Tab = "about" | "accepted" | "points" | "volunteer";

const tabs: { id: Tab; label: string }[] = [
  { id: "about", label: "Об организации" },
  { id: "accepted", label: "Что принимаем" },
  { id: "points", label: "Пункты приёма" },
  { id: "volunteer", label: "Волонтёрство" },
];

export function OrganizationDetails({
  organization,
}: {
  organization: OrganizationDetailMock;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("about");

  const chatHref = `/messages?user=${encodeURIComponent(
    organization.id,
  )}&userName=${encodeURIComponent(organization.name)}`;

  return (
    <Container>
      <main className={styles.page}>
        <Link href="/organizations" className={styles.backLink}>
          <img src="/eva_arrow-back-fill.svg" alt="" />
        </Link>

        <section className={styles.hero}>
          <div
            className={styles.logo}
            style={{ backgroundColor: "#E7F9A9" }}
            aria-hidden="true"
          >
            {organization.logoText}
          </div>

          <div className={styles.heroInfo}>
            <h1>{organization.name}</h1>

            <p className={styles.city}>
              <img src="/icons_location.svg" alt="" />
              {organization.city}
            </p>

            <p className={styles.description}>
              {organization.description}
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {}}
              >
                Передать вещь
              </button>

              <Link href={chatHref} className={styles.secondaryButton}>
                Написать
              </Link>
            </div>
          </div>
        </section>

        <nav className={styles.tabs} aria-label="Информация об организации">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "about" && (
          <section className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <h2>О нас</h2>

              {organization.aboutParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <aside className={styles.contactCard}>
              <h2>Контакты</h2>

              <div className={styles.contactItem}>
                <span>Телефон</span>
                <a
                  href={`tel:${organization.phone.replace(/[^\d+]/g, "")}`}
                >
                  {organization.phone}
                </a>
              </div>

              <div className={styles.contactItem}>
                <span>Email</span>
                <a href={`mailto:${organization.email}`}>
                  {organization.email}
                </a>
              </div>
            </aside>
          </section>
        )}

        {activeTab === "accepted" && (
          <section className={styles.acceptedSection}>
            <div className={styles.categoryGrid}>
              {organization.categories.map((category) => (
                <article
                  className={styles.categoryCard}
                  key={category.title}
                >
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryIcon}>
                      <img src={category.icon} alt="" />
                    </div>

                    <h2>{category.title}</h2>
                  </div>

                  <ul className={styles.categoryList}>
                    {category.items.map((item) => (
                      <li key={item}>– {item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className={styles.policyGrid}>
              <section className={styles.policyColumn}>
                <h2>Допустимое состояние</h2>

                <div className={styles.conditionTags}>
                  {organization.allowedConditions.map((condition) => (
                    <span key={condition}>{condition}</span>
                  ))}
                </div>
              </section>

              <section className={styles.policyColumn}>
                <h2>Дополнительные требования</h2>
                <p>{organization.extraRequirements}</p>
              </section>
            </div>

            <section className={styles.rejectedCard}>
              <h2>Не принимаем</h2>

              <div className={styles.rejectedDivider} />

              <ul>
                {organization.rejectedItems.map((item) => (
                  <li key={item}>– {item}</li>
                ))}
              </ul>
            </section>
          </section>
        )}

        {activeTab === "points" && (
          <section className={styles.pointsGrid}>
            {organization.points.map((point, index) => (
              <article
                className={styles.pointCard}
                key={`${point.title}-${index}`}
              >
                <h2>{point.title}</h2>

                <div className={styles.pointMeta}>
                  <img src="/icons_location.svg" />
                  <p>{point.address}</p>
                </div>

                <div className={styles.pointMeta}>
                  <img src="/Img.svg" />
                  <p>{point.hours}</p>
                </div>

                <a
                  className={styles.mapButton}
                  href={`https://yandex.ru/maps/?text=${encodeURIComponent(
                    point.address,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Показать на карте ➜
                </a>
              </article>
            ))}
          </section>
        )}

        {activeTab === "volunteer" && (
          <section className={styles.volunteerEmpty}>
            <h2>Волонтёрство</h2>
            <p>
              {organization.volunteerText ||
                "Информация о волонтёрстве скоро появится."}
            </p>
          </section>
        )}
      </main>
    </Container>
  );
}