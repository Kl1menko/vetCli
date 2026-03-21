import type { SummaryMetric } from "@/types/domain";

export const serviceCategoryLabels = {
  consultation: "Консультації та терапія",
  surgery: "Хірургія та супровід",
  dentistry: "Стоматологія",
  ophthalmology: "Офтальмологія",
  diagnostics: "Діагностика",
  prevention: "Профілактика",
  hygienic: "Гігієна та догляд",
  hospital: "Стаціонар",
  oncology: "Онкологія",
  shop: "Товари та підтримка",
} as const;

type ServiceCategory = keyof typeof serviceCategoryLabels;

export const clinicProfile = {
  name: "UltraVet",
  city: "Львів",
  address: "вул. Околична, 10",
  hours: "Пн–Сб 10:00–18:00",
  closedDay: "Нд — вихідний",
  phone: "+380 67 000 00 00",
  phoneHref: "tel:+380670000000",
  email: "hello@ultravet.ua",
};

export const clinicServices = [
  {
    slug: "consultation",
    title: "Консультація",
    category: "consultation" as ServiceCategory,
    shortDescription: "Окрема консультація лікаря для уточнення стану, симптомів і подальшого плану.",
    description:
      "Консультація підходить для обговорення симптомів, повторного контакту після лікування, розбору аналізів або визначення, який наступний крок потрібен тварині.",
  },
  {
    slug: "therapy",
    title: "Терапія",
    category: "consultation" as ServiceCategory,
    shortDescription: "Первинний прийом, огляд, базова діагностика і план лікування.",
    description:
      "Терапевтичний прийом підходить для первинного огляду, контролю хронічних станів, повторних консультацій і побудови подальшого маршруту лікування.",
  },
  {
    slug: "surgery",
    title: "Хірургія",
    category: "surgery" as ServiceCategory,
    shortDescription: "Планові та ургентні хірургічні втручання з післяопераційним супроводом.",
    description:
      "Проводимо планові й ургентні операції, готуємо тварину до втручання, пояснюємо ризики й супроводжуємо відновлення після операції.",
  },
  {
    slug: "dentistry",
    title: "Стоматологія",
    category: "dentistry" as ServiceCategory,
    shortDescription: "Огляд ротової порожнини, лікування, санація і профілактика.",
    description:
      "Стоматологічний напрямок охоплює профілактику, чистку, лікування запалень, оцінку стану ясен і зубів та план подальшого догляду.",
  },
  {
    slug: "ophthalmology",
    title: "Офтальмологія",
    category: "ophthalmology" as ServiceCategory,
    shortDescription: "Діагностика та супровід станів очей, повік і слізних шляхів.",
    description:
      "Офтальмологічний прийом потрібний при почервонінні, сльозотечі, виділеннях, травмах ока, підозрі на запалення або хронічних проблемах із зором.",
  },
  {
    slug: "ultrasound",
    title: "УЗД",
    category: "diagnostics" as ServiceCategory,
    shortDescription: "Швидка візуальна діагностика для уточнення клінічної картини.",
    description:
      "Ультразвукова діагностика допомагає швидко оцінити стан внутрішніх органів і використовується як частина терапевтичного або профільного прийому.",
  },
  {
    slug: "vaccination",
    title: "Вакцинація",
    category: "prevention" as ServiceCategory,
    shortDescription: "Планова і сезонна вакцинація з фіксацією в медичній історії.",
    description:
      "Проводимо вакцинацію за віком, видом тварини та клінічною картиною, а результати й наступні дати фіксуємо в картці пацієнта.",
  },
  {
    slug: "microchipping",
    title: "Чіпування",
    category: "prevention" as ServiceCategory,
    shortDescription: "Ідентифікація тварини з внесенням даних і супровідною консультацією.",
    description:
      "Чіпування допомагає ідентифікувати тварину, а також є важливим етапом для подорожей, реєстрації та підтвердження власності.",
  },
  {
    slug: "hospital",
    title: "Стаціонар",
    category: "hospital" as ServiceCategory,
    shortDescription: "Спостереження, підтримка та контроль стану тварини між прийомами.",
    description:
      "Стаціонар потрібний у випадках, коли тварині потрібен нагляд, контроль терапії, інфузії або відновлення після складного втручання.",
  },
  {
    slug: "lab-tests",
    title: "Аналізи",
    category: "diagnostics" as ServiceCategory,
    shortDescription: "Забір матеріалу та лабораторна діагностика з подальшим розбором результатів.",
    description:
      "Організовуємо лабораторні дослідження як частину діагностики та додаємо результати до медичної історії тварини.",
  },
  {
    slug: "pet-store",
    title: "Ветаптека",
    category: "shop" as ServiceCategory,
    shortDescription: "Базові ветеринарні товари та супровід по подальшому догляду.",
    description:
      "У ветаптеці допомагаємо підібрати базові засоби догляду, профілактики та підтримки відповідно до рекомендацій лікаря.",
  },
  {
    slug: "grooming",
    title: "Грумінг",
    category: "hygienic" as ServiceCategory,
    shortDescription: "Гігієнічні процедури та догляд за шерстю, шкірою й кігтями.",
    description:
      "Грумінг охоплює гігієнічний догляд, допомагає підтримувати комфорт тварини й часто доповнює профілактичні візити до клініки.",
  },
  {
    slug: "hygienic-procedures",
    title: "Гігієнічні процедури",
    category: "hygienic" as ServiceCategory,
    shortDescription: "Профілактичний догляд і процедури для підтримки щоденного комфорту тварини.",
    description:
      "До гігієнічних процедур відносимо базовий догляд, очищення, профілактичні маніпуляції та допомогу в тих випадках, коли домашнього догляду вже недостатньо.",
  },
  {
    slug: "visual-diagnostics",
    title: "Візуальна діагностика",
    category: "diagnostics" as ServiceCategory,
    shortDescription: "Оцінка клінічного стану через інструментальні та візуалізаційні методи.",
    description:
      "Візуальна діагностика допомагає швидко уточнити стан пацієнта і може включати УЗД, оглядові методи та додаткові інструментальні підходи залежно від запиту.",
  },
  {
    slug: "anesthesiology",
    title: "Анестезіологія",
    category: "surgery" as ServiceCategory,
    shortDescription: "Підготовка до процедур, контроль безпеки та супровід під час втручань.",
    description:
      "Анестезіологічний супровід потрібний перед хірургічними, стоматологічними та частиною діагностичних процедур, коли важлива стабільність стану тварини під час втручання.",
  },
  {
    slug: "oncology",
    title: "Онкологія",
    category: "oncology" as ServiceCategory,
    shortDescription: "Первинна оцінка новоутворень, маршрутизація та підтримуючий супровід.",
    description:
      "Онкологічний напрямок охоплює первинну оцінку утворень, уточнення подальшої діагностики, координацію лікувального плану та підтримку власника на кожному етапі.",
  },
  {
    slug: "pet-supplies",
    title: "Зоотовари",
    category: "shop" as ServiceCategory,
    shortDescription: "Базові товари для догляду, харчування і щоденної профілактики.",
    description:
      "Підбираємо товари для домашнього догляду, профілактики та повсякденного комфорту тварини після консультації або лікування.",
  },
] as const;

