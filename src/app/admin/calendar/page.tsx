import {
  createAdminAppointmentAction,
  createScheduleBlockAction,
  deleteScheduleBlockAction,
  updateAppointmentAction,
  updateAppointmentStatusAction,
  updateScheduleBlockAction,
} from "@/server/actions/admin";
import { appointmentStatusLabelMap, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/server/services/appointments/availability";
import { cn } from "@/lib/utils";

const blockTypeLabel = {
  VACATION: "Відпустка",
  BREAK: "Перерва",
  MANUAL_BLOCK: "Ручний блок",
  EMERGENCY_RESERVE: "Резерв",
} as const;

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

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ doctorId?: string; date?: string; serviceId?: string }>;
}) {
  await requireAdminAccess();

  const { doctorId, date, serviceId } = await searchParams;
  const selectedDate = date ?? new Date().toISOString().slice(0, 10);

  const [owners, pets, doctors, services] = await Promise.all([
    prisma.ownerProfile.findMany({ orderBy: { fullName: "asc" } }),
    prisma.pet.findMany({ orderBy: { name: "asc" }, include: { owner: true } }),
    prisma.doctor.findMany({ where: { isActive: true }, orderBy: { fullName: "asc" } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const selectedDoctorId = doctorId ?? doctors[0]?.id;
  const selectedServiceId = serviceId ?? services[0]?.id;
  const [appointments, schedule, blocks, selectedService] = selectedDoctorId
    ? await Promise.all([
        prisma.appointment.findMany({
          where: {
            date: new Date(selectedDate),
            doctorId: selectedDoctorId,
          },
          include: { owner: true, pet: true, doctor: true, service: true },
          orderBy: { startTime: "asc" },
        }),
        prisma.doctorSchedule.findFirst({
          where: { doctorId: selectedDoctorId, weekday: new Date(selectedDate).getDay() || 7 },
        }),
        prisma.scheduleBlock.findMany({
          where: { doctorId: selectedDoctorId, date: new Date(selectedDate) },
          orderBy: { startTime: "asc" },
        }),
        selectedServiceId
          ? prisma.service.findUnique({
              where: { id: selectedServiceId },
              select: { id: true, durationMinutes: true, name: true },
            })
          : null,
      ])
    : [[], null, [], null];

  const stepMinutes = schedule?.slotDurationMinutes ?? 30;
  const timelineStart = schedule?.startTime ?? "09:00";
  const timelineEnd = schedule?.endTime ?? "18:00";
  const timelineScale = buildTimelineScale(timelineStart, timelineEnd, stepMinutes);
  const timelineStartMinutes = toMinutes(timelineStart);
  const timelineEndMinutes = toMinutes(timelineEnd);
  const timelineDuration = Math.max(timelineEndMinutes - timelineStartMinutes, stepMinutes);

  const availableSlots =
    schedule && selectedDoctorId && selectedService
      ? getAvailableSlots({
          serviceDurationMinutes: selectedService.durationMinutes,
          workingStart: schedule.startTime,
          workingEnd: schedule.endTime,
          blockedRanges: [
            ...blocks.map((block) => ({ start: block.startTime, end: block.endTime })),
            ...appointments.map((appointment) => ({ start: appointment.startTime, end: appointment.endTime })),
          ],
        })
      : [];

  const appointmentTimelineItems = appointments.map((appointment) => {
    const start = toMinutes(appointment.startTime);
    const end = toMinutes(appointment.endTime);
    const top = ((start - timelineStartMinutes) / timelineDuration) * 100;
    const height = (Math.max(end - start, stepMinutes) / timelineDuration) * 100;

    return {
      id: appointment.id,
      top,
      height,
      start: appointment.startTime,
      end: appointment.endTime,
      title: `${appointment.pet.name} · ${appointment.service.name}`,
      subtitle: `${appointment.owner.fullName}`,
      status: appointment.status,
    };
  });

  const blockTimelineItems = blocks.map((block) => {
    const start = toMinutes(block.startTime);
    const end = toMinutes(block.endTime);
    const top = ((start - timelineStartMinutes) / timelineDuration) * 100;
    const height = (Math.max(end - start, stepMinutes) / timelineDuration) * 100;

    return {
      id: block.id,
      top,
      height,
      start: block.startTime,
      end: block.endTime,
      label: blockTypeLabel[block.type],
      reason: block.reason,
    };
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Що показати в календарі</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-3">
              <select name="doctorId" defaultValue={selectedDoctorId} className="h-10 rounded-lg border border-input px-3">
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
              <input name="date" type="date" defaultValue={selectedDate} className="h-10 rounded-lg border border-input px-3" />
              <select name="serviceId" defaultValue={selectedServiceId} className="h-10 rounded-lg border border-input px-3">
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <div className="md:col-span-3">
                <Button type="submit">Застосувати фільтри</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Додати запис вручну</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAdminAppointmentAction} className="grid gap-4">
              <select name="ownerId" className="h-10 rounded-lg border border-input px-3">
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.fullName}
                  </option>
                ))}
              </select>
              <select name="petId" className="h-10 rounded-lg border border-input px-3">
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} · {pet.owner.fullName}
                  </option>
                ))}
              </select>
              <select name="doctorId" className="h-10 rounded-lg border border-input px-3" defaultValue={selectedDoctorId}>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
              <select name="serviceId" className="h-10 rounded-lg border border-input px-3" defaultValue={selectedServiceId}>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <input name="date" type="date" defaultValue={selectedDate} className="h-10 rounded-lg border border-input px-3" />
              <input name="startTime" type="time" className="h-10 rounded-lg border border-input px-3" />
              <textarea name="comment" placeholder="Коментар адміністратора" className="min-h-24 rounded-lg border border-input px-3 py-2" />
              <Button type="submit">Створити запис</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Закрити час для запису</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createScheduleBlockAction} className="grid gap-4 md:grid-cols-2">
              <select name="doctorId" defaultValue={selectedDoctorId} className="h-10 rounded-lg border border-input px-3">
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
              <input name="date" type="date" defaultValue={selectedDate} className="h-10 rounded-lg border border-input px-3" />
              <input name="startTime" type="time" className="h-10 rounded-lg border border-input px-3" />
              <input name="endTime" type="time" className="h-10 rounded-lg border border-input px-3" />
              <select name="type" defaultValue="MANUAL_BLOCK" className="h-10 rounded-lg border border-input px-3">
                {Object.entries(blockTypeLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input name="reason" placeholder="Причина блокування" className="h-10 rounded-lg border border-input px-3 md:col-span-2" />
              <div className="md:col-span-2">
                <Button type="submit" variant="outline">Створити блок</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Календар на день</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 rounded-3xl border border-border/70 bg-muted/20 p-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Лікар</p>
                <p className="font-medium">
                  {doctors.find((doctor) => doctor.id === selectedDoctorId)?.fullName ?? "Не обрано"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Дата</p>
                <p className="font-medium">{new Date(selectedDate).toLocaleDateString("uk-UA")}</p>
              </div>
              <div>
                  <p className="text-sm text-muted-foreground">Послуга для вільних слотів</p>
                <p className="font-medium">{selectedService?.name ?? "Не обрано"}</p>
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

                    {availableSlots.map((slot) => {
                      const start = toMinutes(slot);
                      const top = ((start - timelineStartMinutes) / timelineDuration) * 100;

                      return (
                        <div
                          key={slot}
                          className="absolute left-3 right-3 rounded-xl border border-emerald-200/70 bg-emerald-100/50 px-3 py-1 text-xs text-emerald-900"
                          style={{ top: `calc(${top}% + 4px)` }}
                        >
                          Вільний слот · {slot}
                        </div>
                      );
                    })}

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
                          {block.start}–{block.end} · {block.label}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-amber-900/80">
                          {block.reason ?? "Слот недоступний для запису"}
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
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {appointment.start}–{appointment.end}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">{appointment.title}</p>
                            <p className="mt-1 text-xs text-slate-600">{appointment.subtitle}</p>
                          </div>
                          <StatusBadge status={appointment.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  На цю дату в лікаря немає активного графіка, тому календар на день не показується.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Записи на {new Date(selectedDate).toLocaleDateString("uk-UA")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointments.length ? appointments.map((appointment) => (
              <details key={appointment.id} className="rounded-2xl border border-border p-4">
                <summary className="cursor-pointer">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{appointment.startTime} · {appointment.pet.name} · {appointment.service.name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.owner.fullName} · {appointment.doctor.fullName}</p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                </summary>
                <div className="mt-4 grid gap-3">
                  <form action={updateAppointmentStatusAction}>
                    <input type="hidden" name="appointmentId" value={appointment.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={appointment.status === "CONFIRMED" ? "COMPLETED" : "CONFIRMED"}
                    />
                    <Button type="submit" variant="ghost" size="sm">
                      {appointment.status === "CONFIRMED" ? "Завершити" : "Підтвердити"}
                    </Button>
                  </form>
                  <form action={updateAppointmentAction} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="appointmentId" value={appointment.id} />
                    <input type="hidden" name="ownerId" value={appointment.ownerId} />
                    <input type="hidden" name="petId" value={appointment.petId} />
                    <select name="doctorId" defaultValue={appointment.doctorId} className="h-10 rounded-lg border border-input px-3">
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.fullName}
                        </option>
                      ))}
                    </select>
                    <select name="serviceId" defaultValue={appointment.serviceId} className="h-10 rounded-lg border border-input px-3">
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                    <input name="date" type="date" defaultValue={appointment.date.toISOString().slice(0, 10)} className="h-10 rounded-lg border border-input px-3" />
                    <input name="startTime" type="time" defaultValue={appointment.startTime} className="h-10 rounded-lg border border-input px-3" />
                    <select name="status" defaultValue={appointment.status} className="h-10 rounded-lg border border-input px-3 md:col-span-2">
                      {["NEW", "PENDING", "CONFIRMED", "RESCHEDULED", "CANCELLED_BY_CLIENT", "CANCELLED_BY_ADMIN", "COMPLETED", "NO_SHOW"].map((status) => (
                        <option key={status} value={status}>
                          {appointmentStatusLabelMap[status]}
                        </option>
                      ))}
                    </select>
                    <textarea
                      name="comment"
                      defaultValue={appointment.comment ?? ""}
                      className="min-h-24 rounded-lg border border-input px-3 py-2 md:col-span-2"
                    />
                    <Button type="submit" className="md:col-span-2">Зберегти зміни</Button>
                  </form>
                </div>
              </details>
            )) : <p className="text-sm text-muted-foreground">На цю дату записів у вибраного лікаря немає.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Який час уже закрито</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {blocks.length ? blocks.map((block) => (
              <details key={block.id} className="rounded-2xl border border-border p-4">
                <summary className="cursor-pointer">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{block.startTime}–{block.endTime} · {blockTypeLabel[block.type]}</p>
                      <p className="text-sm text-muted-foreground">{block.reason ?? "Без причини"}</p>
                    </div>
                  </div>
                </summary>
                <div className="mt-4 grid gap-3">
                  <form action={updateScheduleBlockAction} className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="blockId" value={block.id} />
                    <input type="hidden" name="doctorId" value={block.doctorId} />
                    <input type="hidden" name="date" value={selectedDate} />
                    <input name="startTime" type="time" defaultValue={block.startTime} className="h-10 rounded-lg border border-input px-3" />
                    <input name="endTime" type="time" defaultValue={block.endTime} className="h-10 rounded-lg border border-input px-3" />
                    <select name="type" defaultValue={block.type} className="h-10 rounded-lg border border-input px-3">
                      {Object.entries(blockTypeLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <input name="reason" defaultValue={block.reason ?? ""} className="h-10 rounded-lg border border-input px-3" />
                    <Button type="submit" variant="outline" className="md:col-span-2">Оновити блок</Button>
                  </form>
                  <form action={deleteScheduleBlockAction}>
                    <input type="hidden" name="blockId" value={block.id} />
                    <Button type="submit" variant="ghost" size="sm">Видалити блок</Button>
                  </form>
                </div>
              </details>
            )) : <p className="text-sm text-muted-foreground">На цю дату закритих слотів немає.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
