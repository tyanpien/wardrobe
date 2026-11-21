"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./create-item.module.css";
import { CategorySelect } from "@/shared/ui/CategorySelect/CategorySelect";
import type {
  DeliveryMethod,
  ItemCategory,
  ItemCondition,
} from "@/entities/item";
import {
  CATEGORY_OPTIONS,
  createListing,
  getListingErrorMessage,
  getSubcategoryOptions,
  prepareListingPhoto,
  conditionToApi,
} from "@/entities/item";
import { getMyProfile } from "@/entities/user/api/profile";
import { getOrganizationDto } from "@/entities/organization/api/organizations";
import type { OrganizationDetailDto } from "@/entities/organization/model/dto";

type Transfer = "free" | "exchange";

type PhotoDraft = {
  previewUrl: string;
  file: File;
  name: string;
};

type FieldName = "title" | "description" | "category" | "city" | "photos";

type FieldErrors = Partial<Record<FieldName, string>>;

const CONDITIONS: { value: ItemCondition; label: string }[] = [
  { value: "new", label: "Новое" },
  { value: "good", label: "Хорошее" },
  { value: "excellent", label: "Отличное" },
  { value: "needs_repair", label: "Требует ремонта" },
];

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function normalizeRule(value: string | null | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase("ru-RU");
}

