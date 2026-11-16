"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { fetchCategories } from "@/entities/item/api/listings";
import type { CategoriesResponse } from "@/entities/item/api/listings";
import styles from "./page.module.css";

type OrganizationInfo = {
  name: string;
  description: string;
  about: string;
  phone: string;
  email: string;
  logo: string;
};

type WorkDay = {
  day: string;
  enabled: boolean;
  from: string;
  to: string;
};

type ReceptionPoint = {
  id: string;
  city: string;
  address: string;
  schedule: WorkDay[];
};

type CategoryRule = {
  enabled: boolean;
  subcategories: string[];
};

type OrganizationStorage = {
  info: OrganizationInfo;
  rules: Record<string, CategoryRule>;
  conditions: string[];
  requirements: string;
  exclusions: string;
  points: ReceptionPoint[];
};

type PageView = "overview" | "info" | "rules" | "points" | "point-form";

const STORAGE_KEY = "dobry-shkaf-organization";

const DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

const DEFAULT_SCHEDULE: WorkDay[] = DAYS.map((day) => ({
  day,
  enabled: day !== "Воскресенье",
  from: "10:00",
  to: "19:00",
}));

const INITIAL_DATA: OrganizationStorage = {
  info: {
    name: "Добрые вещи",
    description:
      "Помогаем вещам находить новых хозяев. Принимаем одежду, обувь, детские вещи и предметы для дома в хорошем состоянии и передаём их людям, которым они нужны.",
    about:
      "Мы работаем в Екатеринбурге более 5 лет. Наша миссия — развивать культуру осознанного потребления и помогать тем, кто оказался в трудной жизненной ситуации.\n\nЕжемесячно мы собираем и распределяем более 2 тонн одежды и обуви. 80% вещей передаются подопечным благотворительных фондов, а оставшиеся 20% реализуются через сеть благотворительных магазинов для покрытия транспортных и складских расходов.",
    phone: "+7 (343) 222-33-44",
    email: "hello@dobro-vechi.ru",
    logo: "",
  },
  rules: {},
  conditions: ["Новое", "Отличное", "Хорошее"],
  requirements: "Чистые, сухие, пригодные к использованию",
  exclusions: "",
  points: [
    { id: "point-1", city: "Екатеринбург", address: "ул. Ленина, 15", schedule: DEFAULT_SCHEDULE },
    { id: "point-2", city: "Екатеринбург", address: "ул. Победы, 42", schedule: DEFAULT_SCHEDULE },
    { id: "point-3", city: "Екатеринбург", address: "ул. Татищева, 88", schedule: DEFAULT_SCHEDULE },
  ],
};

const DAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const CONDITIONS = ["Новое", "Отличное", "Хорошее", "Требует ремонта"];

function createEmptyPoint(): ReceptionPoint {
  return {
    id: `point-${Date.now()}`,
    city: "",
    address: "",
    schedule: DEFAULT_SCHEDULE.map((day) => ({ ...day })),
  };
}

const formatPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;

  let res = "+7 ";
  if (digits.length > 1) res += `(${digits.slice(1, 4)}`;
  if (digits.length >= 5) res += `) ${digits.slice(4, 7)}`;
  if (digits.length >= 8) res += `-${digits.slice(7, 9)}`;
  if (digits.length >= 10) res += `-${digits.slice(9, 11)}`;

  return res.trim();
};

