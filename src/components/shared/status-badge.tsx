import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types/domain";

export const appointmentStatusLabelMap: Record<AppointmentStatus, string> = {
  NEW: "Новий",
  PENDING: "Очікує підтвердження",
  CONFIRMED: "Підтверджено",
  RESCHEDULED: "Перенесено",
  CANCELLED_BY_CLIENT: "Скасовано клієнтом",
  CANCELLED_BY_ADMIN: "Скасовано адміністратором",
  COMPLETED: "Завершено",
  NO_SHOW: "Не прийшов",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent",
        status === "CONFIRMED" && "bg-emerald-100 text-emerald-900",
        status === "PENDING" && "bg-amber-100 text-amber-900",
        status === "COMPLETED" && "bg-sky-100 text-sky-900",
        status.includes("CANCELLED") && "bg-rose-100 text-rose-900",
      )}
    >
      {appointmentStatusLabelMap[status]}
    </Badge>
  );
}
