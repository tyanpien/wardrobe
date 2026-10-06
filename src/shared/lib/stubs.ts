import type { Item } from "@/entities/item";
import type { Organization } from "@/entities/organization";
import type { VolunteerTask } from "@/entities/volunteer-task";
import type { EcoStats } from "@/entities/eco-stats";

export const stubItems: Item[] = [
  {
    id: "item-1",
    ownerId: "user-1",
    title: "Демисезонное пальто",
    description: "Пальто в хорошем состоянии, без дефектов.",
    category: "clothing",
    subcategory: "outerwear",
    condition: "good",
    photoUrls: [],
    transferType: "free",
    city: "Москва",
    status: "published",
  },
  {
    id: "item-2",
    ownerId: "user-1",
    title: "Детские книги",
    description: "Набор книг для дошкольников.",
    category: "kids",
    subcategory: "kids_books",
    condition: "excellent",
    photoUrls: [],
    transferType: "to_organization",
    city: "Москва",
    status: "published",
  },
];

export const stubOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Центр помощи «Теплый дом»",
    email: "help@example.org",
    contacts: "+7 900 000-00-00",
    workingHours: "Пн–Пт, 10:00–18:00",
    addresses: [{ id: "addr-1", address: "Москва, ул. Примерная, 1", workingHours: "10:00–18:00" }],
    acceptedItems: {
      categories: ["clothing", "kids"],
      subcategories: ["outerwear", "kids_clothing"],
      allowedConditions: ["new", "excellent", "good"],
      extraRequirements: "Вещи должны быть чистыми.",
    },
    rejectedItems: {
      categories: ["other"],
      extraRestrictions: "Не принимаем вещи, требующие ремонта.",
    },
  },
];

export const stubVolunteerTasks: VolunteerTask[] = [
  {
    id: "task-1",
    organizationId: "org-1",
    title: "Сортировка одежды на складе",
    description: "Помощь в разборе и сортировке поступивших вещей.",
    location: "Москва, ул. Примерная, 1",
    dateOrPeriod: "12–14 октября",
    volunteersNeeded: 4,
    helpType: "Складская помощь",
    status: "open",
  },
];

export const stubEcoStats: EcoStats = {
  userId: "user-1",
  completedTransfersCount: 0,
  textileSavedAmount: 0,
  history: [],
};