export default function CreateItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");
  const isOrganizationMode = Boolean(organizationId);
  const returnToOrganization = organizationId
    ? `/organizations/${organizationId}?openTransfer=1`
    : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [subcategory, setSubcategory] = useState("");
  const [condition, setCondition] = useState<ItemCondition>("new");
  const [transfer, setTransfer] = useState<Transfer>("exchange");
  const [exchangeWishes, setExchangeWishes] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod>("meeting");
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [city, setCity] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [organization, setOrganization] =
    useState<OrganizationDetailDto | null>(null);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [organizationError, setOrganizationError] = useState("");

  function clearFieldError(field: FieldName) {
    setFieldErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function setFieldValueError(field: FieldName, message: string) {
    setFieldErrors((current) => ({
      ...current,
      [field]: message,
    }));
  }

  useEffect(() => {
    let cancelled = false;

    getMyProfile()
      .then((profile) => {
        if (!cancelled) {
          setCity(profile.city ?? "");
        }
      })
      .catch(() => {
        try {
          const savedUser = localStorage.getItem("dobry-shkaf-user");

          if (savedUser) {
            const user = JSON.parse(savedUser) as { city?: string };

            if (!cancelled && user.city) {
              setCity(user.city);
            }
          }
        } catch {
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!organizationId) {
      setOrganization(null);
      setOrganizationError("");
      setOrganizationLoading(false);
      return;
    }
    const currentOrganizationId = organizationId;
    let cancelled = false;

    async function loadOrganizationRules() {
      setOrganizationLoading(true);
      setOrganizationError("");

      try {
        const result = await getOrganizationDto(currentOrganizationId);
        if (cancelled) return;

        setOrganization(result);

        const firstAllowedCondition = CONDITIONS.find((option) =>
          result.acceptance_rules.conditions.some(
            (value) =>
              normalizeRule(value) ===
                normalizeRule(conditionToApi(option.value)) ||
              normalizeRule(value) === normalizeRule(option.value),
          ),
        );

        if (firstAllowedCondition) {
          setCondition(firstAllowedCondition.value);
        }
      } catch {
        if (!cancelled) {
          setOrganizationError(
            "Не удалось загрузить правила приёма организации. Попробуйте обновить страницу.",
          );
        }
      } finally {
        if (!cancelled) {
          setOrganizationLoading(false);
        }
      }
    }

    void loadOrganizationRules();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });
    };
  }, [photos]);

  const allowedCategories = !isOrganizationMode
    ? CATEGORY_OPTIONS
    : organization
      ? organization.acceptance_rules.categories.flatMap((rule) => {
          const categoryOption = CATEGORY_OPTIONS.find(
            (option) =>
              normalizeRule(option.api) === normalizeRule(rule.name) ||
              normalizeRule(option.label) === normalizeRule(rule.name) ||
              normalizeRule(option.value) === normalizeRule(rule.name),
          );

          if (!categoryOption) return [];

          const allowedSubcategories =
            rule.subcategories.length === 0
              ? categoryOption.subcategories
              : categoryOption.subcategories.filter((subcategoryOption) =>
                  rule.subcategories.some(
                    (value) =>
                      normalizeRule(value) ===
                        normalizeRule(subcategoryOption.api) ||
                      normalizeRule(value) ===
                        normalizeRule(subcategoryOption.label) ||
                      normalizeRule(value) ===
                        normalizeRule(subcategoryOption.value),
                  ),
                );

          return [
            {
              ...categoryOption,
              subcategories: allowedSubcategories,
            },
          ];
        })
      : [];

  const allowedConditions = !isOrganizationMode
    ? CONDITIONS
    : organization
      ? CONDITIONS.filter((option) =>
          organization.acceptance_rules.conditions.some(
            (value) =>
              normalizeRule(value) ===
                normalizeRule(conditionToApi(option.value)) ||
              normalizeRule(value) === normalizeRule(option.value),
          ),
        )
      : [];

  const selectedCategoryOption = allowedCategories.find(
    (option) => option.value === category,
  );

  const categorySelectOptions = allowedCategories.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  async function readFiles(fileList: FileList | null) {
    if (!fileList) return;

    const selected = Array.from(fileList);

    if (photos.length + selected.length > 5) {
      setError("Можно добавить не более 5 фотографий.");
      return;
    }

    const invalid = selected.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );

    if (invalid) {
      setError("Поддерживаются только JPG, PNG и WEBP.");
      return;
    }

    const tooLarge = selected.find(
      (file) => file.size > MAX_PHOTO_SIZE,
    );

    if (tooLarge) {
      setError(`Файл «${tooLarge.name}» больше 5 МБ.`);
      return;
    }

    try {
      const prepared = await Promise.all(
        selected.map(async (file) => {
          const jpegFile = await prepareListingPhoto(file);

          return {
            previewUrl: URL.createObjectURL(jpegFile),
            file: jpegFile,
            name: file.name,
          } satisfies PhotoDraft;
        }),
      );

      setPhotos((current) => [...current, ...prepared].slice(0, 5));

      setFieldErrors((current) => {
        const next = { ...current };
        delete next.photos;
        return next;
      });

      setError("");
    } catch {
      setError(
        "Не удалось загрузить фотографии. Попробуйте выбрать их ещё раз.",
      );
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    void readFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void readFiles(event.dataTransfer.files);
  }

  function removePhoto(index: number) {
    setPhotos((current) => {
      const next = current.filter(
        (_, photoIndex) => photoIndex !== index,
      );

      URL.revokeObjectURL(current[index]?.previewUrl || "");

      if (next.length === 0) {
        setFieldValueError("photos", "Добавьте хотя бы одну фотографию.");
      }

      return next;
    });
  }

  function validateForm(): boolean {
    const errors: FieldErrors = {};

    if (!title.trim()) {
      errors.title = "Введите название объявления.";
    }

    if (!description.trim()) {
      errors.description = "Введите описание объявления.";
    }

    if (!category) {
      errors.category = "Выберите категорию.";
    } else if (
      isOrganizationMode &&
      !allowedCategories.some((option) => option.value === category)
    ) {
      errors.category =
        "Эта категория не входит в правила приёма организации.";
    }

    if (
      isOrganizationMode &&
      !allowedConditions.some((option) => option.value === condition)
    ) {
      errors.category =
        "Выберите состояние из правил приёма организации.";
    }

    if (
      isOrganizationMode &&
      subcategory &&
      selectedCategoryOption &&
      !selectedCategoryOption.subcategories.some(
        (option) => option.value === subcategory,
      )
    ) {
      errors.category =
        "Выберите подкатегорию из правил приёма организации.";
    }

    if (!city.trim()) {
      errors.city =
        "Укажите город в профиле. Он необходим для публикации объявления.";
    }

    if (photos.length === 0) {
      errors.photos = "Добавьте хотя бы одну фотографию.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    if (!category) {
      return;
    }

    if (isOrganizationMode) {
      if (organizationLoading || !organization || organizationError) {
        setError(
          organizationError ||
            "Дождитесь загрузки правил организации.",
        );
        return;
      }

      if (
        allowedCategories.length === 0 ||
        allowedConditions.length === 0
      ) {
        setError(
          "В правилах организации не указаны доступные категории или состояния.",
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const created = await createListing({
        title: title.trim(),
        description: description.trim(),
        category: category,
        subcategory:
          category === "other" || !subcategory
            ? undefined
            : subcategory,
        condition,
        transferType: transfer,
        exchangeWishes:
          transfer === "exchange" && exchangeWishes.trim()
            ? exchangeWishes.trim()
            : undefined,
        deliveryMethod: delivery,
        photos: photos.map((photo) => photo.file),
      });

      if (isOrganizationMode && returnToOrganization) {
        router.replace(returnToOrganization);
        return;
      }

      setCreatedId(created.id);
      setSuccess(true);
    } catch (submitError) {
      setError(getListingErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className={styles.page}>
        <div className={styles.successPanel}>
          <div className={styles.successIcon}>
            <img src="/success.svg" alt="" />
          </div>

          <h1>Объявление опубликовано</h1>

          <p>
            Оно уже доступно в каталоге и в разделе «Мои объявления».
          </p>

          <div className={styles.successActions}>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className={styles.publishButton}
            >
              Мои объявления
            </button>

            {createdId && (
              <button
                type="button"
                onClick={() => router.push(`/catalog/${createdId}`)}
                className={styles.backToForm}
              >
                Открыть объявление
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setCreatedId(null);
                setTitle("");
                setDescription("");
                setCategory("");
                setSubcategory("");
                setCondition("new");
                setTransfer("exchange");
                setExchangeWishes("");
                setDelivery("meeting");
                setPhotos([]);
                setFieldErrors({});
                setError("");
              }}
              className={styles.backToForm}
            >
              Создать ещё одно
            </button>
          </div>
        </div>
      </main>
    );
  }

  const subcategoryOptions = category
    ? (
        isOrganizationMode
          ? selectedCategoryOption?.subcategories ?? []
          : getSubcategoryOptions(category)
      ).map((item) => ({
        value: item.value,
        label: item.label,
      }))
    : [];

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <Link
          href={returnToOrganization ?? "/profile"}
          className={styles.backButton}
          aria-label="Назад"
        >
          <img src="/eva_arrow-back-fill.svg" alt="Назад" />
        </Link>

        <h1>
          {isOrganizationMode
            ? "Создать объявление для организации"
            : "Создать объявление"}
        </h1>
      </div>

      {isOrganizationMode && (
        <p role="status" className={styles.error}>
          {organizationLoading
            ? "Загружаем правила приёма организации..."
            : organizationError }
        </p>
      )}

      <form
        className={styles.form}
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <div className={styles.column}>
          <label
            className={`${styles.field} ${
              fieldErrors.title ? styles.fieldInvalid : ""
            }`}
          >
            <span>Название</span>

            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                clearFieldError("title");
              }}
              placeholder="Например, зимняя куртка"
              maxLength={80}
              aria-invalid={Boolean(fieldErrors.title)}
            />

            {fieldErrors.title && (
              <span className={styles.fieldError} role="alert">
                {fieldErrors.title}
              </span>
            )}
          </label>

          <label
            className={`${styles.field} ${styles.descriptionField} ${
              fieldErrors.description ? styles.fieldInvalid : ""
            }`}
          >
            <span>Описание</span>
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                clearFieldError("description");
              }}
              placeholder="Опишите вещь, её состояние и особенности"
              maxLength={1500}
              aria-invalid={Boolean(fieldErrors.description)}
            />
            {fieldErrors.description && (
              <span className={styles.fieldError} role="alert">
                {fieldErrors.description}
              </span>
            )}
          </label>

          <div
            className={`${styles.field} ${
              fieldErrors.category ? styles.fieldInvalid : ""
            }`}
          >
            <span>Категория</span>

            <div
              className={
                fieldErrors.category ? styles.categoryInvalid : ""
              }
            >
              <CategorySelect
                value={category}
                options={categorySelectOptions}
                placeholder="Выберите категорию"
                onChange={(value) => {
                  setCategory(value);
                  setSubcategory("");
                  clearFieldError("category");
                }}
              />
            </div>

            {fieldErrors.category && (
              <span className={styles.fieldError} role="alert">
                {fieldErrors.category}
              </span>
            )}
          </div>

          {category !== "other" && (
            <label className={styles.field}>
              <span>Подкатегория (необязательно)</span>
              <CategorySelect
                value={subcategory}
                options={subcategoryOptions}
                placeholder={
                  category
                    ? "Выберите подкатегорию"
                    : "Сначала выберите категорию"
                }
                onChange={setSubcategory}
              />
            </label>
          )}

          <fieldset className={styles.choiceGroup}>
            <legend>Состояние</legend>
            <div className={styles.conditionOptions}>
              {allowedConditions.map((item) => (
                <label className={styles.radioLabel} key={item.value}>
                  <input
                    type="radio"
                    name="condition"
                    value={item.value}
                    checked={condition === item.value}
                    onChange={() => setCondition(item.value)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className={styles.column}>
          <fieldset className={styles.choiceGroup}>
            <legend>Тип передачи</legend>
            <div className={styles.radioOptions}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="transfer"
                  checked={transfer === "free"}
                  onChange={() => setTransfer("free")}
                />
                <span>Бесплатно</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="transfer"
                  checked={transfer === "exchange"}
                  onChange={() => setTransfer("exchange")}
                />
                <span>Обмен</span>
              </label>
            </div>
          </fieldset>

          {transfer === "exchange" && (
            <label className={styles.field}>
              <span>Пожелания по обмену (необязательно)</span>

              <input
                value={exchangeWishes}
                onChange={(event) => setExchangeWishes(event.target.value)}
                placeholder="На что хотите обменять"
              />
            </label>
          )}

          <fieldset className={styles.choiceGroup}>
            <legend>Способ передачи</legend>
            <div className={styles.radioOptions}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="delivery"
                  checked={delivery === "meeting"}
                  onChange={() => setDelivery("meeting")}
                />
                <span>Встреча</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="delivery"
                  checked={delivery === "pickup"}
                  onChange={() => setDelivery("pickup")}
                />
                <span>Самовывоз</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="delivery"
                  checked={delivery === "agreement"}
                  onChange={() => setDelivery("agreement")}
                />
                <span>По договоренности</span>
              </label>
            </div>
          </fieldset>

          <label
            className={`${styles.field} ${
              fieldErrors.city ? styles.fieldInvalid : ""
            }`}
          >
            <span>Город</span>
            <input
              value={city}
              readOnly
              placeholder="Укажите город в профиле"
              maxLength={100}
              aria-invalid={Boolean(fieldErrors.city)}
            />
            <small>
              Город берётся из профиля.{" "}
              <Link href="/profile/edit">Изменить</Link>
            </small>
            {fieldErrors.city && (
              <span className={styles.fieldError} role="alert">
                {fieldErrors.city}
              </span>
            )}
          </label>

          <div
            className={`${styles.field} ${
              fieldErrors.photos ? styles.fieldInvalid : ""
            }`}
          >
            <span>Фото</span>
            <div
              className={`${styles.dropZone} ${
                fieldErrors.photos ? styles.dropZoneInvalid : ""
              }`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                className={styles.hiddenInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
              />
              <button
                type="button"
                className={styles.addPhotoButton}
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= 5}
              >
                ↥&nbsp; Добавить фото
              </button>
              <p>
                Перетащите изображения сюда или нажмите, чтобы
                <br className={styles.desktopBreak} /> выбрать файлы
              </p>
              <small>JPG, PNG. Не более 5 фотографий до 5 МБ.</small>
            </div>
            {photos.length > 0 && (
              <div className={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <div
                    className={styles.photoPreview}
                    key={`${photo.name}-${index}`}
                  >
                    <img
                      src={photo.previewUrl}
                      alt={photo.name || `Фото ${index + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      aria-label={`Удалить фото ${index + 1}`}
                    >
                      ×
                    </button>
                    {index === 0 && <span>Главное</span>}
                  </div>
                ))}
              </div>
            )}

            {fieldErrors.photos && (
              <span className={styles.fieldError} role="alert">
                {fieldErrors.photos}
              </span>
            )}
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.submitRow}>
            <button
              type="submit"
              className={styles.publishButton}
              disabled={
                submitting ||
                (isOrganizationMode &&
                  (organizationLoading ||
                    Boolean(organizationError) ||
                    !organization ||
                    allowedCategories.length === 0 ||
                    allowedConditions.length === 0))
              }
            >
              {submitting ? "Публикация..." : "Опубликовать"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}