export function getClinicServiceBySlug(slug: string) {
  return clinicServices.find((service) => service.slug === slug);
}

export function getServicesByCategory(category: ServiceCategory) {
  return clinicServices.filter((service) => service.category === category);
}

export function getServiceCategoryLabel(category: ServiceCategory) {
  return serviceCategoryLabels[category];
}

export function getServiceCategoryCountLabel(category: ServiceCategory) {
  const count = getServicesByCategory(category).length;

  if (count === 1) {
    return "1 послуга";
  }

  if (count >= 2 && count <= 4) {
    return `${count} послуги`;
  }

  return `${count} послуг`;
}

export const landingMetrics: SummaryMetric[] = [
  { label: "Років практики", value: "12+", hint: "Досвід команди в лікуванні дрібних домашніх тварин." },
  { label: "Онлайн-запис", value: "24/7", hint: "Бронювання доступне через сайт і кабінет клієнта." },
  { label: "Середній час прийому", value: "30 хв", hint: "Зазвичай цього часу достатньо, щоб спокійно оглянути тварину і відповісти на ваші запитання." },
];

export const doctorsPreview = [
  {
    name: "Марта Коваль",
    specialization: "Терапія та УЗД",
    bio: "Профілактика, планові огляди, діагностика і супровід хронічних станів.",
  },
  {
    name: "Іван Рудницький",
    specialization: "Хірургія",
    bio: "Планові та ургентні операції, післяопераційний контроль, стаціонарне ведення.",
  },
  {
    name: "Ольга Середа",
    specialization: "Стоматологія",
    bio: "Профілактика, лікування зубів і ясен, гігієнічні процедури під седацією.",
  },
];

export const pricingPreview = [
  { title: "Первинний прийом", price: "від 500 грн" },
  { title: "Вакцинація", price: "від 650 грн" },
  { title: "УЗД", price: "від 700 грн" },
  { title: "Стоматологія", price: "від 900 грн" },
];
