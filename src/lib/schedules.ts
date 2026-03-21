import { z } from "zod";

export const weekdayOptions = [
  { value: 1, label: "Понеділок" },
  { value: 2, label: "Вівторок" },
  { value: 3, label: "Середа" },
  { value: 4, label: "Четвер" },
  { value: 5, label: "П’ятниця" },
  { value: 6, label: "Субота" },
  { value: 7, label: "Неділя" },
] as const;

export const weekdayLabelMap = Object.fromEntries(
  weekdayOptions.map((option) => [option.value, option.label]),
) as Record<number, string>;

export const doctorScheduleFormSchema = z.object({
  weekday: z.coerce.number().int().min(1).max(7),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  slotDurationMinutes: z.coerce.number().int().positive(),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
  isActive: z.boolean().optional(),
});

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function normalizeDoctorSchedulePayload(payload: z.infer<typeof doctorScheduleFormSchema>) {
  return {
    ...payload,
    breakStart: payload.breakStart || null,
    breakEnd: payload.breakEnd || null,
    isActive: payload.isActive ?? false,
  };
}

export function assertDoctorScheduleWindow(payload: ReturnType<typeof normalizeDoctorSchedulePayload>) {
  if (toMinutes(payload.startTime) >= toMinutes(payload.endTime)) {
    throw new Error("Час завершення має бути пізніше за початок зміни.");
  }

  if ((payload.breakStart && !payload.breakEnd) || (!payload.breakStart && payload.breakEnd)) {
    throw new Error("Перерву потрібно вказувати повністю: і початок, і завершення.");
  }

  if (!payload.breakStart || !payload.breakEnd) {
    return;
  }

  const shiftStart = toMinutes(payload.startTime);
  const shiftEnd = toMinutes(payload.endTime);
  const breakStart = toMinutes(payload.breakStart);
  const breakEnd = toMinutes(payload.breakEnd);

  if (breakStart >= breakEnd) {
    throw new Error("Завершення перерви має бути пізніше за її початок.");
  }

  if (breakStart <= shiftStart || breakEnd >= shiftEnd) {
    throw new Error("Перерва має бути всередині робочої зміни.");
  }
}

export function getDoctorScheduleFieldErrorMessage(result: z.ZodSafeParseError<unknown>) {
  const issue = result.error.issues[0];

  if (!issue) {
    return "Перевірте параметри графіка.";
  }

  if (issue.path[0] === "weekday") {
    return "Оберіть день тижня.";
  }

  if (issue.path[0] === "startTime") {
    return "Вкажіть час початку зміни.";
  }

  if (issue.path[0] === "endTime") {
    return "Вкажіть час завершення зміни.";
  }

  if (issue.path[0] === "slotDurationMinutes") {
    return "Вкажіть коректну тривалість слота.";
  }

  return "Перевірте параметри графіка.";
}
