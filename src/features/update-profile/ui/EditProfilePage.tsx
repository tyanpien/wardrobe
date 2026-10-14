"use client";
import { CitySelect } from "@/shared/ui/CitySelect/CitySelect";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  getAvatarUrl,
  getCities,
  getMyProfile,
  getProfileErrorMessage,
  updateMyProfile,
  uploadMyAvatar,
} from "@/entities/user/api/profile";
import styles from "./EditProfilePage.module.css";

type ProfileData = {
  name: string;
  city: string;
  about: string;
  photo: string;
};

const defaultProfile: ProfileData = {
  name: "",
  city: "",
  about: "",
  photo: "",
};

export function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [userProfile, cityList] = await Promise.all([
          getMyProfile(),
          getCities(),
        ]);

        if (cancelled) return;

        setProfile({
          name: userProfile.name ?? "",
          city: userProfile.city ?? "",
          about: userProfile.about ?? "",
          photo: getAvatarUrl(userProfile.avatar_url),
        });

        setCities(cityList);
      } catch (loadError) {
        if (!cancelled) {
          setError(getProfileErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field: keyof ProfileData, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Выберите файл изображения.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Размер фотографии не должен превышать 5 МБ.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile((current) => ({
          ...current,
          photo: reader.result as string,
        }));
        setSelectedAvatar(file);
        setError("");
      }
    };

    reader.onerror = () => {
      setError("Не удалось прочитать фотографию. Попробуйте ещё раз.");
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      let updatedProfile = await updateMyProfile({
        name: profile.name.trim(),
        city: profile.city || null,
        about: profile.about.trim() || null,
      });

      if (selectedAvatar) {
        updatedProfile = await uploadMyAvatar(selectedAvatar);
      }


      const avatarUrl = getAvatarUrl(updatedProfile.avatar_url);

      setProfile({
        name: updatedProfile.name ?? "",
        city: updatedProfile.city ?? "",
        about: updatedProfile.about ?? "",
        photo: avatarUrl,
      });
      
      const rawUser = localStorage.getItem("dobry-shkaf-user");
      
      const savedUser = rawUser
        ? (JSON.parse(rawUser) as Record<string, unknown>)
        : {};
      
      localStorage.setItem(
        "dobry-shkaf-user",
        JSON.stringify({
          ...savedUser,
          name: updatedProfile.name ?? "",
          city: updatedProfile.city ?? "",
          about: updatedProfile.about ?? "",
          photo: avatarUrl,
        }),
      );
      
      window.dispatchEvent(new Event("dobry-shkaf-user-updated"));
      
      router.push("/profile");
      router.refresh();
      
    } catch (saveError) {
      setError(getProfileErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.heading}>
        <Link
          href="/profile"
          className={styles.backButton}
          aria-label="Вернуться в профиль"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <h1>Редактирование профиля</h1>
      </div>

      {isLoading ? (
        <p>Загрузка профиля...</p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.photoSection}>
            <button
              type="button"
              className={styles.photoButton}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Загрузить фотографию профиля"
              disabled={isSaving}
            >
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt="Фотография профиля"
                  className={styles.photoPreview}
                />
              ) : (
                <svg
                  className={styles.cameraIcon}
                  viewBox="0 0 52 52"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 16.5H17L20.5 10H32L35.5 16.5H44V42H8V16.5Z"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="26"
                    cy="29"
                    r="7.5"
                    stroke="currentColor"
                    strokeWidth="3.2"
                  />
                </svg>
              )}
            </button>

            <input
              ref={fileInputRef}
              className={styles.fileInput}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              aria-label="Выберите фотографию"
              disabled={isSaving}
            />
          </div>

          <div className={styles.fields}>
            <label className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Имя</span>
              <input
                className={styles.textInput}
                type="text"
                name="name"
                placeholder="Имя пользователя"
                autoComplete="name"
                value={profile.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                maxLength={80}
                required
                disabled={isSaving}
              />
            </label>

            <label className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Город</span>
              <CitySelect
                name="city"
                value={profile.city ?? ""}
                cities={cities}
                onChange={(city) => updateField("city", city)}
                disabled={isSaving}
              />
            </label>

            <label className={`${styles.fieldRow} ${styles.aboutRow}`}>
              <span className={styles.fieldLabel}>О себе</span>
              <textarea
                className={styles.aboutInput}
                name="about"
                placeholder="О себе"
                value={profile.about}
                onChange={(event) =>
                  updateField("about", event.target.value)
                }
                maxLength={1000}
                rows={4}
                disabled={isSaving}
              />
            </label>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              className={styles.saveButton}
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
