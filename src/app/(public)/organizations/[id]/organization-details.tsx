"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui";
import { getOrganization } from "@/entities/organization/api";
import type { OrganizationDetail } from "@/entities/organization/model/dto";
import { getApiErrorMessage } from "@/shared/api/errors";
import { env } from "@/shared/config";
import styles from "./organization-details.module.css";

type Tab = "about" | "accepted" | "points" | "volunteer";
const tabs: { id: Tab; label: string }[] = [
  { id: "about", label: "Об организации" },
  { id: "accepted", label: "Что принимаем" },
  { id: "points", label: "Пункты приёма" },
  { id: "volunteer", label: "Волонтёрство" },
];

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, env.apiUrl).toString();
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("ru") ?? "").join("");
}

export function OrganizationDetails({ organizationId }: { organizationId: string }) {
  const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadOrganization() {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);
        const result = await getOrganization(organizationId);
        if (!cancelled) setOrganization(result);
      } catch (requestError) {
        if (!cancelled) {
          setOrganization(null);
          const status = (requestError as { response?: { status?: number } })?.response?.status;
          setNotFound(status === 404);
          setError(getApiErrorMessage(requestError, "Не удалось загрузить страницу организации."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadOrganization();
    return () => { cancelled = true; };
  }, [organizationId]);

  if (loading) {
    return <Container><main className={styles.page}><div className={styles.loadState} role="status">Загружаем страницу организации...</div></main></Container>;
  }

  if (error || !organization) {
    return (
      <Container>
        <main className={styles.page}>
          <Link href="/organizations" className={styles.backLink}><img src="/eva_arrow-back-fill.svg" alt="" /></Link>
          <div className={styles.loadState} role="alert">
            <h1>{notFound ? "Организация не найдена" : "Не удалось загрузить организацию"}</h1>
            <p>{error || "Организация недоступна."}</p>
            {!notFound && <button type="button" className={styles.retryButton} onClick={() => window.location.reload()}>Повторить</button>}
          </div>
        </main>
      </Container>
    );
  }

  const logoUrl = getImageUrl(organization.logoUrl);
  const canManageOrganization = organization.viewerRole === "representative"
    || organization.viewerPermissions.some((permission) => permission !== "chat");
  const chatHref = `/messages?user=${encodeURIComponent(organization.id)}&userName=${encodeURIComponent(organization.name)}`;

  return (
    <Container>
      <main className={styles.page}>
        <Link href="/organizations" className={styles.backLink}><img src="/eva_arrow-back-fill.svg" alt="" /></Link>

        <section className={styles.hero}>
          {logoUrl ? (
            <img className={styles.logoImage} src={logoUrl} alt={`Логотип: ${organization.name}`} />
          ) : (
            <div className={styles.logo} style={{ backgroundColor: "#E7F9A9" }} aria-hidden="true">{getInitials(organization.name)}</div>
          )}

          <div className={styles.heroInfo}>
            <h1>{organization.name}</h1>
            <p className={styles.city}><img src="/icons_location.svg" alt="" />{organization.city}</p>
            <p className={styles.description}>{organization.description}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryButton} disabled>Передать вещь</button>
              <Link href={chatHref} className={styles.secondaryButton}>Написать</Link>
              {canManageOrganization && <Link href="/organization" className={styles.secondaryButton}>Управление организацией</Link>}
            </div>
          </div>
        </section>

        <nav className={styles.tabs} aria-label="Информация об организации">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ""}`} onClick={() => setActiveTab(tab.id)} aria-pressed={activeTab === tab.id}>
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "about" && (
          <section className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <h2>О нас</h2>
              {organization.aboutParagraphs.length > 0
                ? organization.aboutParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                : <p>Информация об организации пока не добавлена.</p>}
              {organization.website && <p><a href={organization.website} target="_blank" rel="noreferrer">Официальный сайт</a></p>}
            </div>
            <aside className={styles.contactCard}>
              <h2>Контакты</h2>
              {organization.phone && <div className={styles.contactItem}><span>Телефон</span><a href={`tel:${organization.phone.replace(/[^\d+]/g, "")}`}>{organization.phone}</a></div>}
              <div className={styles.contactItem}><span>Email</span><a href={`mailto:${organization.email}`}>{organization.email}</a></div>
            </aside>
          </section>
        )}

        {activeTab === "accepted" && (
          <section className={styles.acceptedSection}>
            {organization.categories.length > 0 ? (
              <div className={styles.categoryGrid}>
                {organization.categories.map((category) => (
                  <article className={styles.categoryCard} key={category.title}>
                    <div className={styles.categoryHeader}><div className={styles.categoryIcon}><img src={category.icon} alt="" /></div><h2>{category.title}</h2></div>
                    {category.items.length > 0 && <ul className={styles.categoryList}>{category.items.map((item) => <li key={item}>– {item}</li>)}</ul>}
                  </article>
                ))}
              </div>
            ) : <p>Организация пока не указала категории принимаемых вещей.</p>}
            <div className={styles.policyGrid}>
              <section className={styles.policyColumn}><h2>Допустимое состояние</h2><div className={styles.conditionTags}>{organization.allowedConditions.map((condition) => <span key={condition}>{condition}</span>)}</div></section>
              <section className={styles.policyColumn}>
                <h2>Дополнительные требования</h2>
                <p>
                  {organization.extraRequirements || "Дополнительные требования не указаны."}
                </p>
              </section>
            </div>
            <section className={styles.rejectedCard}><h2>Не принимаем</h2><div className={styles.rejectedDivider} />
              {organization.rejectedItems.length > 0 ? <ul>{organization.rejectedItems.map((item) => <li key={item}>– {item}</li>)}</ul> : <p>Ограничения не указаны.</p>}
            </section>
          </section>
        )}

        {activeTab === "points" && (
          organization.points.length > 0 ? (
            <section className={styles.pointsGrid}>
              {organization.points.map((point) => (
                <article className={styles.pointCard} key={point.id}>
                  <h2>{point.title}</h2>
                  <div className={styles.pointMeta}><img src="/icons_location.svg" alt="" /><p>{point.address}</p></div>
                  <div className={styles.pointMeta}><img src="/Img.svg" alt="" /><p>{point.hours}</p></div>
                  <a className={styles.mapButton} href={`https://yandex.ru/maps/?text=${encodeURIComponent(point.address)}`} target="_blank" rel="noreferrer">Показать на карте ➜</a>
                </article>
              ))}
            </section>
          ) : <div className={styles.loadState}>Организация пока не добавила пункты приёма.</div>
        )}

        {activeTab === "volunteer" && (
          <section className={styles.volunteerEmpty}><h2>Волонтёрство</h2><p>Информация о волонтёрстве скоро появится.</p></section>
        )}
      </main>
    </Container>
  );
}
