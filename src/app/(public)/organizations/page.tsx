"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Container } from "@/shared/ui";
import dynamic from "next/dynamic";
const MapView = dynamic(
  () => import("@/widgets/map-view").then((m) => m.MapView),
  { ssr: false }
);
import {
  mockOrganizations,
  type OrganizationListMock,
} from "@/shared/lib/organization-list-mock";
import { getCities } from "@/entities/user/api/profile";

import styles from "./organizations.module.css";

type ViewMode = "list" | "map";

function OrganizationCard({
  organization,
}: {
  organization: OrganizationListMock;
}) {
  const [showAllTags, setShowAllTags] = useState(false);

  const visibleTags = showAllTags
    ? organization.tags
    : organization.tags.slice(0, 3);

  const hiddenTagsCount = Math.max(organization.tags.length - 3, 0);

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <div
          className={styles.logo}
          style={{ backgroundColor: organization.logoColor }}
          aria-hidden="true"
        >
          {organization.logoText}
        </div>

        <div className={styles.heading}>
          <h2 className={styles.organizationName}>{organization.name}</h2>

          <p className={styles.city}>
            <img src="/icons_location.svg" alt="" />
            {organization.city}
          </p>
        </div>
      </div>

      <p className={styles.description}>{organization.description}</p>

      <div className={styles.tags} aria-label="Что принимает организация">
        {visibleTags.map((tag) => (
          <span className={styles.tag} key={tag}>
            {tag}
          </span>
        ))}

        {hiddenTagsCount > 0 && (
          <button
            type="button"
            className={`${styles.tag} ${styles.moreTags}`}
            onClick={() => setShowAllTags((value) => !value)}
            aria-expanded={showAllTags}
            aria-label={
              showAllTags
                ? "Свернуть список категорий"
                : `Показать ещё ${hiddenTagsCount} категорий`
            }
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

        <Link
          href={`/organizations/${organization.id}`}
          className={styles.detailsButton}
        >
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

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      try {
        setCitiesLoading(true);
        setCitiesError("");

        const result = await getCities();

        if (!cancelled) {
          setCities(result);
        }
      } catch {
        if (!cancelled) {
          setCitiesError("Не удалось загрузить список городов.");
        }
      } finally {
        if (!cancelled) {
          setCitiesLoading(false);
        }
      }
    }

    loadCities();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !filterRef.current?.contains(event.target)
      ) {
        setCityMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCityMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredOrganizations = useMemo(() => {
    const normalizedSearch = appliedSearch.trim().toLocaleLowerCase("ru");

    return mockOrganizations.filter((organization) => {
      const matchesCity =
        selectedCities.length === 0 ||
        selectedCities.includes(organization.city);

      const searchableText = [
        organization.name,
        organization.city,
        organization.description,
        ...organization.tags,
      ]
        .join(" ")
        .toLocaleLowerCase("ru");

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesCity && matchesSearch;
    });
  }, [appliedSearch, selectedCities]);

  const cityButtonLabel =
    selectedCities.length > 0
      ? `Города · ${selectedCities.length}`
      : "Города";

  const hasActiveFilters =
    Boolean(appliedSearch.trim()) || selectedCities.length > 0;

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(search);
  }

  function toggleCity(city: string) {
    setSelectedCities((current) =>
      current.includes(city)
        ? current.filter((item) => item !== city)
        : [...current, city],
    );
  }

  function resetFilters() {
    setSearch("");
    setAppliedSearch("");
    setSelectedCities([]);
    setCityMenuOpen(false);
  }

  function renderSearch({
    showCityFilter = true,
    showViewSwitch = false,
  }: {
    showCityFilter?: boolean;
    showViewSwitch?: boolean;
  } = {}) {
    return (
      <section
        className={styles.toolbar}
        aria-label="Поиск и фильтры организаций"
      >
        <form className={styles.searchForm} onSubmit={submitSearch}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
          </span>
  
          <label
            className={styles.visuallyHidden}
            htmlFor="organization-search"
          >
            Поиск по организациям
          </label>
  
          <input
            id="organization-search"
            className={styles.searchInput}
            type="search"
            placeholder="Поиск по организациям"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
  
          <button className={styles.searchButton} type="submit">
            Найти
          </button>
        </form>
  
        {showCityFilter && (
          <div className={styles.cityFilter} ref={filterRef}>
            <button
              type="button"
              className={styles.filterTrigger}
              onClick={() => setCityMenuOpen((open) => !open)}
              aria-expanded={cityMenuOpen}
            >
              <span className={styles.triggerIcon}>
                <img src="/map.svg" alt="" />
              </span>
  
              {cityButtonLabel}
  
              <span className={styles.filterChevron} />
            </button>
  
            {cityMenuOpen && (
              <div className={styles.cityDropdown}>
                {citiesLoading ? (
                  <p>Загружаем города...</p>
                ) : citiesError ? (
                  <p>{citiesError}</p>
                ) : cities.length > 0 ? (
                  cities.map((city) => {
                    const checked = selectedCities.includes(city);
  
                    return (
                      <label className={styles.checkRow} key={city}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCity(city)}
                        />
  
                        <span className={styles.customCheckbox} />
                        <span>{city}</span>
                      </label>
                    );
                  })
                ) : (
                  <p>Список городов пуст.</p>
                )}
              </div>
            )}
          </div>
        )}
  
        {showViewSwitch && (
          <div
            className={styles.viewSwitch}
            role="group"
            aria-label="Режим отображения"
          >
            <button
              type="button"
              className={`${styles.viewButton} ${
                view === "list" ? styles.viewButtonActive : ""
              }`}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              Список
            </button>
  
            <button
              type="button"
              className={`${styles.viewButton} ${
                view === "map" ? styles.viewButtonActive : ""
              }`}
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
            >
              Карта
            </button>
          </div>
        )}
      </section>
    );
  }

  function renderResultsLine() {
    return (
      <div className={styles.resultsLine}>
        <span>Найдено организаций: {filteredOrganizations.length}</span>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={resetFilters}
          >
            Сбросить фильтры
          </button>
        )}
      </div>
    );
  }

  function renderOrganizationList() {
    if (filteredOrganizations.length === 0) {
      return (
        <div className={styles.emptyState}>
          <h2>Организации не найдены</h2>
          <p>Попробуйте изменить запрос или выбрать другой город.</p>

          <button
            type="button"
            className={styles.searchButton}
            onClick={resetFilters}
          >
            Сбросить поиск
          </button>
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {filteredOrganizations.map((organization) => (
          <OrganizationCard
            key={organization.id}
            organization={organization}
          />
        ))}
      </div>
    );
  }

  return (
    <Container>
      <main
        className={`${styles.page} ${
          view === "map" ? styles.mapPage : ""
        }`}
      >
        {view === "list" ? (
          <>
            <div className={styles.pageHeading}>
              <h1 className={styles.pageTitle}>Организации</h1>
            </div>
  
            {renderSearch({
              showCityFilter: true,
              showViewSwitch: true,
            })}
  
            {renderResultsLine()}
            {renderOrganizationList()}
          </>
        ) : (
          <div className={styles.mapLayout}>
            <section className={styles.mapSidebar}>
              <div className={styles.mapSidebarHeader}>
                <h1 className={styles.pageTitle1}>Организации</h1>
  
                <div
                  className={styles.viewSwitch}
                  role="group"
                  aria-label="Режим отображения"
                >
                  <button
                    type="button"
                    className={styles.viewButton1}
                    onClick={() => setView("list")}
                    aria-pressed="false"
                  >
                    Список
                  </button>
  
                  <button
                    type="button"
                    className={`${styles.viewButton1} ${styles.viewButtonActive1}`}
                    onClick={() => setView("map")}
                    aria-pressed="true"
                  >
                    Карта
                  </button>
                </div>
              </div>
  
              {renderSearch({
                showCityFilter: false,
                showViewSwitch: false,
              })}
  
              {renderResultsLine()}
  
              <div className={styles.mapOrganizations}>
                {renderOrganizationList()}
              </div>
            </section>
  
            <section className={styles.mapPanel}>
              <MapView organizations={filteredOrganizations} />
            </section>
          </div>
        )}
      </main>
    </Container>
  );
}