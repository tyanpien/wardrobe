"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui";
import dynamic from "next/dynamic";
import {
  getOrganizations,
  getOrganizationMapPoints,
} from "@/entities/organization/api";
import type {
  OrganizationCard,
  OrganizationMapPoint,
} from "@/entities/organization/model/dto";
import { getCities } from "@/entities/user/api/profile";
import { getApiErrorMessage } from "@/shared/api/errors";
import { env } from "@/shared/config";

const MapView = dynamic(
  () => import("@/widgets/map-view").then((module) => module.MapView),
  { ssr: false },
);

import styles from "./organizations.module.css";

type ViewMode = "list" | "map";
const PAGE_SIZE = 20;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("ru") ?? "")
    .join("");
}

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, env.apiUrl).toString();
}

function OrganizationCardView({ organization }: { organization: OrganizationCard }) {
  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = showAllTags
    ? organization.tags
    : organization.tags.slice(0, 3);
  const hiddenTagsCount = Math.max(organization.tags.length - 3, 0);
  const logoUrl = getImageUrl(organization.logoUrl);

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        {logoUrl ? (
          <img className={styles.logoImage} src={logoUrl} alt={`Логотип: ${organization.name}`} />
        ) : (
          <div className={styles.logo} aria-hidden="true">
            {getInitials(organization.name)}
          </div>
        )}

        <div className={styles.heading}>
          <h2 className={styles.organizationName}>{organization.name}</h2>
          <p className={styles.city}>
            <img src="/icons_location.svg" alt="" />
            {organization.city}
          </p>
        </div>
      </div>

      <p className={styles.description}>
        {organization.description || "Описание организации пока не добавлено."}
      </p>

      <div className={styles.tags} aria-label="Что принимает организация">
        {visibleTags.map((tag) => (
          <span className={styles.tag} key={tag}>{tag}</span>
        ))}
        {hiddenTagsCount > 0 && (
          <button
            type="button"
            className={`${styles.tag} ${styles.moreTags}`}
            onClick={() => setShowAllTags((value) => !value)}
            aria-expanded={showAllTags}
            aria-label={showAllTags ? "Свернуть список категорий" : `Показать ещё ${hiddenTagsCount} категорий`}
          >
            {showAllTags ? "Свернуть" : `+${hiddenTagsCount}`}
          </button>
        )}
      </div>

      <div className={styles.cardFooter}>
        <p className={styles.pointsCount}>
          <strong>{organization.receivingPointsCount}</strong>{" "}
          {organization.receivingPointsCount === 1
            ? "пункт приёма"
            : organization.receivingPointsCount < 5
              ? "пункта приёма"
              : "пунктов приёма"}
        </p>
        <Link href={`/organizations/${organization.id}`} className={styles.detailsButton}>
          Подробнее
        </Link>
      </div>
    </article>
  );
}

