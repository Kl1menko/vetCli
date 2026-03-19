import Link from "next/link";

import { createVisitFromAppointmentAction } from "@/server/actions/doctor";
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

    return {
      ...appointment,
      top,
      height,
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
              Розклад на день з прийомами, паузами і швидким стартом візиту.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Це головний екран для роботи протягом дня: тут видно навантаження, пацієнтів і доступ до візиту прямо зі слота.
            </p>
          </div>
          <Link href="/doctor/appointments" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
            Список прийомів
          </Link>
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
              <div className="grid grid-cols-[72px_1fr] gap-4">
                <div className="relative">
                  {timelineScale.map((time, index) => (
                    <div
                      key={time}
                      className="flex items-start justify-end pr-2 text-xs text-muted-foreground"
                      style={{
                        height: index === timelineScale.length - 1 ? 0 : 56,
                      }}
                    >
                      <span className="-translate-y-2 bg-background px-1">{time}</span>
                    </div>
                  ))}
                </div>

                <div className="relative min-h-[calc(56px_*_16)] overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,rgba(248,252,252,0.96)_0%,rgba(255,255,255,1)_100%)]">
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
                      className="absolute left-3 right-3 rounded-2xl border border-amber-200 bg-amber-100/90 px-4 py-3 shadow-sm"
                      style={{
                        top: `${block.top}%`,
                        height: `${Math.max(block.height, 10)}%`,
                      }}
                    >
                      <p className="text-sm font-semibold text-amber-950">
                        {block.startTime}–{block.endTime}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-amber-900/80">
                        {block.reason ?? "Блок часу в календарі"}
                      </p>
                    </div>
                  ))}

                  {appointmentTimelineItems.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={cn(
                        "absolute left-5 right-5 rounded-2xl border px-4 py-3 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]",
                        appointment.status === "CONFIRMED" && "border-emerald-200 bg-emerald-50/96",
                        appointment.status === "PENDING" && "border-amber-200 bg-amber-50/96",
                        appointment.status === "COMPLETED" && "border-sky-200 bg-sky-50/96",
                        appointment.status.includes("CANCELLED") && "border-rose-200 bg-rose-50/96",
                        !["CONFIRMED", "PENDING", "COMPLETED"].includes(appointment.status) &&
                          !appointment.status.includes("CANCELLED") &&
                          "border-slate-200 bg-white/96",
                      )}
                      style={{
                        top: `${appointment.top}%`,
                        height: `${Math.max(appointment.height, 10)}%`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-950">
                            {appointment.startTime}–{appointment.endTime}
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {appointment.pet.name} · {appointment.service.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">{appointment.owner.fullName}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href={`/doctor/patients/${appointment.pet.id}`}
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                            >
                              Пацієнт
                            </Link>
                            {appointment.visit ? (
                              <Link
                                href={`/doctor/visits/${appointment.visit.id}`}
                                className={cn(buttonVariants({ size: "sm" }))}
                              >
                                Візит
                              </Link>
                            ) : (
                              <form action={createVisitFromAppointmentAction}>
                                <input type="hidden" name="appointmentId" value={appointment.id} />
                                <button className={cn(buttonVariants({ size: "sm" }))} type="submit">
                                  Створити візит
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={appointment.status} />
                      </div>
                    </div>
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
