"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { KeyboardEvent } from "react";

import type { Item } from "@/entities/item";

import {
  ITEM_CATEGORY_LABELS,
  ITEM_CONDITION_LABELS,
  categoryToApi,
  conditionToApi,
  subcategoryToApi,
  subcategoryLabel,
} from "@/entities/item";

import {
  getOrganizationDto,
  getOrganizations,
} from "@/entities/organization/api/organizations";

import type { OrganizationDetailDto } from "@/entities/organization/model/dto";

import { getAvatarUrl } from "@/entities/user/api/profile";

import styles from "./TransferToOrganizationModal.module.css";

type Props = {
  open: boolean;
  item: Item | null;
  city: string;
  onClose: () => void;
};

type MatchingOrganization = {
  detail: OrganizationDetailDto;
  points: OrganizationDetailDto["addresses"];
};

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase("ru-RU");
}

function organizationAcceptsItem(
  organization: OrganizationDetailDto,
  item: Item,
): boolean {
  const rules = organization.acceptance_rules;
  const categoryName = categoryToApi(item.category);

  const acceptedCategory = rules.categories.find(
    (category) =>
      normalize(category.name) === normalize(categoryName),
  );

  if (!acceptedCategory) return false;

  const itemSubcategory = subcategoryToApi(
    item.category,
    item.subcategory,
  );

  if (
    acceptedCategory.subcategories.length > 0 &&
    (
      !itemSubcategory ||
      !acceptedCategory.subcategories.some(
        (subcategory) =>
          normalize(subcategory) === normalize(itemSubcategory),
      )
    )
  ) {
    return false;
  }

  const itemCondition = conditionToApi(item.condition);

  if (
    !rules.conditions.some(
      (condition) =>
        normalize(condition) === normalize(itemCondition),
    )
  ) {
    return false;
  }

  return true;
}

