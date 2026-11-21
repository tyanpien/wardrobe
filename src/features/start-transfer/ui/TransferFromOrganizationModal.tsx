"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { Item } from "@/entities/item";
import {
  fetchMyListings,
  getListingErrorMessage,
  ITEM_CATEGORY_LABELS,
  ITEM_CONDITION_LABELS,
  categoryToApi,
  conditionToApi,
  subcategoryToApi,
  subcategoryLabel,
} from "@/entities/item";

import { getOrganizationDto } from "@/entities/organization/api/organizations";

import type {
  OrganizationDetailDto,
} from "@/entities/organization/model/dto";

import { getMyProfile } from "@/entities/user/api/profile";
import { getAccessToken } from "@/shared/api/auth-headers";
import { getApiErrorMessage } from "@/shared/api/errors";

import styles from "./TransferFromOrganizationModal.module.css";

type Props = {
  open: boolean;
  organizationId: string;
  organizationName: string;
  onClose: () => void;
};

type TransferStep = "items" | "points";

type OrganizationPoint = OrganizationDetailDto["addresses"][number];

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

  if (!acceptedCategory) {
    return false;
  }

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

export function TransferFromOrganizationModal({
  open,
  organizationId,
  organizationName,
  onClose,
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState<TransferStep>("items");

  const [items, setItems] = useState<Item[]>([]);
  const [points, setPoints] = useState<OrganizationPoint[]>([]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    null,
  );

  const [selectedPointId, setSelectedPointId] = useState<string | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!open || !organizationId) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");
      setNotice("");
      setItems([]);
      setPoints([]);
      setSelectedItemId(null);
      setSelectedPointId(null);
      setStep("items");

      if (!getAccessToken()) {
        setError("Для передачи вещи необходимо войти в аккаунт.");
        setLoading(false);
        return;
      }

      try {
        const [organization, listings, profile] = await Promise.all([
          getOrganizationDto(organizationId),
          fetchMyListings({
            statuses: ["published"],
            page: 1,
            pageSize: 100,
          }),
          getMyProfile(),
        ]);

        if (cancelled) return;

        const userCity = normalize(profile.city);

        if (!userCity) {
          setError(
            "Укажите город в профиле, чтобы передавать вещи организациям с пунктами приёма в вашем городе.",
          );
          return;
        }

        const localPoints = organization.addresses
          .filter(
            (point) => normalize(point.city) === userCity,
          )
          .sort((a, b) => a.sort_order - b.sort_order);

        setPoints(localPoints);

        const matchingItems = listings.items.filter(
          (item) =>
            item.status === "published" &&
            organizationAcceptsItem(organization, item),
        );

        setItems(matchingItems);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              getListingErrorMessage(requestError) ||
                "Не удалось загрузить ваши объявления. Попробуйте ещё раз.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [open, organizationId]);

  useEffect(() => {
    if (open) return;

    setStep("items");
    setSelectedItemId(null);
    setSelectedPointId(null);
    setNotice("");
    setError("");
    setItems([]);
    setPoints([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const selectedItem = useMemo(
    () =>
      items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  const selectedPoint = useMemo(
    () =>
      points.find((point) => point.id === selectedPointId) ?? null,
    [points, selectedPointId],
  );

  if (!open) return null;

  function handleAddListing() {
    const query = new URLSearchParams({ organizationId });

    onClose();
    router.push(`/my-items/create?${query.toString()}`);
  }

  function handleContinue() {
    if (!selectedItem) return;

    if (points.length === 0) {
      setError(
        "У этой организации нет пунктов приёма в вашем городе.",
      );
      return;
    }

    setError("");
    setNotice("");
    setSelectedPointId(null);
    setStep("points");
  }

  function handleBack() {
    setStep("items");
    setSelectedPointId(null);
    setNotice("");
    setError("");
  }

  function handleSubmit() {
    if (!selectedItem || !selectedPoint) return;

    setNotice("жду бекенд");
  }

  const hasLocalPoints = points.length > 0;

  return (
    <div
      className={styles.overlay}
      onMouseDown={onClose}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-from-organization-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Закрыть окно"
        >
          ×
        </button>

        <h2 id="transfer-from-organization-title">
          Передать организации
        </h2>

        <p className={styles.description}>
          {step === "items"
            ? "Показываем только вещи, подходящие по категории и состоянию."
            : "Вещь уже выбрана. Укажите пункт приёма, куда вы её принесёте."}
        </p>

        {loading ? (
          <div className={styles.state}>
            Проверяем пункты приёма и загружаем ваши объявления...
          </div>
        ) : error && step === "items" ? (
          <div className={styles.error} role="alert">
            {error}

            {!getAccessToken() && (
              <button
                type="button"
                className={styles.loginButton}
                onClick={() => {
                  onClose();
                  router.push("/login");
                }}
              >
                Войти в аккаунт
              </button>
            )}
          </div>
        ) : !hasLocalPoints ? (
          <div className={styles.noCityPoints} role="alert">
            <strong>
              У этой организации нет пунктов приёма в вашем городе.
            </strong>

            <p>
              Передать вещь этой организации нельзя, поскольку
              у неё нет ни одного пункта приёма в вашем городе.
            </p>
          </div>
        ) : step === "items" ? (
          <>
            <div className={styles.sectionHeading}>
              <h3>Подходящие вещи</h3>
            </div>

            {items.length === 0 ? (
              <>
                <div className={styles.emptyState}>
                  <h3>Нет подходящих вещей</h3>

                  <p>
                    У вас нет опубликованных вещей, которые подходят
                    этой организации по категории и состоянию.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.addListingButton}
                  onClick={handleAddListing}
                >
                  <span aria-hidden="true">+</span>
                  Добавить объявление
                </button>
              </>
            ) : ( 
              <div className={styles.itemsList}>
                {items.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  const image =
                    item.photoUrls[0] || item.coverUrl || "";

                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`
                        ${styles.itemOption}
                        ${isSelected ? styles.selectedItem : ""}
                      `}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setNotice("");
                        setError("");
                      }}
                      aria-pressed={isSelected}
                    >
                      {image ? (
                        <img
                          className={styles.itemImage}
                          src={image}
                          alt={item.title}
                        />
                      ) : (
                        <span className={styles.imagePlaceholder} />
                      )}

                      <span className={styles.itemInfo}>
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
                      </span>

                      <span
                        className={styles.selectionMark}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {items.length > 0 && (
              <button
                type="button"
                className={styles.addListingButton}
                onClick={handleAddListing}
              >
                <span aria-hidden="true">+</span>
                Добавить объявление
              </button>
            )}
          </>
        ) : (
          <>
            <div className={styles.selectedItemSummary}>
              {selectedItem && (
                <>
                  {selectedItem.photoUrls[0] ||
                  selectedItem.coverUrl ? (
                    <img
                      src={
                        selectedItem.photoUrls[0] ||
                        selectedItem.coverUrl ||
                        ""
                      }
                      alt={selectedItem.title}
                    />
                  ) : (
                    <span className={styles.imagePlaceholder} />
                  )}

                  <span>
                    <strong>{selectedItem.title}</strong>
                    <small>
                      {ITEM_CATEGORY_LABELS[selectedItem.category]}
                      {" · "}
                      {ITEM_CONDITION_LABELS[selectedItem.condition]}
                    </small>
                  </span>
                </>
              )}
            </div>

            <div className={styles.sectionHeading}>
              <h3>
                Пункты приёма организации{" «"}
                <Link
                  href={`/organizations/map/${encodeURIComponent(organizationId)}`}
                  className={styles.organizationName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {organizationName.charAt(0).toUpperCase() + organizationName.slice(1)}
                </Link>
                {"»"}
              </h3>
            </div>

            <div className={styles.pointsList}>
              {points.map((point) => {
                const isSelected = selectedPointId === point.id;

                return (
                  <button
                    type="button"
                    key={point.id}
                    className={`
                      ${styles.pointOption}
                      ${isSelected ? styles.selectedPoint : ""}
                    `}
                    onClick={() => {
                      setSelectedPointId(point.id);
                      setNotice("");
                      setError("");
                    }}
                    aria-pressed={isSelected}
                  >
                    <span className={styles.pointInfo}>
                      <strong>
                        {point.title || "Пункт приёма"}
                      </strong>

                      {point.working_hours && (
                        <small>{point.working_hours}</small>
                      )}
                    </span>
                    <span className={styles.pointRadio} />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        {error && step === "points" && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.footer}>
          {step === "points" && hasLocalPoints && !loading ? (
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
            >
              Назад
            </button>
          ) : (
            <span />
          )}

          {step === "items" &&
            hasLocalPoints &&
            items.length > 0 &&
            !loading &&
            !error && (
              <button
                type="button"
                className={styles.continueButton}
                disabled={!selectedItem}
                onClick={handleContinue}
              >
                Продолжить
              </button>
            )}

          {step === "points" && (
            <button
              type="button"
              className={styles.continueButton}
              disabled={!selectedPoint || !selectedItem}
              onClick={handleSubmit}
            >
              Оформить передачу
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
