"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { fetchCategories } from "@/entities/item/api/listings";
import {
  getMyOrganizations,
  getOrganizationDto,
  getOrganizationStatus,
  updateOrganizationGeneral,
  updateOrganizationContacts,
  updateOrganizationAcceptanceRules,
  createOrganizationAddress,
  updateOrganizationAddress,
  deleteOrganizationAddress,
  uploadOrganizationLogo,
} from "@/entities/organization/api";
import type { OrganizationDetailDto, AddressUpsertRequest } from "@/entities/organization/model/dto";
import { getApiErrorMessage } from "@/shared/api/errors";
import { env } from "@/shared/config/env";
import type { CategoriesResponse } from "@/entities/item/api/listings";
import styles from "./page.module.css";
import { CitySelect } from "@/shared/ui/CitySelect/CitySelect";
import { getCities } from "@/entities/user/api/profile";
import {
  parseOrganizationRuleItems,
  normalizeOrganizationRuleText,
} from "@/shared/lib/organization-rules";

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
    name: "",
    description: "",
    about: "",
    phone: "",
    email: "",
    logo: "",
  },
  rules: {},
  conditions: [],
  requirements: "",
  exclusions: "",
  points: [],
};

const DAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const CONDITIONS = ["Новое", "Отличное", "Хорошее", "Требует ремонта"];

const API_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

type ApiScheduleDay = { is_open?: boolean; from?: string | null; to?: string | null };

function clampTimeInput(raw: string): string {
  let value = raw.replace(/[^\d:]/g, "");

  if (!value) return "";

  const hasColon = value.includes(":");
  if (!hasColon && value.length > 2) {
    value = `${value.slice(0, 2)}:${value.slice(2)}`;
  }

  const [rawHours, rawMinutes = ""] = value.split(":");
  let hours = rawHours.slice(0, 2);
  let minutes = rawMinutes.slice(0, 2);

  if (hours.length === 2) {
    const h = Number(hours);
    if (Number.isNaN(h)) hours = "";
    else if (h > 23) hours = "23";
  }

  if (minutes.length === 2) {
    const m = Number(minutes);
    if (Number.isNaN(m)) minutes = "";
    else if (m > 59) minutes = "59";
  }

  if (value.endsWith(":") && minutes === "") return `${hours}:`;
  if (minutes !== "") return `${hours}:${minutes}`;
  return hours;
}

function normalizeTimeTo(raw: string): string {
  const clamped = clampTimeInput(raw);
  if (!/^\d{1,2}:\d{2}$/.test(clamped)) return clamped;

  const [hStr, mStr] = clamped.split(":");
  const h = Number(hStr);
  const m = Number(mStr);

  if (h > 23 || (h === 23 && m > 59)) return "23:59";
  return clamped;
}

function mapOrganizationDto(dto: OrganizationDetailDto): OrganizationStorage {
  const rules: Record<string, CategoryRule> = {};
  dto.acceptance_rules.categories.forEach((category) => {
    rules[category.name] = { enabled: true, subcategories: category.subcategories };
  });

  return {
    info: {
      name: dto.name,
      description: dto.description ?? "",
      about: dto.about ?? "",
      phone: dto.phone ?? "",
      email: dto.email,
      logo: dto.logo_url
        ? dto.logo_url.startsWith("data:") || /^https?:\/\//i.test(dto.logo_url)
          ? dto.logo_url
          : new URL(dto.logo_url, env.apiUrl).toString()
        : "",
    },
    rules,
    conditions: dto.acceptance_rules.conditions ?? [],
    requirements: parseOrganizationRuleItems(
      dto.acceptance_rules.additional_requirements
    ).join("\n"),
    
    exclusions: parseOrganizationRuleItems(
      dto.acceptance_rules.not_accepted
    ).join("\n"),
    points: dto.addresses.map((address) => {
      const rawSchedule = (address.schedule ?? {}) as Record<string, ApiScheduleDay>;
      return {
        id: address.id,
        city: address.city,
        address: address.address_line,
        schedule: DAYS.map((day, index) => {
          const apiDay = rawSchedule[API_DAYS[index]] ?? {};
          return {
            day,
            enabled: Boolean(apiDay.is_open),
            from: apiDay.from ?? "10:00",
            to: apiDay.to ?? "19:00",
          };
        }),
      };
    }),
  };
}