function organizationPointsInCity(
  organization: OrganizationDetailDto,
  city: string,
) {
  return organization.addresses
    .filter(
      (point) => normalize(point.city) === normalize(city),
    )
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function TransferToOrganizationModal({
  open,
  item,
  city,
  onClose,
}: Props) {
  const [organizations, setOrganizations] = useState<
    MatchingOrganization[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string | null>(null);

  const [selectedPointId, setSelectedPointId] =
    useState<string | null>(null);

  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!open || !item) return;

    const currentItem = item;
    let cancelled = false;

    async function loadMatchingOrganizations() {
      setLoading(true);
      setError("");
      setOrganizations([]);
      setSelectedOrganizationId(null);
      setSelectedPointId(null);
      setNotice("");

      if (!city.trim()) {
        setError(
          "Укажите город в настройках профиля, чтобы найти пункты приёма.",
        );
        setLoading(false);
        return;
      }

      try {
        const result = await getOrganizations({
          city: [city],
          page: 1,
          pageSize: 100,
        });

        const details = await Promise.allSettled(
          result.items.map((organization) =>
            getOrganizationDto(organization.id),
          ),
        );

        if (cancelled) return;

        const matching = details.flatMap((resultItem) => {
          if (resultItem.status !== "fulfilled") {
            return [];
          }

          const detail = resultItem.value;

          if (!organizationAcceptsItem(detail, currentItem)) {
            return [];
          }

          const points = organizationPointsInCity(detail, city);

          if (points.length === 0) {
            return [];
          }

          return [{ detail, points }];
        });

        setOrganizations(matching);
      } catch {
        if (!cancelled) {
          setError(
            "Не удалось загрузить организации. Попробуйте закрыть окно и открыть его снова.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMatchingOrganizations();

    return () => {
      cancelled = true;
    };
  }, [open, item, city]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const selectedOrganization = useMemo(
    () =>
      organizations.find(
        (organization) =>
          organization.detail.id === selectedOrganizationId,
      ) ?? null,
    [organizations, selectedOrganizationId],
  );

  const selectedPoint =
    selectedOrganization?.points.find(
      (point) => point.id === selectedPointId,
    ) ?? null;

  if (!open || !item) return null;

  const image = item.photoUrls[0] || item.coverUrl || "";

  const isPointSelection = selectedOrganization !== null;

  const handleOrganizationSelect = (organizationId: string) => {
    setSelectedOrganizationId(organizationId);
    setSelectedPointId(null);
    setNotice("");
  };

  const handleOrganizationKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    organizationId: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOrganizationSelect(organizationId);
    }
  };

  const handleBack = () => {
    setSelectedOrganizationId(null);
    setSelectedPointId(null);
    setNotice("");
  };

  const handleSubmit = () => {
    if (!selectedOrganization || !selectedPoint) return;

    setNotice("жду бекенд");
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={onClose}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-organization-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        <h2 id="transfer-organization-title">
          Передать организации
        </h2>

        <div className={styles.itemPreview}>
          {image ? (
            <img src={image} alt={item.title} />
          ) : (
            <div className={styles.imagePlaceholder} />
          )}

          <div className={styles.itemInfo}>
            <strong>{item.title}</strong>

            <span>
              {ITEM_CATEGORY_LABELS[item.category]}
              {item.subcategory
                ? ` · ${subcategoryLabel(
                    item.category,
                    item.subcategory,
                  )}`
                : ""}
            </span>

            <span className={styles.condition}>
              {ITEM_CONDITION_LABELS[item.condition]}
            </span>
          </div>
        </div>

        {!isPointSelection && (
          <>
            <div className={styles.sectionHeading}>
              <h3>Подходящие организации</h3>
            </div>

            {loading ? (
              <p className={styles.state}>
                Ищем организации, которые принимают эту вещь…
              </p>
            ) : error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : organizations.length === 0 ? (
              <p className={styles.state}>
                В вашем городе пока нет организаций, принимающих
                эту вещь с указанными характеристиками.
              </p>
            ) : (
              <div className={styles.organizationList}>
                {organizations.map(({ detail, points }) => {
                  const isSelected =
                    selectedOrganizationId === detail.id;

                  return (
                    <div
                      key={detail.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      className={`
                        ${styles.organizationOption}
                        ${isSelected ? styles.selected : ""}
                      `}
                      onClick={() =>
                        handleOrganizationSelect(detail.id)
                      }
                      onKeyDown={(event) =>
                        handleOrganizationKeyDown(
                          event,
                          detail.id,
                        )
                      }
                    >
                      {detail.logo_url ? (
                        <img
                          className={styles.organizationLogo}
                          src={getAvatarUrl(detail.logo_url)}
                          alt=""
                        />
                      ) : (
                        <span
                          className={
                            styles.organizationLogoPlaceholder
                          }
                        >
                          {detail.name.charAt(0)}
                        </span>
                      )}

                      <span className={styles.organizationText}>
                        <strong>{detail.name}</strong>

                        <small>
                          Пунктов приёма в городе: {points.length}
                        </small>
                      </span>

                      <Link
                        href={`/organizations/${detail.id}`}
                        className={styles.openOrganization}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        Открыть
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {isPointSelection && selectedOrganization && (
          <>
            <div className={styles.sectionHeading}>
              <h3>
                Пункты приёма организации{" «"}
                <Link
                  href={`/organizations/map/${encodeURIComponent(
                    selectedOrganization.detail.id,
                  )}`}
                  className={styles.organizationName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedOrganization.detail.name.charAt(0).toUpperCase() +
                    selectedOrganization.detail.name.slice(1)}
                </Link>
                {"»"}
              </h3>
            </div>

            <div className={styles.pointList}>
              {selectedOrganization.points.map((point) => (
                <label
                  key={point.id}
                  className={`
                    ${styles.pointOption}
                    ${
                      selectedPointId === point.id
                        ? styles.selectedPoint
                        : ""
                    }
                  `}
                >
                  <span>
                    <strong>
                      {point.title || "Пункт приёма"}
                    </strong>

                    {point.working_hours && (
                      <small>{point.working_hours}</small>
                    )}
                  </span>

                  <input
                    type="radio"
                    name="receiving-point"
                    checked={selectedPointId === point.id}
                    onChange={() => {
                      setSelectedPointId(point.id);
                      setNotice("");
                    }}
                  />
                </label>
              ))}
            </div>
          </>
        )}

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        {isPointSelection && (
          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
            >
              Назад
            </button>

            <button
              type="button"
              className={styles.submit}
              disabled={!selectedPoint}
              onClick={handleSubmit}
            >
              Оформить передачу
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
