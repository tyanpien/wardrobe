"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "@/entities/item";
import { getMyProfile } from "@/entities/user/api/profile";

type Transfer = "free" | "exchange";

type PhotoDraft = {
  previewUrl: string;
  file: File;
  name: string;
};

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

export default function CreateItemPage() {
  const router = useRouter();
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
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
            if (!cancelled && user.city) setCity(user.city);
          }
        } catch {
          
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [photos]);

  async function readFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError("");
    const selected = Array.from(fileList);

    if (photos.length + selected.length > 5) {
      setError("Можно добавить не более 5 фотографий.");
      return;
    }

    const invalid = selected.find(
      (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type),
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
            previewUrl: URL.createObjectURL(jpegFile),
            file: jpegFile,
            name: file.name,
          } satisfies PhotoDraft;
        }),
      );
      setPhotos((current) => [...current, ...prepared].slice(0, 5));
    } catch {
      setError("Не удалось загрузить фотографии. Попробуйте выбрать их ещё раз.");
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
      const next = current.filter((_, photoIndex) => photoIndex !== index);
      URL.revokeObjectURL(current[index]?.previewUrl || "");
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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

    if (!city.trim()) {
      setError(
        "Укажите город в профиле — он подставляется в объявление автоматически.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const created = await createListing({
        title: title.trim(),
        description: description.trim(),
        category,
        subcategory: category === "other" ? undefined : subcategory,
        condition,
        transferType: transfer,
        exchangeWishes:
          transfer === "exchange" ? exchangeWishes.trim() : undefined,
        deliveryMethod: delivery,
        photos: photos.map((photo) => photo.file),
      });

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
          <div className={styles.successIcon}>✓</div>
          <h1>Объявление опубликовано</h1>
          <p>Оно уже доступно в каталоге и в разделе «Мои объявления».</p>
          <div className={styles.successActions}>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className={styles.publishButton}
            >
              Мои объявления
            </button>
            {createdId ? (
              <button
                type="button"
                onClick={() => router.push(`/catalog/${createdId}`)}
                className={styles.backToForm}
              >
                Открыть объявление
              </button>
            ) : null}
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
    ? getSubcategoryOptions(category).map((item) => ({
        value: item.value,
        label: item.label,
      }))
    : [];

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <Link href="/profile" className={styles.backButton} aria-label="Назад">
          <img src="/eva_arrow-back-fill.svg" alt="Назад" />
        </Link>
        <h1>Создать объявление</h1>
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
            <input
              value={city}
              readOnly
              placeholder="Укажите город в профиле"
              maxLength={100}
              required
            />
            <small>
              Город берётся из профиля.{" "}
              <Link href="/profile/edit">Изменить</Link>
            </small>
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
                  <div className={styles.photoPreview} key={`${photo.name}-${index}`}>
                    <img src={photo.previewUrl} alt={photo.name || `Фото ${index + 1}`} />
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
              {submitting ? "Публикация..." : "Опубликовать"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