export default function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [organizationsLoading, setOrganizationsLoading] = useState(true);
  const [organizationsError, setOrganizationsError] = useState("");
  const [mapPoints, setMapPoints] = useState<OrganizationMapPoint[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);
  const requestSequence = useRef(0);

  const loadOrganizations = useCallback(async () => {
    const requestId = ++requestSequence.current;
    try {
      setOrganizationsLoading(true);
      setOrganizationsError("");
      const result = await getOrganizations({
        q: appliedSearch,
        city: selectedCities,
        page,
        pageSize: PAGE_SIZE,
      });
      if (requestId !== requestSequence.current) return;
      setOrganizations(result.items);
      setTotal(result.total);
    } catch (error) {
      if (requestId !== requestSequence.current) return;
      setOrganizationsError(getApiErrorMessage(error, "Не удалось загрузить организации."));
      setOrganizations([]);
      setTotal(0);
    } finally {
      if (requestId === requestSequence.current) setOrganizationsLoading(false);
    }
  }, [appliedSearch, selectedCities, page]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    let cancelled = false;
    async function loadCities() {
      try {
        setCitiesLoading(true);
        setCitiesError("");
        const result = await getCities();
        if (!cancelled) setCities(result);
      } catch (error) {
        if (!cancelled) setCitiesError(getApiErrorMessage(error, "Не удалось загрузить список городов."));
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    }
    void loadCities();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (view !== "map") return;
    let cancelled = false;
    async function loadMapPoints() {
      try {
        setMapLoading(true);
        setMapError("");
        const points = await getOrganizationMapPoints({
          q: appliedSearch,
          city: selectedCities,
        });
        if (!cancelled) setMapPoints(points);
      } catch (error) {
        if (!cancelled) {
          setMapError(getApiErrorMessage(error, "Не удалось загрузить пункты приёма."));
          setMapPoints([]);
        }
      } finally {
        if (!cancelled) setMapLoading(false);
      }
    }
    void loadMapPoints();
    return () => { cancelled = true; };
  }, [view, appliedSearch, selectedCities]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (event.target instanceof Node && !filterRef.current?.contains(event.target)) {
        setCityMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setCityMenuOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const cityButtonLabel = selectedCities.length > 0
    ? `Города · ${selectedCities.length}`
    : "Города";
  const hasActiveFilters = Boolean(appliedSearch.trim()) || selectedCities.length > 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  }

  function toggleCity(city: string) {
    setPage(1);
    setSelectedCities((current) => current.includes(city)
      ? current.filter((item) => item !== city)
      : [...current, city]);
  }

  function resetFilters() {
    setSearch("");
    setAppliedSearch("");
    setSelectedCities([]);
    setPage(1);
    setCityMenuOpen(false);
  }

  function renderSearch({ showCityFilter = true, showViewSwitch = false }: {
    showCityFilter?: boolean;
    showViewSwitch?: boolean;
  } = {}) {
    return (
      <section className={styles.toolbar} aria-label="Поиск и фильтры организаций">
        <form className={styles.searchForm} onSubmit={submitSearch}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
          </span>
          <label className={styles.visuallyHidden} htmlFor="organization-search">Поиск по организациям</label>
          <input
            id="organization-search"
            className={styles.searchInput}
            type="search"
            placeholder="Поиск по организациям"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className={styles.searchButton} type="submit">Найти</button>
        </form>

        {showCityFilter && (
          <div className={styles.cityFilter} ref={filterRef}>
            <button type="button" className={styles.filterTrigger} onClick={() => setCityMenuOpen((open) => !open)} aria-expanded={cityMenuOpen}>
              <span className={styles.triggerIcon}><img src="/map.svg" alt="" /></span>
              {cityButtonLabel}
              <span className={styles.filterChevron} />
            </button>
            {cityMenuOpen && (
              <div className={styles.cityDropdown}>
                {citiesLoading ? <p>Загружаем города...</p>
                  : citiesError ? <p>{citiesError}</p>
                    : cities.length > 0 ? cities.map((city) => (
                      <label className={styles.checkRow} key={city}>
                        <input type="checkbox" checked={selectedCities.includes(city)} onChange={() => toggleCity(city)} />
                        <span className={styles.customCheckbox} /><span>{city}</span>
                      </label>
                    )) : <p>Список городов пуст.</p>}
              </div>
            )}
          </div>
        )}

        {showViewSwitch && (
          <div className={styles.viewSwitch} role="group" aria-label="Режим отображения">
            <button type="button" className={`${styles.viewButton} ${view === "list" ? styles.viewButtonActive : ""}`} onClick={() => setView("list")} aria-pressed={view === "list"}>Список</button>
            <button type="button" className={`${styles.viewButton} ${view === "map" ? styles.viewButtonActive : ""}`} onClick={() => setView("map")} aria-pressed={view === "map"}>Карта</button>
          </div>
        )}
      </section>
    );
  }

  function renderResultsLine() {
    return (
      <div className={styles.resultsLine}>
        <span>Найдено организаций: {total}</span>
        {hasActiveFilters && <button type="button" className={styles.resetButton} onClick={resetFilters}>Сбросить фильтры</button>}
      </div>
    );
  }

  function renderOrganizationList() {
    if (organizationsLoading) return <div className={styles.statusState} role="status">Загружаем организации...</div>;
    if (organizationsError) {
      return (
        <div className={styles.statusState} role="alert">
          <p>{organizationsError}</p>
          <button type="button" className={styles.searchButton} onClick={() => void loadOrganizations()}>Повторить</button>
        </div>
      );
    }
    if (organizations.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h2>Организации не найдены</h2>
          <p>Попробуйте изменить запрос или выбрать другой город.</p>
          {hasActiveFilters && <button type="button" className={styles.searchButton} onClick={resetFilters}>Сбросить поиск</button>}
        </div>
      );
    }
    return (
      <>
        <div className={styles.grid}>
          {organizations.map((organization) => <OrganizationCardView key={organization.id} organization={organization} />)}
        </div>
        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Страницы каталога">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Назад</button>
            <span>Страница {page} из {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Далее</button>
          </nav>
        )}
      </>
    );
  }

  return (
    <Container>
      <main className={`${styles.page} ${view === "map" ? styles.mapPage : ""}`}>
        {view === "list" ? (
          <>
            <div className={styles.pageHeading}><h1 className={styles.pageTitle}>Организации</h1></div>
            {renderSearch({ showCityFilter: true, showViewSwitch: true })}
            {renderResultsLine()}
            {renderOrganizationList()}
          </>
        ) : (
          <div className={styles.mapLayout}>
            <section className={styles.mapSidebar}>
              <div className={styles.mapSidebarHeader}>
                <h1 className={styles.pageTitle1}>Организации</h1>
                <div className={styles.viewSwitch} role="group" aria-label="Режим отображения">
                  <button type="button" className={styles.viewButton1} onClick={() => setView("list")} aria-pressed="false">Список</button>
                  <button type="button" className={`${styles.viewButton1} ${styles.viewButtonActive1}`} onClick={() => setView("map")} aria-pressed="true">Карта</button>
                </div>
              </div>
              {renderSearch({ showCityFilter: false, showViewSwitch: false })}
              {renderResultsLine()}
              <div className={styles.mapOrganizations}>{renderOrganizationList()}</div>
            </section>
            <section className={styles.mapPanel}>
              {mapError ? <div className={styles.statusState} role="alert">{mapError}</div>
                : mapLoading ? <div className={styles.statusState} role="status">Загружаем пункты приёма...</div>
                  : <MapView points={mapPoints} />}
            </section>
          </div>
        )}
      </main>
    </Container>
  );
}
