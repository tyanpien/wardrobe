"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "../../create/create-item.module.css";
import { CategorySelect } from "@/shared/ui/CategorySelect/CategorySelect";
import type {
  DeliveryMethod,
  Item,
  ItemCategory,
  ItemCondition,
  ItemPhoto,
} from "@/entities/item";
import {
  CATEGORY_OPTIONS,
  addListingPhotos,
  deleteListingPhoto,
  fetchListing,
  getListingErrorMessage,
  getSubcategoryOptions,
  prepareListingPhoto,
  updateListing,
} from "@/entities/item";

type Transfer = "free" | "exchange";

type NewPhotoDraft = {
  kind: "new";
  previewUrl: string;
  file: File;
  name: string;
};

type ExistingPhotoDraft = {
  kind: "existing";
  id: string;
  previewUrl: string;
  name: string;
};

type PhotoDraft = NewPhotoDraft | ExistingPhotoDraft;

const CATEGORIES = CATEGORY_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}));

const CONDITIONS: { value: ItemCondition; label: string }[] = [
  { value: "new", label: "Новое" },
  { value: "good", label: "Хорошее" },
  { value: "excellent", label: "Отличное" },
  { value: "needs_repair", label: "Требует ремонта" },
];

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function toExistingPhotos(item: Item): ExistingPhotoDraft[] {
  if (item.photos?.length) {
    return item.photos.map((photo: ItemPhoto, index) => ({
      kind: "existing" as const,
      id: photo.id,
      previewUrl: photo.url,
      name: `Фото ${index + 1}`,
    }));
  }

  return item.photoUrls.map((url, index) => ({
    kind: "existing" as const,
    id: `legacy-${index}`,
    previewUrl: url,
    name: `Фото ${index + 1}`,
  }));
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [listingId, setListingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [subcategory, setSubcategory] = useState("");
  const [condition, setCondition] = useState<ItemCondition>("new");
  const [transfer, setTransfer] = useState<Transfer>("exchange");
  const [exchangeWishes, setExchangeWishes] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod>("meeting");
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [found, setFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      setLoading(true);
      setError("");

      try {
        const item = await fetchListing(params.id);

        if (cancelled) return;

        const rawUser = localStorage.getItem("dobry-shkaf-user");
        const user = rawUser
          ? (JSON.parse(rawUser) as { id?: string })
          : null;

        if (!user?.id || user.id !== item.ownerId) {
          setFound(false);
          setError("Редактировать можно только свои объявления.");
          return;
        }

        if (item.status !== "published" && item.status !== "unpublished") {
          setFound(false);
          setError(
            "Объявление нельзя редактировать в текущем статусе.",
          );
          return;
        }

        setFound(true);
        setListingId(item.id);
        setTitle(item.title);
        setDescription(item.description);
        setCategory(item.category);
        setSubcategory(item.subcategory || "");
        setCondition(item.condition);
        setTransfer(item.transferType === "free" ? "free" : "exchange");
        setExchangeWishes(item.exchangeWishes || "");
        setDelivery(item.deliveryMethod || "meeting");
        setCity(item.city);
        setPhotos(toExistingPhotos(item));
        setRemovedPhotoIds([]);
      } catch (loadError) {
        if (cancelled) return;
        setFound(false);
        setError(getListingErrorMessage(loadError, "Объявление не найдено."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadListing();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function readFiles(fileList: FileList | null) {
    if (!fileList) return;

    setError("");
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

    const tooLarge = selected.find((file) => file.size > MAX_PHOTO_SIZE);

    if (tooLarge) {
      setError(`Файл «${tooLarge.name}» больше 5 МБ.`);
      return;
    }

    try {
      const prepared = await Promise.all(
        selected.map(async (file) => {
          const jpegFile = await prepareListingPhoto(file);
          return {
            kind: "new" as const,
            previewUrl: URL.createObjectURL(jpegFile),
            file: jpegFile,
            name: file.name,
          } satisfies NewPhotoDraft;
        }),
      );
      setPhotos((current) => [...current, ...prepared].slice(0, 5));
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
    const target = photos[index];
  
    if (!target) return;
  
    if (
      target.kind === "existing" &&
      !target.id.startsWith("legacy-")
    ) {
      setRemovedPhotoIds((current) =>
        current.includes(target.id)
          ? current
          : [...current, target.id]
      );
    }
  
    if (target.kind === "new") {
      URL.revokeObjectURL(target.previewUrl);
    }
  
    setPhotos((current) =>
      current.filter((_, photoIndex) => photoIndex !== index)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!listingId) {
      setError("Не удалось определить объявление для сохранения.");
      return;
    }

    if (!category) {
      setError("Выберите категорию.");
      return;
    }

    if (category !== "other" && !subcategory) {
      setError("Выберите подкатегорию.");
      return;
    }

    if (photos.length === 0) {
      setError("Добавьте хотя бы одну фотографию.");
      return;
    }

    if (transfer === "exchange" && !exchangeWishes.trim()) {
      setError("Укажите, на что хотите обменять вещь.");
      return;
    }

    setSubmitting(true);

    try {
      await updateListing(listingId, {
        title: title.trim(),
        description: description.trim(),
        category,
        subcategory: category === "other" ? null : subcategory,
        condition,
        transferType: transfer,
        exchangeWishes:
          transfer === "exchange" ? exchangeWishes.trim() : null,
        deliveryMethod: delivery,
      });

      const newFiles = photos
        .filter((photo): photo is NewPhotoDraft => photo.kind === "new")
        .map((photo) => photo.file);

      if (newFiles.length > 0) {
        await addListingPhotos(listingId, newFiles);
      }

      const uniqueRemovedPhotoIds = [...new Set(removedPhotoIds)];

      for (const photoId of uniqueRemovedPhotoIds) {
        await deleteListingPhoto(listingId, photoId);
      }

      const refreshed = await fetchListing(listingId);
      setPhotos(toExistingPhotos(refreshed));
      setRemovedPhotoIds([]);
      setSuccess(true);
    } catch (submitError) {
      setError(getListingErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <p>Загрузка объявления...</p>
      </main>
    );
  }

  if (success) {
    return (
      <main className={styles.page}>
        <div className={styles.successPanel}>
          <div className={styles.successIcon}>✓</div>
          <h1>Изменения сохранены</h1>
          <p>Объявление обновлено на сервере.</p>
          <div className={styles.successActions}>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className={styles.publishButton}
            >
              Мои объявления
            </button>
            <button
              type="button"
              onClick={() => router.push(`/catalog/${listingId}`)}
              className={styles.backToForm}
            >
              Открыть объявление
            </button>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className={styles.backToForm}
            >
              Продолжить редактирование
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!found) {
    return (
      <main className={styles.page}>
        <div className={styles.pageHeading}>
          <Link
            href="/profile"
            className={styles.backButton}
            aria-label="Назад"
          >
            <img src="/eva_arrow-back-fill.svg" alt="Назад" />
          </Link>
          <h1>Редактировать объявление</h1>
        </div>

        <p className={styles.error} role="alert">
          {error || "Объявление не найдено."}
        </p>

        <button
          type="button"
          className={styles.publishButton}
          onClick={() => router.push("/profile")}
        >
          Вернуться к объявлениям
        </button>
      </main>
    );
  }

  const subcategoryOptions = category
    ? getSubcategoryOptions(category).map((item) => ({
        value: item.value,
        label: item.label,
      }))
    : [];

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <Link
          href="/profile"
          className={styles.backButton}
          aria-label="Назад"
        >
          <img src="/eva_arrow-back-fill.svg" alt="Назад" />
        </Link>
        <h1>Редактировать объявление</h1>
      </div>

      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
        <div className={styles.column}>
          <label className={styles.field}>
            <span>Название</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например, зимняя куртка"
              maxLength={80}
              required
            />
          </label>

          <label className={`${styles.field} ${styles.descriptionField}`}>
            <span>Описание</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Опишите вещь, её состояние и особенности"
              maxLength={1500}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Категория</span>
            <CategorySelect
              value={category}
              options={CATEGORIES}
              placeholder="Выберите категорию"
              onChange={(value) => {
                setCategory(value);
                setSubcategory("");
              }}
            />
          </label>

          {category !== "other" && (
            <label className={styles.field}>
              <span>Подкатегория</span>
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
              {CONDITIONS.map((item) => (
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
              <span>Пожелания по обмену</span>
              <input
                value={exchangeWishes}
                onChange={(event) => setExchangeWishes(event.target.value)}
                placeholder="На что хотите обменять"
                required
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

          <label className={styles.field}>
            <span>Город</span>
            <input value={city} readOnly maxLength={100} required />
            <small>Город берётся из профиля и не меняется здесь.</small>
          </label>

          <div className={styles.field}>
            <span>Фото</span>
            <div
              className={styles.dropZone}
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
                    key={`${photo.kind}-${photo.name}-${index}`}
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
              disabled={submitting}
            >
              {submitting ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
