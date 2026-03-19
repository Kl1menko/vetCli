export const userRoles = ["CLIENT", "ADMIN", "DOCTOR", "SUPERADMIN"] as const;
export type UserRole = (typeof userRoles)[number];

export const appointmentStatuses = [
  "NEW",
  "PENDING",
  "CONFIRMED",
  "RESCHEDULED",
  "CANCELLED_BY_CLIENT",
  "CANCELLED_BY_ADMIN",
  "COMPLETED",
  "NO_SHOW",
] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export type NavItem = {
  href: string;
  label: string;
  matchStartsWith?: boolean;
};

export type SummaryMetric = {
  label: string;
  value: string;
  hint: string;
};