export default function OrganizationPage() {
  const [view, setView] = useState<PageView>("overview");
  const [data, setData] = useState<OrganizationStorage>(INITIAL_DATA);

  const [draftInfo, setDraftInfo] = useState<OrganizationInfo>(INITIAL_DATA.info);
  const [draftRules, setDraftRules] = useState(INITIAL_DATA.rules);
  const [draftConditions, setDraftConditions] = useState<string[]>(INITIAL_DATA.conditions);
  const [draftRequirements, setDraftRequirements] = useState(INITIAL_DATA.requirements);
  const [draftExclusions, setDraftExclusions] = useState(INITIAL_DATA.exclusions);
  const [categories, setCategories] = useState<CategoriesResponse["categories"]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [editingPoint, setEditingPoint] = useState<ReceptionPoint | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [infoErrors, setInfoErrors] = useState({ phone: "", email: "" });

  const [pointErrors, setPointErrors] = useState({ city: "", address: "" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<OrganizationStorage>;
        setData({
          ...INITIAL_DATA,
          ...parsed,
          info: { ...INITIAL_DATA.info, ...parsed.info },
          rules: parsed.rules ?? {},
          conditions: parsed.conditions ?? INITIAL_DATA.conditions,
          points: parsed.points ?? INITIAL_DATA.points,
        });
      }
    } catch {
      console.error("Не удалось загрузить данные кабинета организации");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const response = await fetchCategories();
        if (cancelled) return;
        setCategories(response.categories ?? []);
      } catch {
        if (cancelled) return;
        setCategoriesError("Не удалось загрузить категории. Проверь подключение к серверу.");
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCategoriesCount = useMemo(
    () => Object.values(data.rules).filter((rule) => rule.enabled).length,
    [data.rules]
  );

  const openInfo = () => {
    setDraftInfo({ ...data.info });
    setInfoErrors({ phone: "", email: "" });
    setView("info");
  };

  const saveInfo = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(draftInfo.email);
    const phoneDigits = draftInfo.phone.replace(/\D/g, "");
    const isPhoneValid = phoneDigits.length === 11 && phoneDigits.startsWith("7");

    if (!isEmailValid || !isPhoneValid) {
      setInfoErrors({
        email: isEmailValid ? "" : "Некорректный email",
        phone: isPhoneValid ? "" : "Введите полный номер",
      });
      return;
    }

    setData((current) => ({ ...current, info: draftInfo }));
    setView("overview");
  };

  const openRules = () => {
    setDraftRules(JSON.parse(JSON.stringify(data.rules)));
    setDraftConditions([...data.conditions]);
    setDraftRequirements(data.requirements);
    setDraftExclusions(data.exclusions);
    setView("rules");
  };

  const saveRules = () => {
    setData((current) => ({
      ...current,
      rules: draftRules,
      conditions: draftConditions,
      requirements: draftRequirements,
      exclusions: draftExclusions,
    }));
    setView("overview");
  };

  const toggleCategory = (categoryName: string) => {
    setDraftRules((current) => {
      const existing = current[categoryName];
      return {
        ...current,
        [categoryName]: {
          enabled: !existing?.enabled,
          subcategories: existing?.subcategories ?? [],
        },
      };
    });
  };

  const toggleSubcategory = (categoryName: string, subcategory: string) => {
    setDraftRules((current) => {
      const rule = current[categoryName] ?? { enabled: true, subcategories: [] };
      const selected = rule.subcategories.includes(subcategory);
      return {
        ...current,
        [categoryName]: {
          ...rule,
          enabled: true,
          subcategories: selected
            ? rule.subcategories.filter((item) => item !== subcategory)
            : [...rule.subcategories, subcategory],
        },
      };
    });
  };

  const toggleCondition = (condition: string) => {
    setDraftConditions((current) =>
      current.includes(condition)
        ? current.filter((item) => item !== condition)
        : [...current, condition]
    );
  };

  const openNewPoint = () => {
    setEditingPoint(createEmptyPoint());
    setPointErrors({ city: "", address: "" });
    setView("point-form");
  };

  const openPointEdit = (point: ReceptionPoint) => {
    setEditingPoint({
      ...point,
      schedule: point.schedule.map((day) => ({ ...day })),
    });
    setPointErrors({ city: "", address: "" });
    setView("point-form");
  };

  const savePoint = () => {
    const errors = { city: "", address: "" };
    let hasError = false;

    if (!editingPoint?.city.trim()) {
      errors.city = "Введите город";
      hasError = true;
    }

    const addressValue = editingPoint?.address.trim() || "";
    
    if (!addressValue) {
      errors.address = "Введите адрес";
      hasError = true;
    } else if (!/\d/.test(addressValue)) {
      errors.address = "Укажите номер дома (например, ул. Ленина, 15)";
      hasError = true;
    }

    if (hasError) {
      setPointErrors(errors);
      return;
    }

    setData((current) => {
      const exists = current.points.some((point) => point.id === editingPoint!.id);
      return {
        ...current,
        points: exists
          ? current.points.map((point) =>
              point.id === editingPoint!.id ? editingPoint! : point
            )
          : [...current.points, editingPoint!],
      };
    });

    setEditingPoint(null);
    setPointErrors({ city: "", address: "" });
    setView("points");
  };

  const deletePoint = (id: string) => {
    if (!window.confirm("Удалить этот пункт приёма?")) return;
    setData((current) => ({
      ...current,
      points: current.points.filter((point) => point.id !== id),
    }));
  };

  const updatePointDay = (index: number, field: keyof WorkDay, value: string | boolean) => {
    if (!editingPoint) return;
    setEditingPoint((current) => {
      if (!current) return current;
      return {
        ...current,
        schedule: current.schedule.map((day, dayIndex) =>
          dayIndex === index ? { ...day, [field]: value } : day
        ),
      };
    });
  };

  const uploadLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Выбери файл изображения");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraftInfo((current) => ({ ...current, logo: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const formatSchedule = (schedule: WorkDay[]) => {
    const activeDays = schedule.filter((day) => day.enabled);
    if (!activeDays.length) return "Не работает";

    const groups: Record<string, number[]> = {};
    schedule.forEach((day, index) => {
      if (day.enabled) {
        const timeKey = `${day.from}-${day.to}`;
        if (!groups[timeKey]) groups[timeKey] = [];
        groups[timeKey].push(index);
      }
    });

    const formattedGroups = Object.entries(groups).map(([timeKey, indices]) => {
      const [from, to] = timeKey.split("-");
      if (indices.length === 7) return `Ежедневно ${from}–${to}`;

      const dayRanges: string[] = [];
      let start = indices[0];
      let prev = indices[0];

      for (let i = 1; i <= indices.length; i++) {
        const current = indices[i];
        if (current === prev + 1) {
          prev = current;
        } else {
          if (start === prev) {
            dayRanges.push(DAYS_SHORT[start]);
          } else {
            dayRanges.push(`${DAYS_SHORT[start]}–${DAYS_SHORT[prev]}`);
          }
          start = current;
          prev = current;
        }
      }
      return `${dayRanges.join(", ")} ${from}–${to}`;
    });

    return formattedGroups.join(" · ");
  };

  const backToOverview = () => setView("overview");

  return (
    <main className={styles.page}>
      <Sidebar 
        variant="organization" 
        activePage={
          view === "overview" || view === "info" || view === "rules" || view === "points" || view === "point-form" 
            ? "overview" 
            : undefined
        } 
      />

      <section className={styles.content}>
        {view === "overview" && (
          <>
            <header className={styles.pageHeader}>
              <div>
                <h1>Страница организации</h1>
                <p>Основная информация, правила приёма и пункты, которые видят пользователи.</p>
              </div>
              <button type="button" className={styles.editButton} onClick={openInfo}>
                Редактировать
              </button>
            </header>

            <section className={styles.infoCard}>
              <h2>Основная информация</h2>
              <div className={styles.infoContent}>
                <div className={styles.infoField}>
                  <span>Название</span>
                  <p>{data.info.name}</p>
                </div>
                <div className={styles.infoField}>
                  <span>Описание</span>
                  <p>{data.info.description}</p>
                </div>
                <div className={styles.contacts}>
                  <div className={styles.infoField}>
                    <span>Телефон</span>
                    <p>{data.info.phone}</p>
                  </div>
                  <div className={styles.infoField}>
                    <span>Email</span>
                    <p>{data.info.email}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.summaryCard}>
              <div className={styles.summaryLeft}>
                <span className={styles.pill}>Правила приёма</span>
                <span className={styles.summaryText}>{selectedCategoriesCount} категорий</span>
              </div>
              <button type="button" className={styles.textButton} onClick={openRules}>
                Редактировать <span>→</span>
              </button>
            </section>

            <section className={styles.summaryCard}>
              <div className={styles.summaryLeft}>
                <span className={styles.pill}>Пункты приёма</span>
                <span className={styles.summaryText}>
                  {data.points.length}{" "}
                  {data.points.length === 1
                    ? "пункт"
                    : data.points.length >= 2 && data.points.length <= 4
                      ? "пункта"
                      : "пунктов"}
                  {data.points.length > 0 &&
                    ` · ${data.points.map((point) => point.city ? `${point.city}, ${point.address}` : point.address).join(" · ")}`}
                </span>
              </div>
              <button type="button" className={styles.textButton} onClick={() => setView("points")}>
                Управлять <span>→</span>
              </button>
            </section>
          </>
        )}

        {view === "info" && (
          <>
            <button className={styles.backButton} onClick={backToOverview}>
              ← Страница организации
            </button>

            <div className={styles.sectionHeading}>
              <h1>Основная информация</h1>
              <p>
                Название, логотип, описание, раздел «О нас» и контакты на публичной странице.
              </p>
            </div>

            <div className={styles.formPage}>
              <div className={styles.logoRow}>
                <div className={styles.logoPreview}>
                  {draftInfo.logo ? <img src={draftInfo.logo} alt="Логотип организации" /> : null}
                </div>
                <div className={styles.logoControls}>
                  <strong>Логотип</strong>
                  <label className={styles.uploadButton}>
                    Загрузить другой
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadLogo(event.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              <label className={styles.fieldLabel}>
                Название
                <input
                  value={draftInfo.name}
                  onChange={(event) => setDraftInfo({ ...draftInfo, name: event.target.value })}
                />
              </label>

              <label className={styles.fieldLabel}>
                Описание
                <textarea
                  rows={4}
                  value={draftInfo.description}
                  onChange={(event) =>
                    setDraftInfo({ ...draftInfo, description: event.target.value })
                  }
                />
              </label>

              <label className={styles.fieldLabel}>
                О нас
                <textarea
                  rows={7}
                  value={draftInfo.about}
                  onChange={(event) => setDraftInfo({ ...draftInfo, about: event.target.value })}
                />
              </label>

              <label className={styles.fieldLabel}>
                Телефон
                <input
                  className={infoErrors.phone ? styles.inputError : ""}
                  value={draftInfo.phone}
                  onChange={(event) => {
                    setDraftInfo({ ...draftInfo, phone: formatPhone(event.target.value) });
                    if (infoErrors.phone) setInfoErrors({ ...infoErrors, phone: "" });
                  }}
                />
                {infoErrors.phone && <span className={styles.errorText}>{infoErrors.phone}</span>}
              </label>

              <label className={styles.fieldLabel}>
                Email
                <input
                  type="email"
                  className={infoErrors.email ? styles.inputError : ""}
                  value={draftInfo.email}
                  onChange={(event) => {
                    setDraftInfo({ ...draftInfo, email: event.target.value });
                    if (infoErrors.email) setInfoErrors({ ...infoErrors, email: "" });
                  }}
                />
                {infoErrors.email && <span className={styles.errorText}>{infoErrors.email}</span>}
              </label>

              <div className={styles.formActions}>
                <button className={styles.saveButton} onClick={saveInfo}>
                  Сохранить
                </button>
                <button className={styles.cancelButton} onClick={backToOverview}>
                  Отмена
                </button>
              </div>
            </div>
          </>
        )}

        {view === "rules" && (
          <>
            <button className={styles.backButton} onClick={backToOverview}>
              ← Страница организации
            </button>

            <div className={styles.sectionHeading}>
              <h1>Правила приёма</h1>
              <p>Настройте категории, допустимое состояние, требования и ограничения.</p>
            </div>

            <div className={styles.rulesPage}>
              <h2>Принимаем вещи</h2>
              <p className={styles.hint}>
                Выберите категории и подкатегории, которые организация принимает.
              </p>

              {categoriesLoading && <p className={styles.muted}>Загружаем категории…</p>}
              {categoriesError && <p className={styles.errorText}>{categoriesError}</p>}

              {!categoriesLoading && !categoriesError && (
                <div className={styles.categoryList}>
                  {categories.map((category) => {
                    const rule = draftRules[category.name];
                    const enabled = rule?.enabled ?? false;

                    return (
                      <section className={styles.categoryGroup} key={category.name}>
                        <label className={styles.checkLabel}>
                          <input
                            className={styles.checkbox}
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleCategory(category.name)}
                          />
                          <span className={styles.categoryName}>{category.name}</span>
                        </label>

                        {enabled && category.subcategories.length > 0 && (
                          <div className={styles.subcategoryGrid}>
                            {category.subcategories.map((subcategory) => (
                              <label className={styles.checkLabel} key={subcategory}>
                                <input
                                  className={styles.checkbox}
                                  type="checkbox"
                                  checked={rule?.subcategories.includes(subcategory) ?? false}
                                  onChange={() => toggleSubcategory(category.name, subcategory)}
                                />
                                <span>{subcategory}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}

              <section className={styles.ruleSection}>
                <h3>Допустимое состояние</h3>
                <div className={styles.conditionsGrid}>
                  {CONDITIONS.map((condition) => (
                    <label className={styles.checkLabel} key={condition}>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={draftConditions.includes(condition)}
                        onChange={() => toggleCondition(condition)}
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className={styles.ruleSection}>
                <h3>Дополнительные требования</h3>
                <textarea
                  className={styles.ruleTextarea}
                  rows={2}
                  value={draftRequirements}
                  onChange={(event) => setDraftRequirements(event.target.value)}
                  placeholder="Укажите дополнительные требования"
                />
              </section>

              <section className={styles.ruleSection}>
                <h2>Не принимаем</h2>
                <label className={styles.fieldLabel}>
                  Исключения
                  <textarea
                    className={styles.ruleTextarea}
                    rows={2}
                    value={draftExclusions}
                    onChange={(event) => setDraftExclusions(event.target.value)}
                    placeholder="Опишите исключения, если они есть"
                  />
                </label>
              </section>

              <div className={styles.formActions}>
                <button className={styles.saveButton} onClick={saveRules}>
                  Сохранить изменения
                </button>
                <button className={styles.cancelButton} onClick={backToOverview}>
                  Отмена
                </button>
              </div>
            </div>
          </>
        )}

        {view === "points" && (
          <>
            <button className={styles.backButton} onClick={backToOverview}>
              ← Страница организации
            </button>

            <div className={styles.pointsHeading}>
              <div className={styles.sectionHeading}>
                <h1>Пункты приёма</h1>
                <p>Адреса и режим работы отображаются на публичной странице и карте.</p>
              </div>
              <button className={styles.editButton} onClick={openNewPoint}>
                Добавить пункт
              </button>
            </div>

            <div className={styles.pointsList}>
              {data.points.length === 0 && (
                <div className={styles.emptyState}>
                  Пока нет пунктов приёма. Добавьте первый пункт.
                </div>
              )}

              {data.points.map((point) => (
                <article className={styles.pointCard} key={point.id}>
                  <div className={styles.pointInfo}>
                    <h2>{point.city ? `${point.city}, ${point.address}` : point.address}</h2>
                    <p>{formatSchedule(point.schedule)}</p>
                  </div>

                  <div className={styles.pointActions}>
                    <button
                      className={styles.pointEditButton}
                      onClick={() => openPointEdit(point)}
                    >
                      Редактировать
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deletePoint(point.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {view === "point-form" && editingPoint && (
          <>
            <button className={styles.backButton} onClick={() => setView("points")}>
              ← Пункты приёма
            </button>

            <div className={styles.sectionHeading}>
              <h1>
                {data.points.some((point) => point.id === editingPoint.id)
                  ? "Редактировать пункт приёма"
                  : "Добавить пункт приёма"}
              </h1>
              <p>Укажите адрес и режим работы.</p>
            </div>

            <div className={styles.pointForm}>
              <div className={styles.addressField}>
                <label className={styles.fieldLabel}>
                  Город
                  <input
                    className={pointErrors.city ? styles.inputError : ""}
                    value={editingPoint.city}
                    onChange={(event) => {
                      setEditingPoint({ ...editingPoint, city: event.target.value });
                      if (pointErrors.city) setPointErrors({ ...pointErrors, city: "" });
                    }}
                    placeholder="Введите город"
                  />
                </label>
                {pointErrors.city && <span className={styles.errorText}>{pointErrors.city}</span>}
              </div>

              <div className={styles.addressField}>
                <label className={styles.fieldLabel}>
                  Адрес
                  <input
                    className={pointErrors.address ? styles.inputError : ""}
                    value={editingPoint.address}
                    onChange={(event) => {
                      setEditingPoint({ ...editingPoint, address: event.target.value });
                      if (pointErrors.address) setPointErrors({ ...pointErrors, address: "" });
                    }}
                    placeholder="ул. Ленина, 15"
                  />
                </label>
                {pointErrors.address && <span className={styles.errorText}>{pointErrors.address}</span>}
              </div>

              <h2>Режим работы</h2>
              <p className={styles.hint}>Отметьте рабочие дни и укажите время приёма.</p>

              <div className={styles.scheduleTable}>
                <div className={styles.scheduleHeader}>
                  <span>День</span>
                  <span>Статус</span>
                  <span>С</span>
                  <span></span>
                  <span>До</span>
                </div>

                <div className={styles.scheduleList}>
                  {editingPoint.schedule.map((day, index) => (
                    <div className={styles.scheduleRow} key={day.day}>
                      <span className={styles.dayName}>{day.day}</span>

                      <label className={styles.statusLabel}>
                        <input
                          className={styles.checkbox}
                          type="checkbox"
                          checked={day.enabled}
                          onChange={(event) =>
                            updatePointDay(index, "enabled", event.target.checked)
                          }
                        />
                        <span>{day.enabled ? "Работает" : "Выходной"}</span>
                      </label>

                      {day.enabled ? (
                        <>
                          <div className={styles.timeField}>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={5}
                              placeholder="--:--"
                              value={day.from}
                              onChange={(event) => {
                                let val = event.target.value.replace(/[^\d:]/g, "");
                                if (val.length === 2 && !val.includes(":")) val += ":";
                                updatePointDay(index, "from", val);
                              }}
                            />
                          </div>
                          <span className={styles.timeSeparator}>—</span>
                          <div className={styles.timeField}>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={5}
                              placeholder="--:--"
                              value={day.to}
                              onChange={(event) => {
                                let val = event.target.value.replace(/[^\d:]/g, "");
                                if (val.length === 2 && !val.includes(":")) val += ":";
                                updatePointDay(index, "to", val);
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <span className={styles.dayOffText}>Выходной</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p className={styles.hint}>
                Если день включён, время начала и окончания обязательно.
              </p>

              <div className={styles.formActions}>
                <button className={styles.saveButton} onClick={savePoint}>
                  Добавить пункт
                </button>
                <button className={styles.cancelButton} onClick={() => setView("points")}>
                  Отмена
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}