function mapPointToRequest(point: ReceptionPoint, sortOrder: number): AddressUpsertRequest {
  const schedule = Object.fromEntries(
    API_DAYS.map((apiDay, index) => {
      const day = point.schedule[index];
      return [apiDay, {
        is_open: day.enabled,
        from: day.enabled ? day.from : null,
        to: day.enabled ? day.to : null,
      }];
    }),
  ) as AddressUpsertRequest["schedule"];

  return {
    title: point.address.trim(),
    address_line: point.address.trim(),
    city: point.city.trim(),
    schedule,
    sort_order: sortOrder,
  };
}

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

  if (!digits) return "";

  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;

  let res = "+7";
  if (digits.length > 1) res += ` (${digits.slice(1, 4)}`;
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
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [viewerPermissions, setViewerPermissions] = useState<string[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [infoErrors, setInfoErrors] = useState({ phone: "", email: "" });
  const canEditGeneral = viewerPermissions.includes("edit_profile") || viewerPermissions.includes("edit_general_info");
  const canEditContacts = viewerPermissions.includes("edit_profile") || viewerPermissions.includes("edit_contacts");
  const canEditRules = viewerPermissions.includes("edit_profile") || viewerPermissions.includes("edit_acceptance_rules");
  const canEditAddresses = viewerPermissions.includes("edit_profile") || viewerPermissions.includes("edit_addresses");

  const [pointErrors, setPointErrors] = useState({ city: "", address: "" });

  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      setCitiesLoading(true);
      setCitiesError("");

      try {
        const cityList = await getCities();

        if (cancelled) return;

        setCities(cityList);
      } catch {
        if (cancelled) return;

        setCitiesError(
          "Не удалось загрузить список городов. Проверь подключение к серверу."
        );
      } finally {
        if (!cancelled) {
          setCitiesLoading(false);
        }
      }
    }

    void loadCities();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganization() {
      setInitialLoading(true);
      setPageError("");
      try {
        const [status, organizations] = await Promise.all([
          getOrganizationStatus(),
          getMyOrganizations(),
        ]);
        const membership = organizations[0] ?? status.organization;
        if (!status.hasOrganization || !membership) {
          throw new Error("У вашего аккаунта пока нет связанной организации.");
        }

        const dto = await getOrganizationDto(membership.id);
        if (cancelled) return;
        setOrganizationId(dto.id);
        setViewerPermissions(dto.viewer_permissions ?? []);
        setData(mapOrganizationDto(dto));
      } catch (error) {
        if (!cancelled) setPageError(getApiErrorMessage(error));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }

    void loadOrganization();
    return () => { cancelled = true; };
  }, []);

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
    setPendingLogo(null);
    setSaveError("");
    setView("info");
  };

  const saveInfo = async () => {
    if (!organizationId) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = !canEditContacts || emailRegex.test(draftInfo.email.trim());
    const phoneDigits = draftInfo.phone.replace(/\D/g, "");
    const isPhoneValid =
      !canEditContacts ||
      phoneDigits.length === 0 ||
      (phoneDigits.length === 11 && phoneDigits.startsWith("7"));

    if (!isEmailValid || !isPhoneValid) {
      setInfoErrors({
        email: isEmailValid ? "" : "Некорректный email",
        phone: isPhoneValid ? "" : "Введите полный номер",
      });
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      if (canEditGeneral) {
        await updateOrganizationGeneral(organizationId, {
          name: draftInfo.name.trim(),
          description: draftInfo.description.trim() || null,
          about: draftInfo.about.trim() || null,
        });
        if (pendingLogo) {
          await uploadOrganizationLogo(organizationId, pendingLogo);
        }
      }
      if (canEditContacts) {
        await updateOrganizationContacts(organizationId, {
          phone: draftInfo.phone.trim() || null,
          email: draftInfo.email.trim(),
        });
      }
      const dto = await getOrganizationDto(organizationId);
      setData(mapOrganizationDto(dto));
      setViewerPermissions(dto.viewer_permissions ?? []);
      setPendingLogo(null);
      setView("overview");
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Не удалось сохранить информацию организации."));
    } finally {
      setSaving(false);
    }
  };

  const openRules = () => {
    setDraftRules(JSON.parse(JSON.stringify(data.rules)));
    setDraftConditions([...data.conditions]);
    setDraftRequirements(data.requirements);
    setDraftExclusions(data.exclusions);
    setSaveError("");
    setView("rules");
  };

  const saveRules = async () => {
    if (!organizationId) return;
    setSaving(true);
    setSaveError("");
    try {
      const categoriesPayload = Object.entries(draftRules)
        .filter(([, rule]) => rule.enabled)
        .map(([name, rule]) => ({ name, subcategories: rule.subcategories }));
      await updateOrganizationAcceptanceRules(organizationId, {
        categories: categoriesPayload,
        conditions: draftConditions,

        additional_requirements:
          normalizeOrganizationRuleText(draftRequirements) || null,
        
        not_accepted: parseOrganizationRuleItems(draftExclusions),
      });
      const dto = await getOrganizationDto(organizationId);
      setData(mapOrganizationDto(dto));
      setView("overview");
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Не удалось сохранить правила приёма."));
    } finally {
      setSaving(false);
    }
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
    setSaveError("");
    setEditingPoint(createEmptyPoint());
    setPointErrors({ city: "", address: "" });
    setView("point-form");
  };

  const openPointEdit = (point: ReceptionPoint) => {
    setSaveError("");
    setEditingPoint({
      ...point,
      schedule: point.schedule.map((day) => ({ ...day })),
    });
    setPointErrors({ city: "", address: "" });
    setView("point-form");
  };

  const savePoint = async () => {
    if (!organizationId || !editingPoint) return;
    const errors = { city: "", address: "" };
    if (!editingPoint.city.trim()) errors.city = "Введите город";
    const addressValue = editingPoint.address.trim();
    if (!addressValue) errors.address = "Введите адрес";
    else if (!/\d/.test(addressValue)) errors.address = "Укажите номер дома (например, ул. Ленина, 15)";
    if (errors.city || errors.address) { setPointErrors(errors); return; }

    setSaving(true);
    setSaveError("");
    try {
      const exists = data.points.some((point) => point.id === editingPoint.id);
      const payload = mapPointToRequest(editingPoint, exists ? data.points.findIndex((point) => point.id === editingPoint.id) : data.points.length);
      if (exists) await updateOrganizationAddress(organizationId, editingPoint.id, payload);
      else await createOrganizationAddress(organizationId, payload);
      const dto = await getOrganizationDto(organizationId);
      setData(mapOrganizationDto(dto));
      setEditingPoint(null);
      setPointErrors({ city: "", address: "" });
      setView("points");
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Не удалось сохранить пункт приёма."));
    } finally { setSaving(false); }
  };

  const deletePoint = async (id: string) => {
    if (!organizationId || !window.confirm("Удалить этот пункт приёма?")) return;
    setSaving(true);
    setSaveError("");
    try {
      await deleteOrganizationAddress(organizationId, id);
      const dto = await getOrganizationDto(organizationId);
      setData(mapOrganizationDto(dto));
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Не удалось удалить пункт приёма."));
    } finally { setSaving(false); }
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
      setSaveError("Выберите файл изображения.");
      return;
    }
    setPendingLogo(file);
    const reader = new FileReader();
    reader.onload = () => setDraftInfo((current) => ({ ...current, logo: String(reader.result) }));
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

  const getSymbolsWord = (count: number): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) return 'символ';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'символа';
    return 'символов';
  };

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
        {initialLoading && <p className={styles.muted} role="status">Загружаем данные организации…</p>}
        {!initialLoading && pageError && (
          <div className={styles.emptyState} role="alert">
            <p>{pageError}</p>
            <button type="button" onClick={() => window.location.reload()}>Повторить</button>
          </div>
        )}
        {!initialLoading && !pageError && saveError && <p className={styles.errorText} role="alert">{saveError}</p>}
        {!initialLoading && !pageError && view === "overview" && (
          <>
            <header className={styles.pageHeader}>
              <div>
                <h1>Страница организации</h1>
                <p>Основная информация, правила приёма и пункты, которые видят пользователи.</p>
              </div>

              <div className={styles.permissionAction}>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={openInfo}
                  disabled={!canEditGeneral && !canEditContacts}
                >
                  Редактировать
                </button>

                {!canEditGeneral && !canEditContacts && (
                  <p className={styles.permissionHint1}>
                    У вас недостаточно прав для редактирования информации организации
                  </p>
                )}
              </div>
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

              <div className={styles.permissionAction}>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={openRules}
                  disabled={!canEditRules}
                >
                  Редактировать <span>→</span>
                </button>

                {!canEditRules && (
                  <p className={styles.permissionHint}>
                    У вас недостаточно прав для редактирования правил приёма
                  </p>
                )}
              </div>
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

              <div className={styles.permissionAction}>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => setView("points")}
                  disabled={!canEditAddresses}
                >
                  Управлять <span>→</span>
                </button>

                {!canEditAddresses && (
                  <p className={styles.permissionHint}>
                    У вас недостаточно прав для управления пунктами приёма
                  </p>
                )}
              </div>
            </section>
          </>
        )}

        {!initialLoading && !pageError && view === "info" && (
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
              {!canEditGeneral && <p className={styles.errorText}>Нет разрешения на редактирование основной информации.</p>}
              {!canEditContacts && <p className={styles.errorText}>Нет разрешения на редактирование контактов.</p>}
              <div className={styles.logoRow}>
                <div className={styles.logoPreview}>
                  {draftInfo.logo ? <img src={draftInfo.logo} alt="Логотип организации" /> : null}
                </div>
                <div className={styles.logoControls}>
                  <strong>Логотип</strong>
                  <label className={styles.uploadButton} aria-disabled={!canEditGeneral}>
                    Загрузить другой
                    <input
                      type="file"
                      disabled={!canEditGeneral}
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
                  disabled={!canEditGeneral}
                  onChange={(event) => setDraftInfo({ ...draftInfo, name: event.target.value })}
                />
              </label>

              <label className={styles.fieldLabel}>
                Описание
                <textarea
                  rows={4}
                  disabled={!canEditGeneral}
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
                  disabled={!canEditGeneral}
                  value={draftInfo.about}
                  onChange={(event) => setDraftInfo({ ...draftInfo, about: event.target.value })}
                />
              </label>

              <label className={styles.fieldLabel}>
                Телефон
                <input
                  className={infoErrors.phone ? styles.inputError : ""}
                  value={draftInfo.phone}
                  disabled={!canEditContacts}
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
                  disabled={!canEditContacts}
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
                <button className={styles.saveButton} onClick={() => void saveInfo()} disabled={saving || (!canEditGeneral && !canEditContacts)}>
                  {saving ? "Сохраняем…" : "Сохранить"}
                </button>
                <button className={styles.cancelButton} onClick={backToOverview}>
                  Отмена
                </button>
              </div>
            </div>
          </>
        )}

        {!initialLoading && !pageError && view === "rules" && (
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
                            disabled={!canEditRules}
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
                                  disabled={!canEditRules}
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
                        disabled={!canEditRules}
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
                  disabled={!canEditRules}
                  rows={2}
                  maxLength={100}
                  value={draftRequirements}
                  onChange={(event) =>
                    setDraftRequirements(event.target.value.slice(0, 100))
                  }
                  placeholder="Укажите дополнительные требования"
                />
                <div className={styles.characterCounter}>
                  {(() => {
                    const remaining = 100 - draftRequirements.length;
                    return `Осталось ${remaining} ${getSymbolsWord(remaining)}`;
                  })()}
                </div>
              </section>

              <section className={styles.ruleSection}>
                <h2>Не принимаем</h2>
                <label className={styles.fieldLabel}>
                  Исключения
                  <textarea
                    className={styles.ruleTextarea}
                    disabled={!canEditRules}
                    rows={2}
                    maxLength={100}
                    value={draftExclusions}
                    onChange={(event) =>
                      setDraftExclusions(event.target.value.slice(0, 100))
                    }
                    placeholder="Опишите исключения, если они есть"
                  />
                  <div className={styles.characterCounter}>
                    {(() => {
                      const remaining = 100 - draftExclusions.length;
                      return `Осталось ${remaining} ${getSymbolsWord(remaining)}`;
                    })()}
                  </div>
                </label>
              </section>

              <div className={styles.formActions}>
                <button className={styles.saveButton} onClick={() => void saveRules()} disabled={saving || !canEditRules}>
                  {saving ? "Сохраняем…" : "Сохранить изменения"}
                </button>
                <button className={styles.cancelButton} onClick={backToOverview}>
                  Отмена
                </button>
              </div>
            </div>
          </>
        )}

        {!initialLoading && !pageError && view === "points" && (
          <>
            <button className={styles.backButton} onClick={backToOverview}>
              ← Страница организации
            </button>

            <div className={styles.pointsHeading}>
              <div className={styles.sectionHeading}>
                <h1>Пункты приёма</h1>
                <p>Адреса и режим работы отображаются на публичной странице и карте.</p>
              </div>
              <button className={styles.editButton} onClick={openNewPoint} disabled={!canEditAddresses}>
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
                <div className={styles.fieldLabel} style={{ fontWeight: 400 }}>
                  <span style={{ fontWeight: 600 }}>Город</span>

                  <CitySelect
                    name="city"
                    value={editingPoint.city}
                    cities={cities}
                    disabled={
                      !canEditAddresses ||
                      citiesLoading ||
                      Boolean(citiesError)
                    }
                    onChange={(city) => {
                      setEditingPoint({
                        ...editingPoint,
                        city,
                      });

                      if (pointErrors.city) {
                        setPointErrors({
                          ...pointErrors,
                          city: "",
                        });
                      }
                    }}
                  />
                </div>

                {citiesLoading && (
                  <span className={styles.hint}>Загружаем города...</span>
                )}

                {citiesError && (
                  <span className={styles.errorText}>{citiesError}</span>
                )}

                {pointErrors.city && (
                  <span className={styles.errorText}>{pointErrors.city}</span>
                )}
              </div>

              <div className={styles.addressField}>
                <label className={styles.fieldLabel}>
                  Адрес
                  <input
                    className={pointErrors.address ? styles.inputError : ""}
                    value={editingPoint.address}
                    disabled={!canEditAddresses}
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
                          disabled={!canEditAddresses}
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
                              disabled={!canEditAddresses}
                              inputMode="numeric"
                              maxLength={5}
                              placeholder="--:--"
                              value={day.from}
                              onChange={(event) => {
                                const val = clampTimeInput(event.target.value);
                                updatePointDay(index, "from", val);
                              }}
                            />
                          </div>
                          <span className={styles.timeSeparator}>—</span>
                          <div className={styles.timeField}>
                            <input
                              type="text"
                              disabled={!canEditAddresses}
                              inputMode="numeric"
                              maxLength={5}
                              placeholder="--:--"
                              value={day.to}
                              onChange={(event) => {
                                const val = normalizeTimeTo(event.target.value);
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
                Если день включён, время начала и окончания обязательно. Время окончания — не позже 23:59.
              </p>

              <div className={styles.formActions}>
                <button className={styles.saveButton} onClick={() => void savePoint()} disabled={saving || !canEditAddresses}>
                  {saving ? "Сохраняем…" : "Сохранить пункт"}
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