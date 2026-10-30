"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, FormEvent, useEffect, useRef, useState } from "react";
import styles from "./create-item.module.css";
import { CategorySelect } from "@/shared/ui/CategorySelect/CategorySelect";

type Category = "clothing" | "shoes" | "accessories" | "home_textile" | "kids" | "other";
type Condition = "new" | "good" | "excellent" | "needs_repair";
type Transfer = "free" | "exchange";

type SavedAd = {
  id: number;
  title: string;
  description: string;
  transfer: Transfer;
  category: Category;
  subcategory: string;
  condition: Condition;
  status: "published" | "in_transfer" | "transferred" | "unpublished";
  city: string;
  photo: string;
  photos: string[];
  exchangeWishes: string;
  createdAt: string;
  delivery: "meeting" | "pickup" | "agreement";
};

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "clothing", label: "Одежда" },
  { value: "shoes", label: "Обувь" },
  { value: "accessories", label: "Аксессуары" },
  { value: "home_textile", label: "Домашний текстиль" },
  { value: "kids", label: "Детские вещи" },
  { value: "other", label: "Другое" },
];

const SUBCATEGORIES: Record<Category, { value: string; label: string }[]> = {
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
    { value: "shoes_demi", label: "Демисезонная обувь" },
    { value: "shoes_sport", label: "Спортивная обувь" },
    { value: "shoes_winter", label: "Зимняя обувь" },
    { value: "shoes_summer", label: "Летняя обувь" },
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

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "new", label: "Новое" },
  { value: "good", label: "Хорошее" },
  { value: "excellent", label: "Отличное" },
  { value: "needs_repair", label: "Требует ремонта" },
];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const STORAGE_KEY = "dobry-shkaf-created-ads";

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Не удалось прочитать файл"));
        return;
      }
      const image = new Image();
      image.onerror = () => reject(new Error("Не удалось обработать изображение"));
      image.onload = () => {
        const maxDimension = 1400;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Браузер не смог обработать изображение"));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function CreateItemPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [subcategory, setSubcategory] = useState("");
  const [condition, setCondition] = useState<Condition>("new");
  const [transfer, setTransfer] = useState<Transfer>("exchange");
  const [exchangeWishes, setExchangeWishes] = useState("");
  const [delivery, setDelivery] = useState<"meeting" | "pickup" | "agreement">("meeting");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [city, setCity] = useState("Екатеринбург");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("dobry-shkaf-user");
      if (savedUser) {
        const user = JSON.parse(savedUser) as { city?: string };
        if (user.city) setCity(user.city);
      }
    } catch {

    }
  }, []);

  function readFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError("");
    const selected = Array.from(fileList);
    if (photos.length + selected.length > 5) {
      setError("Можно добавить не более 5 фотографий.");
      return;
    }
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (invalid) {
      setError("Поддерживаются только JPG, PNG и WEBP.");
      return;
    }
    const tooLarge = selected.find((file) => file.size > MAX_PHOTO_SIZE);
    if (tooLarge) {
      setError(`Файл «${tooLarge.name}» больше 5 МБ.`);
      return;
    }

    Promise.all(selected.map(compressImage))
      .then((dataUrls) => {
        setPhotos((current) => [...current, ...dataUrls].slice(0, 5));
        setPhotoNames((current) => [...current, ...selected.map((file) => file.name)].slice(0, 5));
      })
      .catch(() => setError("Не удалось загрузить фотографии. Попробуйте выбрать их ещё раз."));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    readFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    readFiles(event.dataTransfer.files);
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
    setPhotoNames((current) => current.filter((_, photoIndex) => photoIndex !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!category) {
      setError("Выберите категорию.");
      return;
    }
    if (!subcategory) {
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

    const ad: SavedAd = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      transfer,
      category,
      subcategory,
      condition,
      status: "published",
      city: city.trim() || "Город не указан",
      photo: photos[0],
      photos,
      exchangeWishes: transfer === "exchange" ? exchangeWishes.trim() : "",
      createdAt: new Date().toISOString(),
      delivery,
    };

    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as SavedAd[];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([ad, ...current]));
      window.dispatchEvent(new Event("dobry-shkaf-ads-updated"));
      setSuccess(true);
    } catch {
      setError("Не удалось сохранить объявление в браузере. Возможно, фотографии слишком большие. Попробуйте загрузить файлы меньшего размера.");
    }
  }

  if (success) {
    return (
      <main className={styles.page}>
        <div className={styles.successPanel}>
          <div className={styles.successIcon}>✓</div>
          <h1>Объявление опубликовано</h1>
          <p>Оно сохранено в этом браузере и появится в разделе «Мои объявления».</p>
          <div className={styles.successActions}>
            <button type="button" onClick={() => router.push("/profile")} className={styles.publishButton}>Мои объявления</button>
            <button type="button" onClick={() => { setSuccess(false); setTitle(""); setDescription(""); setCategory(""); setSubcategory(""); setCondition("new"); setTransfer("exchange"); setExchangeWishes(""); setDelivery("meeting"); setPhotos([]); setPhotoNames([]); }} className={styles.backToForm}>Создать ещё одно</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageHeading}>
        <Link href="/profile" className={styles.backButton} aria-label="Назад"><img src="/eva_arrow-back-fill.svg" alt="Назад" /></Link>
        <h1>Создать объявление</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.column}>
          <label className={styles.field}>
            <span>Название</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Например, зимняя куртка" maxLength={80} required />
          </label>

          <label className={`${styles.field} ${styles.descriptionField}`}>
            <span>Описание</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Опишите вещь, её состояние и особенности" maxLength={1500} required />
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

          <label className={styles.field}>
            <span>Подкатегория</span>
            <CategorySelect
              value={subcategory}
              options={category ? SUBCATEGORIES[category] : []}
              placeholder={
                category ? "Выберите подкатегорию" : "Сначала выберите категорию"
              }
              onChange={setSubcategory}
            />
          </label>

          <fieldset className={styles.choiceGroup}>
            <legend>Состояние</legend>
            <div className={styles.conditionOptions}>
              {CONDITIONS.map((item) => (
                <label className={styles.radioLabel} key={item.value}>
                  <input type="radio" name="condition" value={item.value} checked={condition === item.value} onChange={() => setCondition(item.value)} />
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
              <label className={styles.radioLabel}><input type="radio" name="transfer" checked={transfer === "free"} onChange={() => setTransfer("free")} /><span>Бесплатно</span></label>
              <label className={styles.radioLabel}><input type="radio" name="transfer" checked={transfer === "exchange"} onChange={() => setTransfer("exchange")} /><span>Обмен</span></label>
            </div>
          </fieldset>

          {transfer === "exchange" && (
            <label className={styles.field}>
              <span>Пожелания по обмену</span>
              <input value={exchangeWishes} onChange={(event) => setExchangeWishes(event.target.value)} placeholder="На что хотите обменять" required />
            </label>
          )}

          <fieldset className={styles.choiceGroup}>
            <legend>Способ передачи</legend>
            <div className={styles.radioOptions}>
              <label className={styles.radioLabel}><input type="radio" name="delivery" checked={delivery === "meeting"} onChange={() => setDelivery("meeting")} /><span>Встреча</span></label>
              <label className={styles.radioLabel}><input type="radio" name="delivery" checked={delivery === "pickup"} onChange={() => setDelivery("pickup")} /><span>Самовывоз</span></label>
              <label className={styles.radioLabel}><input type="radio" name="delivery" checked={delivery === "agreement"} onChange={() => setDelivery("agreement")} /><span>По договоренности</span></label>
            </div>
          </fieldset>

          <label className={styles.field}>
            <span>Город</span>
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Укажите город"
              maxLength={100}
              required
            />
          </label>
          
          <div className={styles.field}>
            <span>Фото</span>
            <div className={styles.dropZone} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              <input ref={fileInputRef} className={styles.hiddenInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} />
              <button type="button" className={styles.addPhotoButton} onClick={() => fileInputRef.current?.click()} disabled={photos.length >= 5}>↥&nbsp; Добавить фото</button>
              <p>Перетащите изображения сюда или нажмите, чтобы<br className={styles.desktopBreak} /> выбрать файлы</p>
              <small>JPG, PNG. Не более 5 фотографий до 5 МБ.</small>
            </div>
            {photos.length > 0 && (
              <div className={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <div className={styles.photoPreview} key={`${photo.slice(0, 30)}-${index}`}>
                    <img src={photo} alt={photoNames[index] || `Фото ${index + 1}`} />
                    <button type="button" onClick={() => removePhoto(index)} aria-label={`Удалить фото ${index + 1}`}>×</button>
                    {index === 0 && <span>Главное</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.submitRow}>
            <button type="submit" className={styles.publishButton}>Опубликовать</button>
          </div>
        </div>
      </form>
    </main>
  );
}
