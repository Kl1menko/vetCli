import type { NavItem } from "@/types/domain";

export const publicNavigation: NavItem[] = [
  { href: "/", label: "Головна" },
  { href: "/services", label: "Послуги" },
  { href: "/doctors", label: "Лікарі" },
  { href: "/prices", label: "Ціни" },
  { href: "/contacts", label: "Контакти" },
  { href: "/booking", label: "Запис" },
];

export const cabinetNavigation: NavItem[] = [
  { href: "/cabinet", label: "Огляд" },
  { href: "/cabinet/profile", label: "Профіль" },
  { href: "/cabinet/pets", label: "Мої тварини", matchStartsWith: true },
  { href: "/cabinet/visits", label: "Візити" },
  { href: "/cabinet/appointments", label: "Записи" },
  { href: "/cabinet/prescriptions", label: "Призначення" },
  { href: "/cabinet/lab-results", label: "Аналізи" },
  { href: "/cabinet/invoices", label: "Чеки" },
];

export const adminNavigation: NavItem[] = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/calendar", label: "Календар" },
  { href: "/admin/appointments", label: "Записи" },
  { href: "/admin/clients", label: "Клієнти", matchStartsWith: true },
  { href: "/admin/pets", label: "Тварини", matchStartsWith: true },
  { href: "/admin/doctors", label: "Лікарі" },
  { href: "/admin/services", label: "Послуги" },
  { href: "/admin/visits", label: "Візити" },
  { href: "/admin/invoices", label: "Чеки" },
  { href: "/admin/settings", label: "Налаштування" },
];

export const doctorNavigation: NavItem[] = [
  { href: "/doctor", label: "Огляд" },
  { href: "/doctor/schedule", label: "Розклад" },
  { href: "/doctor/appointments", label: "Прийоми" },
  { href: "/doctor/clients", label: "Клієнти", matchStartsWith: true },
  { href: "/doctor/patients", label: "Тварини", matchStartsWith: true },
];
