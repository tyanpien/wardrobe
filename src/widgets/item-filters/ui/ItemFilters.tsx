"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Item } from "@/entities/item";
import {
  ITEM_CATEGORY_LABELS,
  ITEM_CONDITION_LABELS,
  TRANSFER_TYPE_LABELS,
} from "@/entities/item";
import type { CatalogFilters } from "../model/types";
import styles from "./ItemFilters.module.css";

export type ItemFiltersProps = {
  items: Item[];
  onApply: (filters: CatalogFilters) => void;
  onSearch: (query: string) => void;
};

const subcategories: Record<string, { value: string; label: string }[]> = {
  clothing: [
    { value: "outerwear", label: "Верхняя одежда" },
    { value: "tshirts_tops", label: "Футболки и топы" },
    { value: "shirts_blouses", label: "Рубашки и блузки" },
    { value: "sweaters_hoodies", label: "Свитеры и толстовки" },
    { value: "pants_jeans", label: "Брюки и джинсы" },
    { value: "dresses_skirts", label: "Платья и юбки" },
    { value: "sportswear", label: "Спортивная одежда" },
    { value: "homewear", label: "Домашняя одежда" },
  ],
  shoes: [
    { value: "shoes_demi", label: "Демисезонная" },
    { value: "shoes_sport", label: "Спортивная" },
    { value: "shoes_winter", label: "Зимняя" },
    { value: "shoes_summer", label: "Летняя" },
  ],
  accessories: [
    { value: "bags_backpacks", label: "Сумки и рюкзаки" },
    { value: "hats", label: "Головные уборы" },
    { value: "scarves_gloves", label: "Шарфы и перчатки" },
    { value: "belts", label: "Ремни" },
  ],
  home_textile: [
    { value: "bedding", label: "Постельное белье" },
    { value: "towels", label: "Полотенца" },
    { value: "blankets", label: "Пледы и одеяла" },
    { value: "curtains", label: "Шторы" },
  ],
  kids: [
    { value: "kids_clothing", label: "Детская одежда" },
    { value: "kids_shoes", label: "Детская обувь" },
    { value: "newborn_clothing", label: "Одежда для новорожденных" },
    { value: "toys", label: "Игрушки" },
    { value: "kids_books", label: "Детские книги" },
    { value: "baby_care", label: "Товары для ухода за ребенком" },
    { value: "kids_textile", label: "Детский текстиль" },
  ],
  other: [{ value: "other", label: "Другое" }],
};

