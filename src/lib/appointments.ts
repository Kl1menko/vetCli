import type { AppointmentStatus } from "@/types/domain";

export type AppointmentTransitionActor = "CLIENT" | "ADMIN" | "DOCTOR_SYSTEM";

export const blockingAppointmentStatuses: AppointmentStatus[] = [
  "NEW",
  "PENDING",
  "CONFIRMED",
  "RESCHEDULED",
];

const adminEditableBaseStatuses: AppointmentStatus[] = [
  "NEW",
  "PENDING",
  "CONFIRMED",
  "RESCHEDULED",
  "CANCELLED_BY_ADMIN",
  "NO_SHOW",
];

const terminalStatuses: AppointmentStatus[] = [
  "CANCELLED_BY_CLIENT",
  "CANCELLED_BY_ADMIN",
  "COMPLETED",
  "NO_SHOW",
];

export function isTerminalAppointmentStatus(status: AppointmentStatus) {
  return terminalStatuses.includes(status);
}

export function blocksAppointmentAvailability(status: AppointmentStatus) {
  return blockingAppointmentStatuses.includes(status);
}

export function isCancelledAppointmentStatus(status: AppointmentStatus) {
  return status === "CANCELLED_BY_CLIENT" || status === "CANCELLED_BY_ADMIN";
}

export function getAppointmentDateTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function isUpcomingAppointment({
  date,
  startTime,
  status,
  now = new Date(),
}: {
  date: Date;
  startTime: string;
  status: AppointmentStatus;
  now?: Date;
}) {
  return blocksAppointmentAvailability(status) && getAppointmentDateTime(date, startTime) >= now;
}

export function getAdminEditableAppointmentStatuses(current: AppointmentStatus) {
  return adminEditableBaseStatuses.includes(current)
    ? adminEditableBaseStatuses
    : [...adminEditableBaseStatuses, current];
}

export function assertAppointmentStatusTransition({
  current,
  next,
  actor,
  hasCompletedVisit = false,
}: {
  current: AppointmentStatus;
  next: AppointmentStatus;
  actor: AppointmentTransitionActor;
  hasCompletedVisit?: boolean;
}) {
  if (current === next) {
    return;
  }

  const allowedByActor: Record<AppointmentTransitionActor, Partial<Record<AppointmentStatus, AppointmentStatus[]>>> = {
    CLIENT: {
      PENDING: ["CANCELLED_BY_CLIENT", "RESCHEDULED"],
      CONFIRMED: ["CANCELLED_BY_CLIENT", "RESCHEDULED"],
      RESCHEDULED: ["CANCELLED_BY_CLIENT"],
    },
    ADMIN: {
      NEW: ["PENDING", "CONFIRMED", "CANCELLED_BY_ADMIN"],
      PENDING: ["CONFIRMED", "CANCELLED_BY_ADMIN"],
      CONFIRMED: ["RESCHEDULED", "CANCELLED_BY_ADMIN", "NO_SHOW"],
      RESCHEDULED: ["CONFIRMED", "CANCELLED_BY_ADMIN"],
    },
    DOCTOR_SYSTEM: {
      CONFIRMED: ["COMPLETED"],
      RESCHEDULED: ["COMPLETED"],
    },
  };

  if (next === "COMPLETED") {
    if (actor !== "DOCTOR_SYSTEM" || !hasCompletedVisit) {
      throw new Error("Статус COMPLETED можна виставити лише після завершення візиту.");
    }
  }

  const allowedTransitions = allowedByActor[actor][current] ?? [];

  if (!allowedTransitions.includes(next)) {
    throw new Error(`Недопустимий перехід статусу: ${current} -> ${next}.`);
  }
}
