export type OrganizationCategory = {
  title: string;
  icon: string;
  items: string[];
};

export type OrganizationPoint = {
  title: string;
  address: string;
  hours: string;
};

export type OrganizationDetailMock = {
  id: string;
  name: string;
  city: string;
  logoText: string;
  logoColor: string;
  description: string;
  aboutParagraphs: string[];
  phone: string;
  email: string;
  categories: OrganizationCategory[];
  allowedConditions: string[];
  extraRequirements: string;
  rejectedItems: string[];
  points: OrganizationPoint[];
  volunteerText?: string;
};

export const organizationCategories: OrganizationCategory[] = [
  {
    title: "Одежда",
    icon: "/coolicons_shirt.svg",
    items: [
      "Верхняя одежда",
      "Футболки и топы",
      "Брюки и джинсы",
      "Платья и юбки",
      "Свитеры и кофты",
      "Рубашки и блузки",
      "Спортивная одежда",
    ],
  },
  {
    title: "Обувь",
    icon: "/lucide_sport-shoe.svg",
    items: [
      "Повседневная обувь",
      "Спортивная обувь",
      "Сапоги и ботинки",
      "Туфли и босоножки",
      "Домашняя обувь",
    ],
  },
  {
    title: "Аксессуары",
    icon: "/bi_handbag.svg",
    items: [
      "Сумки и рюкзаки",
      "Ремни",
      "Шарфы и платки",
      "Головные уборы",
      "Перчатки",
    ],
  },
  {
    title: "Дом и быт",
    icon: "/bi_house-door.svg",
    items: [
      "Постельное бельё",
      "Полотенца",
      "Посуда",
      "Предметы интерьера",
      "Домашний текстиль",
    ],
  },
  {
    title: "Детские вещи",
    icon: "/cil_baby-carriage.svg",
    items: [
      "Детская одежда",
      "Детская обувь",
      "Игрушки",
      "Коляски и аксессуары",
      "Детские товары",
    ],
  },
  {
    title: "Электроника",
    icon: "/energy-icons_smartphone-20.svg",
    items: [
      "Мобильные телефоны",
      "Планшеты",
      "Ноутбуки",
      "Мелкая бытовая техника",
      "Аксессуары для электроники",
    ],
  },
  {
    title: "Книги и канцелярия",
    icon: "/bi_book.svg",
    items: [
      "Художественная литература",
      "Детские книги",
      "Учебники",
      "Тетради и блокноты",
      "Канцелярские принадлежности",
    ],
  },
  {
    title: "Хобби и спорт",
    icon: "/solar_dumbbell-large-minimalistic-broken.svg",
    items: [
      "Спортивный инвентарь",
      "Тренажёры",
      "Настольные игры",
      "Товары для творчества",
      "Музыкальные инструменты",
    ],
  },
  {
    title: "Другое",
    icon: "/carbon_ibm-z-os-package-manager.svg",
    items: [
      "Товары для животных",
      "Посуда и кухонные принадлежности",
      "Предметы для рукоделия",
      "Другие полезные вещи",
    ],
  },
];

const defaultRejectedItems = [
  "Вещи с сильными загрязнениями",
  "Одежду и обувь с повреждениями",
  "Вещи с неприятным запахом",
  "Нижнее бельё и носки бывшие в употреблении",
];

const defaultRequirements =
  "Вещи должны быть чистыми, сухими и пригодными для дальнейшего использования. Одежду и текстиль желательно передавать в пакетах или коробках.";

const defaultPoints: OrganizationPoint[] = [
  {
    title: "Пункт на ВИЗе",
    address: "ул. Крауля, 8",
    hours: "Пн–Пт: 10:00–19:00, Сб–Вс: 11:00–17:00",
  },
  {
    title: "Пункт в центре",
    address: "ул. Малышева, 12",
    hours: "Ежедневно: 10:00–20:00",
  },
  {
    title: "Пункт на Уралмаше",
    address: "пр-т Космонавтов, 25",
    hours: "Вт–Сб: 10:00–18:00",
  },
];