const conditions = Object.entries(ITEM_CONDITION_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const transferTypes = Object.entries(TRANSFER_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const cities = [
  "Екатеринбург",
  "Нижний Тагил",
  "Каменск-Уральский",
  "Первоуральск",
  "Серов",
  "Верхняя Пышма",
];

type MenuName = "category" | "condition" | "city" | "transfer";

type CategoryValue = CatalogFilters["category"];

const EMPTY_CATEGORY: CategoryValue = "";

function getItemsLabel(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "объявлений";
  }

  if (lastDigit === 1) {
    return "объявление";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "объявления";
  }

  return "объявлений";
}

export function ItemFilters({
  items,
  onApply,
  onSearch,
}: ItemFiltersProps) {
  const [openMenus, setOpenMenus] = useState<MenuName[]>([]);
  const [query, setQuery] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryValue>(EMPTY_CATEGORY);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  const [draftCategory, setDraftCategory] =
    useState<CategoryValue>(EMPTY_CATEGORY);
  const [draftSubcategories, setDraftSubcategories] = useState<string[]>([]);

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () =>
      Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => ({
        value: value as CategoryValue,
        label,
      })),
    [],
  );

  const selectedCategoryLabel =
    categories.find((item) => item.value === selectedCategory)?.label;

  const categoryButtonLabel = selectedCategoryLabel
    ? `${selectedCategoryLabel}${
        selectedSubcategories.length > 0
          ? ` · ${selectedSubcategories.length}`
          : ""
      }`
    : "Категория";

  const hasActiveFilters =
    selectedCategory !== "" ||
    selectedSubcategories.length > 0 ||
    selectedConditions.length > 0 ||
    selectedCities.length > 0 ||
    selectedTransfers.length > 0;

  const isOpen = (menu: MenuName) => openMenus.includes(menu);

  function toggleMenu(menu: MenuName) {
    setOpenMenus((current) =>
      current.includes(menu)
        ? current.filter((item) => item !== menu)
        : [...current, menu],
    );
  }

  function toggleCategoryMenu() {
    if (!isOpen("category")) {
      setDraftCategory(selectedCategory);
      setDraftSubcategories([...selectedSubcategories]);
    }

    toggleMenu("category");
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpenMenus([]);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenus([]);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function buildFilters(
    overrides: Partial<CatalogFilters> = {},
  ): CatalogFilters {
    return {
      query,
      category: selectedCategory,
      subcategories: selectedSubcategories,
      conditions: selectedConditions,
      cities: selectedCities,
      transferTypes: selectedTransfers,
      ...overrides,
    };
  }

  function updateArrayFilter(
    value: string,
    values: string[],
    setter: (values: string[]) => void,
    key: "conditions" | "cities" | "transferTypes",
  ) {
    const nextValues = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];

    setter(nextValues);
    onApply(buildFilters({ [key]: nextValues }));
  }

  function toggleDraftSubcategory(value: string) {
    setDraftSubcategories((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function selectDraftCategory(value: CategoryValue) {
    setDraftCategory(value);
    setDraftSubcategories([]);
  }

  function applyCategoryFilters() {
    setSelectedCategory(draftCategory);
    setSelectedSubcategories(draftSubcategories);

    onApply(
      buildFilters({
        category: draftCategory,
        subcategories: draftSubcategories,
      }),
    );

    setOpenMenus((current) =>
      current.filter((item) => item !== "category"),
    );
  }

  function resetCategoryFilters() {
    setDraftCategory(EMPTY_CATEGORY);
    setDraftSubcategories([]);
    setSelectedCategory(EMPTY_CATEGORY);
    setSelectedSubcategories([]);

    onApply(
      buildFilters({
        category: EMPTY_CATEGORY,
        subcategories: [],
      }),
    );
  }

  function resetAllFilters() {
    setQuery("");

    setSelectedCategory(EMPTY_CATEGORY);
    setSelectedSubcategories([]);
    setDraftCategory(EMPTY_CATEGORY);
    setDraftSubcategories([]);

    setSelectedConditions([]);
    setSelectedCities([]);
    setSelectedTransfers([]);

    setOpenMenus([]);

    onSearch("");

    onApply({
      query: "",
      category: EMPTY_CATEGORY,
      subcategories: [],
      conditions: [],
      cities: [],
      transferTypes: [],
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query);
    onApply(buildFilters({ query }));
  }

  function renderCheckbox(
    value: string,
    label: string,
    checked: boolean,
    onChange: () => void,
  ) {
    return (
      <label className={styles.checkRow} key={value}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <span className={styles.customCheckbox} />
        <span>{label}</span>
      </label>
    );
  }

  return (
    <div className={styles.filterArea} ref={rootRef}>
      <div className={styles.topRow}>
        <button
          type="button"
          className={`${styles.categoryButton} ${
            isOpen("category") ? styles.activeButton : ""
          }`}
          onClick={toggleCategoryMenu}
          aria-expanded={isOpen("category")}
        >
          <span className={styles.categoryIcon}>
            <img src="/catalog.svg" alt="" />
          </span>
          <span className={styles.categoryButtonText}>
            {categoryButtonLabel}
          </span>
        </button>

        <form className={styles.search} onSubmit={submitSearch}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
          </span>

          <input
            aria-label="Поиск по объявлениям"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по объявлениям"
          />

          <button type="submit">Найти</button>
        </form>

        <div className={styles.quickFilters}>
          {/* Состояние */}
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={styles.filterTrigger}
              onClick={() => toggleMenu("condition")}
              aria-expanded={isOpen("condition")}
            >
              <span className={styles.triggerIcon}>
                <img src="/star.svg" alt="" />
              </span>
              Состояние
              {selectedConditions.length > 0 &&
                ` · ${selectedConditions.length}`}
              <span className={styles.chevron} />
            </button>

            {isOpen("condition") && (
              <div className={`${styles.dropdown} ${styles.conditionDropdown}`}>
                {conditions.map((item) =>
                  renderCheckbox(
                    item.value,
                    item.label,
                    selectedConditions.includes(item.value),
                    () =>
                      updateArrayFilter(
                        item.value,
                        selectedConditions,
                        setSelectedConditions,
                        "conditions",
                      ),
                  ),
                )}
              </div>
            )}
          </div>

          {/* Местоположение */}
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={styles.filterTrigger}
              onClick={() => toggleMenu("city")}
              aria-expanded={isOpen("city")}
            >
              <span className={styles.triggerIcon}>
                <img src="/map.svg" alt="" />
              </span>
              Местоположение
              {selectedCities.length > 0 && ` · ${selectedCities.length}`}
              <span className={styles.chevron} />
            </button>

            {isOpen("city") && (
              <div className={`${styles.dropdown} ${styles.cityDropdown}`}>
                {cities.map((city) =>
                  renderCheckbox(
                    city,
                    city,
                    selectedCities.includes(city),
                    () =>
                      updateArrayFilter(
                        city,
                        selectedCities,
                        setSelectedCities,
                        "cities",
                      ),
                  ),
                )}
              </div>
            )}
          </div>

          {/* Тип передачи */}
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={styles.filterTrigger}
              onClick={() => toggleMenu("transfer")}
              aria-expanded={isOpen("transfer")}
            >
              <span className={styles.triggerIcon}>
                <img src="/energy.svg" alt="" />
              </span>
              Тип передачи
              {selectedTransfers.length > 0 &&
                ` · ${selectedTransfers.length}`}
              <span className={styles.chevron} />
            </button>

            {isOpen("transfer") && (
              <div className={`${styles.dropdown} ${styles.transferDropdown}`}>
                {transferTypes.map((item) =>
                  renderCheckbox(
                    item.value,
                    item.label,
                    selectedTransfers.includes(item.value),
                    () =>
                      updateArrayFilter(
                        item.value,
                        selectedTransfers,
                        setSelectedTransfers,
                        "transferTypes",
                      ),
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen("category") && (
        <div className={`${styles.dropdown} ${styles.categoryDropdown}`}>
          <div className={styles.categoryList}>
            {categories.map((category) => (
              <button
                type="button"
                key={category.value}
                className={
                  draftCategory === category.value
                    ? styles.activeCategory
                    : ""
                }
                onClick={() => selectDraftCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className={styles.subcategoryPanel}>
            <h2>
              {categories.find((item) => item.value === draftCategory)?.label ||
                "Категория"}
            </h2>

            {(subcategories[draftCategory] ?? []).map((item) =>
              renderCheckbox(
                item.value,
                item.label,
                draftSubcategories.includes(item.value),
                () => toggleDraftSubcategory(item.value),
              ),
            )}

            {!subcategories[draftCategory]?.length && (
              <p className={styles.noSubcategories}>
                Для этой категории подкатегории не указаны.
              </p>
            )}

            <div className={styles.dropdownActions}>
              <button
                type="button"
                onClick={resetCategoryFilters}
              >
                Сбросить
              </button>

              <button
                type="button"
                onClick={applyCategoryFilters}
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className={styles.filtersFooter}>
          <span className={styles.resultsCount}>
            Найдено {items.length} {getItemsLabel(items.length)}
          </span>

          <button
            type="button"
            className={styles.resetAllButton}
            onClick={resetAllFilters}
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}