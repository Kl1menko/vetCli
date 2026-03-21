import Link from "next/link";

import {
  createVisitFromAppointmentFormAction,
  deactivateOwnDoctorScheduleFormAction,
  upsertOwnDoctorScheduleFormAction,
} from "@/server/actions/doctor";
import { ActionButtonForm } from "@/components/forms/action-button-form";
import { DoctorScheduleManager } from "@/components/forms/doctor-schedule-manager";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDoctorAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatGridLabel(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

function buildTimelineScale(startTime: string, endTime: string, stepMinutes: number) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const items: string[] = [];

  for (let cursor = start; cursor <= end; cursor += stepMinutes) {
    items.push(formatGridLabel(cursor));
  }

  return items;
}

function clampPercent(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default async function DoctorSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await requireDoctorAccess();
  const { date } = await searchParams;
  const selectedDate = date ?? new Date().toISOString().slice(0, 10);
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    select: { id: true, fullName: true },
  });

  const [appointments, schedule, blocks] = doctor
    ? await Promise.all([
        prisma.appointment.findMany({
          where: {
            doctorId: doctor.id,
            date: new Date(selectedDate),
          },
          include: {
            pet: true,
            owner: true,
            service: true,
            visit: true,
          },
          orderBy: [{ startTime: "asc" }],
        }),
        prisma.doctorSchedule.findFirst({
          where: {
            doctorId: doctor.id,
            weekday: new Date(selectedDate).getDay() || 7,
            isActive: true,
          },
        }),
        prisma.scheduleBlock.findMany({
          where: {
            doctorId: doctor.id,
            date: new Date(selectedDate),
          },
          orderBy: { startTime: "asc" },
        }),
      ])
    : [[], null, []];
  const weeklySchedules = doctor
    ? await prisma.doctorSchedule.findMany({
        where: {
          doctorId: doctor.id,
        },
        orderBy: { weekday: "asc" },
      })
    : [];

  const stepMinutes = schedule?.slotDurationMinutes ?? 30;
  const timelineStart = schedule?.startTime ?? "09:00";
  const timelineEnd = schedule?.endTime ?? "18:00";
  const timelineScale = buildTimelineScale(timelineStart, timelineEnd, stepMinutes);
  const timelineStartMinutes = toMinutes(timelineStart);
  const timelineEndMinutes = toMinutes(timelineEnd);
  const timelineDuration = Math.max(timelineEndMinutes - timelineStartMinutes, stepMinutes);

  const appointmentTimelineItems = appointments.map((appointment) => {
    const start = toMinutes(appointment.startTime);
    const end = toMinutes(appointment.endTime);
    const top = ((start - timelineStartMinutes) / timelineDuration) * 100;
    const height = (Math.max(end - start, stepMinutes) / timelineDuration) * 100;
    const durationMinutes = Math.max(end - start, stepMinutes);

    return {
      ...appointment,
      top,
      height,
      durationMinutes,
    };
  });

  const blockTimelineItems = blocks.map((block) => {
    const start = toMinutes(block.startTime);
    const end = toMinutes(block.endTime);
    const top = ((start - timelineStartMinutes) / timelineDuration) * 100;
    const height = (Math.max(end - start, stepMinutes) / timelineDuration) * 100;

    return {
      ...block,
      top,
      height,
    };
  });

  return (
    <div className="grid gap-6">
      <Card className="border-[#cfe8df] bg-[linear-gradient(135deg,#f4fcfa_0%,#eaf7f3_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Розклад на день.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Прийоми, паузи і швидкий перехід до візиту.
            </p>
          </div>
          <Link href="/doctor/appointments" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
            Список прийомів
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Мій тижневий графік</CardTitle>
        </CardHeader>
        <CardContent>
          <DoctorScheduleManager
            schedules={weeklySchedules.map((schedule) => ({
              id: schedule.id,
              weekday: schedule.weekday,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              slotDurationMinutes: schedule.slotDurationMinutes,
              breakStart: schedule.breakStart,
              breakEnd: schedule.breakEnd,
              isActive: schedule.isActive,
            }))}
            saveAction={upsertOwnDoctorScheduleFormAction}
            disableAction={deactivateOwnDoctorScheduleFormAction}
            title="Базовий шаблон по днях тижня"
            description="Регулярний графік формує доступні слоти."
          />
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Обрати день</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="doctor-schedule-date" className="text-sm font-medium">
                Дата
              </label>
              <input
                id="doctor-schedule-date"
                name="date"
                type="date"
                defaultValue={selectedDate}
                className="h-10 rounded-lg border border-input px-3"
              />
            </div>
            <Button type="submit">Показати день</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <CardHeader>
          <CardTitle>Мій розклад на день</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 rounded-3xl border border-border/70 bg-muted/20 p-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Лікар</p>
              <p className="font-medium">{doctor?.fullName ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Дата</p>
              <p className="font-medium">{new Date(selectedDate).toLocaleDateString("uk-UA")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Прийомів / блоків</p>
              <p className="font-medium">{appointments.length} / {blocks.length}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-background p-4">
            {schedule ? (
              <div className="grid grid-cols-[76px_1fr] gap-4">
                <div className="relative rounded-[1.5rem] border border-border/60 bg-slate-50/70 px-1 py-1">
                  {timelineScale.map((time, index) => (
                    <div
                      key={time}
                      className="flex items-start justify-end pr-3 text-[11px] font-medium text-slate-500"
                      style={{
                        height: index === timelineScale.length - 1 ? 0 : 56,
                      }}
                    >
                      <span className="-translate-y-2 rounded-full bg-white px-2 py-0.5 shadow-sm">{time}</span>
                    </div>
                  ))}
                </div>

                <div className="relative min-h-[calc(56px_*_16)] overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,rgba(248,252,252,0.98)_0%,rgba(255,255,255,1)_100%)] px-2 py-1">
                  {timelineScale.slice(0, -1).map((time) => (
                    <div
                      key={time}
                      className="absolute inset-x-0 border-t border-dashed border-border/60 first:border-t-0"
                      style={{
                        top: `${((toMinutes(time) - timelineStartMinutes) / timelineDuration) * 100}%`,
                      }}
                    />
                  ))}

                  {blockTimelineItems.map((block) => (
                    <div
                      key={block.id}
                      className="absolute left-3 right-3 rounded-[1.35rem] border border-amber-200/90 bg-[linear-gradient(180deg,rgba(254,243,199,0.92)_0%,rgba(255,251,235,0.98)_100%)] px-4 py-3 shadow-[0_18px_32px_-28px_rgba(120,53,15,0.45)]"
                      style={{
                        top: `${clampPercent(block.top, 0, 94)}%`,
                        minHeight: "54px",
                        height: `${Math.max(block.height, 8)}%`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-amber-950">
                            {block.startTime}–{block.endTime}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-amber-900/80">
                            {block.reason ?? "Блок часу в календарі"}
                          </p>
                        </div>
                        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-amber-900">
                          Блок
                        </span>
                      </div>
                    </div>
                  ))}

                  {appointmentTimelineItems.map((appointment) => (
                    (() => {
                      const isCompact = appointment.durationMinutes <= 45;
                      const isCancelled = appointment.status.includes("CANCELLED");
                      const canCreateVisit = ["CONFIRMED", "RESCHEDULED"].includes(appointment.status) && !appointment.visit;

                      return (
                        <div
                          key={appointment.id}
                          className={cn(
                            "absolute left-3 right-3 overflow-hidden rounded-[1.5rem] border shadow-[0_20px_42px_-32px_rgba(15,23,42,0.45)] backdrop-blur-[1px]",
                            appointment.status === "CONFIRMED" &&
                              "border-emerald-200/90 bg-[linear-gradient(180deg,rgba(220,252,231,0.72)_0%,rgba(240,253,244,0.96)_100%)]",
                            appointment.status === "PENDING" &&
                              "border-amber-200/90 bg-[linear-gradient(180deg,rgba(254,249,195,0.78)_0%,rgba(255,251,235,0.97)_100%)]",
                            appointment.status === "COMPLETED" &&
                              "border-sky-200/90 bg-[linear-gradient(180deg,rgba(219,234,254,0.78)_0%,rgba(239,246,255,0.98)_100%)]",
                            appointment.status.includes("CANCELLED") &&
                              "border-rose-200/90 bg-[linear-gradient(180deg,rgba(255,228,230,0.78)_0%,rgba(255,241,242,0.98)_100%)]",
                            !["CONFIRMED", "PENDING", "COMPLETED"].includes(appointment.status) &&
                              !appointment.status.includes("CANCELLED") &&
                              "border-slate-200/90 bg-[linear-gradient(180deg,rgba(248,250,252,0.9)_0%,rgba(255,255,255,0.98)_100%)]",
                          )}
                          style={{
                            top: `${clampPercent(appointment.top, 0, 95)}%`,
                            minHeight: isCompact ? "72px" : "116px",
                            height: `${Math.max(appointment.height, isCompact ? 8 : 12)}%`,
                          }}
                        >
                          <div
                            className={cn(
                              "flex h-full flex-col gap-3 px-4 py-3",
                              isCompact ? "sm:flex-row sm:items-center sm:justify-between sm:gap-4" : "",
                            )}
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-start gap-2">
                                <p className="text-sm font-semibold tracking-[-0.02em] text-slate-950">
                                  {appointment.startTime}–{appointment.endTime}
                                </p>
                                {isCompact ? <StatusBadge status={appointment.status} /> : null}
                              </div>
                              <p className="mt-1 truncate text-sm font-medium text-slate-900">
                                {appointment.pet.name} · {appointment.service.name}
                              </p>
                              <p className="mt-1 truncate text-xs text-slate-600">{appointment.owner.fullName}</p>
                            </div>

                            <div className={cn("flex flex-col gap-3", isCompact ? "sm:items-end" : "")}>
                              {!isCompact ? (
                                <div className="flex items-start justify-end">
                                  <StatusBadge status={appointment.status} />
                                </div>
                              ) : null}

                              <div className="flex flex-wrap gap-2">
                                <Link
                                  href={`/doctor/patients/${appointment.pet.id}`}
                                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-white/80")}
                                >
                                  Пацієнт
                                </Link>
                                {appointment.visit ? (
                                  <Link
                                    href={`/doctor/visits/${appointment.visit.id}`}
                                    className={cn(buttonVariants({ size: "sm" }), "shadow-none")}
                                  >
                                    Відкрити візит
                                  </Link>
                                ) : canCreateVisit ? (
                                  <ActionButtonForm
                                    action={createVisitFromAppointmentFormAction}
                                    fields={[{ name: "appointmentId", value: appointment.id }]}
                                    submitLabel="Створити візит"
                                    pendingLabel="Створюю…"
                                    size="sm"
                                    buttonClassName={cn(buttonVariants({ size: "sm" }), "shadow-none")}
                                    successTitle="Візит створено"
                                    errorTitle="Не вдалося створити візит"
                                  />
                                ) : (
                                  <span className="inline-flex h-7 items-center rounded-full border border-white/70 bg-white/55 px-3 text-[11px] font-medium text-slate-500">
                                    {isCancelled
                                      ? "Скасований запис"
                                      : appointment.status === "COMPLETED"
                                        ? "Прийом завершено"
                                        : "Чекає підтвердження"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                На цю дату у вас немає активного графіка, тому розклад не показується.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