export const mockOrganizationDetails: OrganizationDetailMock[] = [
  {
    id: "teply-dom",
    name: "Центр помощи «Тёплый дом»",
    city: "Екатеринбург",
    logoText: "ТД",
    logoColor: "#E7F9A9",
    description:
      "Помогаем вещам находить новых хозяев. Принимаем одежду, обувь, детские вещи и предметы для дома в хорошем состоянии и передаём их людям, которым они нужны.",
    aboutParagraphs: [
      "Мы работаем в Екатеринбурге более 5 лет. Наша миссия — развивать культуру осознанного потребления и помогать тем, кто оказался в трудной жизненной ситуации.",
      "Ежемесячно мы собираем и распределяем более 2 тонн одежды и обуви. 80% вещей передаются подопечным благотворительных фондов, а оставшиеся 20% реализуются через сеть благотворительных магазинов для покрытия транспортных и складских расходов.",
    ],
    phone: "+7 (343) 222-33-44",
    email: "hello@dobro-vechi.ru",
    categories: organizationCategories,
    allowedConditions: ["Новое", "Отличное"],
    extraRequirements: defaultRequirements,
    rejectedItems: defaultRejectedItems,
    points: defaultPoints,
  },
  {
    id: "vtoroe-dyhanie",
    name: "Благотворительный фонд «Второе дыхание»",
    city: "Москва",
    logoText: "ВД",
    logoColor: "#E7F9A9",
    description:
      "Даём одежде вторую жизнь и поддерживаем тех, кому нужна помощь.",
    aboutParagraphs: [
      "Собираем одежду и текстиль, пригодные для повторного использования. Помогаем вещам продолжать служить людям.",
      "Переданные вещи сортируются и направляются на благотворительные программы или переработку.",
    ],
    phone: "+7 (900) 000-00-02",
    email: "help@second-breath.example",
    categories: organizationCategories,
    allowedConditions: ["Новое", "Отличное", "Хорошее"],
    extraRequirements: defaultRequirements,
    rejectedItems: defaultRejectedItems,
    points: defaultPoints,
  },
  {
    id: "laska",
    name: "Социальный проект «Ласка»",
    city: "Санкт-Петербург",
    logoText: "Л",
    logoColor: "#E7F9A9",
    description:
      "Собираем вещи для людей и семей, которым необходима поддержка.",
    aboutParagraphs: [
      "Организуем сбор вещей для благотворительных программ и помогаем сократить количество текстильных отходов.",
      "Вещи проходят сортировку и передаются семьям и социальным проектам.",
    ],
    phone: "+7 (900) 000-00-03",
    email: "team@laska.example",
    categories: organizationCategories,
    allowedConditions: ["Новое", "Отличное"],
    extraRequirements: defaultRequirements,
    rejectedItems: defaultRejectedItems,
    points: defaultPoints,
  },
  {
    id: "dobrye-ruki",
    name: "Организация «Добрые руки»",
    city: "Казань",
    logoText: "ДР",
    logoColor: "#E7F9A9",
    description:
      "Помогаем пожилым людям, многодетным семьям и детям.",
    aboutParagraphs: [
      "Принимаем полезные в быту вещи и передаём их людям, которым они действительно нужны.",
      "Работаем вместе с местными волонтёрами и социальными службами.",
    ],
    phone: "+7 (900) 000-00-04",
    email: "mail@dobrye-ruki.example",
    categories: organizationCategories,
    allowedConditions: ["Новое", "Отличное", "Хорошее"],
    extraRequirements: defaultRequirements,
    rejectedItems: defaultRejectedItems,
    points: defaultPoints,
  },
  {
    id: "radost",
    name: "Фонд поддержки «Радость»",
    city: "Екатеринбург",
    logoText: "Р",
    logoColor: "#E7F9A9",
    description:
      "Создаём комфортную среду для детей и родителей.",
    aboutParagraphs: [
      "Поддерживаем семьи с детьми: собираем одежду, школьные принадлежности и товары для ухода за малышами.",
      "Помогаем родителям обеспечить детей необходимыми вещами.",
    ],
    phone: "+7 (900) 000-00-05",
    email: "info@radost.example",
    categories: organizationCategories,
    allowedConditions: ["Новое", "Отличное"],
    extraRequirements: defaultRequirements,
    rejectedItems: defaultRejectedItems,
    points: defaultPoints,
  },
  {
    id: "novyi-den",
    name: "Центр взаимопомощи «Новый день»",
    city: "Нижний Новгород",
    logoText: "НД",
    logoColor: "#E7F9A9",
    description:
      "Объединяем людей, чтобы полезные вещи находили новых владельцев.",
    aboutParagraphs: [
      "Развиваем культуру повторного использования вещей и поддерживаем местные социальные инициативы.",
      "Собираем полезные вещи и распределяем их между семьями, которым нужна помощь.",
    ],
    phone: "+7 (900) 000-00-06",
    email: "team@new-day.example",
    categories: organizationCategories,
    allowedConditions: ["Новое", "Отличное", "Хорошее"],
    extraRequirements: defaultRequirements,
    rejectedItems: defaultRejectedItems,
    points: defaultPoints,
  },
];