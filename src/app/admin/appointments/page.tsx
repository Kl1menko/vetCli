import { Fragment } from "react";

import Link from "next/link";

import {
  deleteAppointmentAction,
  updateAppointmentAction,
  updateAppointmentStatusAction,
} from "@/server/actions/admin";
import { EmptyState } from "@/components/shared/empty-state";
import { appointmentStatusLabelMap, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdminAccess } from "@/lib/auth/access";
import { getAdminEditableAppointmentStatuses, isTerminalAppointmentStatus } from "@/lib/appointments";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ doctorId?: string; date?: string }>;
}) {
  await requireAdminAccess();
  const { doctorId, date } = await searchParams;
  const selectedDate = date ?? "";

  const [owners, pets, doctors, services] = await Promise.all([
    prisma.ownerProfile.findMany({ orderBy: { fullName: "asc" } }),
    prisma.pet.findMany({ where: { isArchived: false }, orderBy: { name: "asc" }, include: { owner: true } }),
    prisma.doctor.findMany({ orderBy: { fullName: "asc" } }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
  ]);
  const selectedDoctorId = doctorId ?? "";
  const appointments = await prisma.appointment.findMany({
    where: {
      ...(selectedDoctorId ? { doctorId: selectedDoctorId } : {}),
      ...(selectedDate ? { date: new Date(selectedDate) } : {}),
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
    include: {
      owner: true,
      pet: true,
      doctor: true,
      service: true,
      visit: true,
    },
    take: 50,
  });

  return (
    <div className="grid gap-6">
      <Card className="border-[#f5d8a8] bg-[linear-gradient(135deg,#fff8ed_0%,#fff3df_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Усі записи клініки.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Фільтр, підтвердження і редагування в одному місці.
            </p>
          </div>
          <Link href="/admin/calendar" className={cn("inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50")}>
            Календар на день
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Робота із записами</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="mb-6 grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <select name="doctorId" defaultValue={selectedDoctorId} className="h-10 rounded-lg border border-input px-3">
              <option value="">Усі лікарі</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
            <input name="date" type="date" defaultValue={selectedDate} className="h-10 rounded-lg border border-input px-3" />
            <Button type="submit">Фільтрувати</Button>
          </form>
          {appointments.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Клієнт</TableHead>
                  <TableHead>Тварина</TableHead>
                  <TableHead>Лікар</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дії та редагування</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => {
                  const canConfirm = ["NEW", "PENDING", "RESCHEDULED"].includes(appointment.status);
                  const canCancel =
                    !appointment.visit &&
                    !isTerminalAppointmentStatus(appointment.status) &&
                    appointment.status !== "COMPLETED";

                  return (
                    <Fragment key={appointment.id}>
                      <TableRow>
                        <TableCell>{appointment.date.toLocaleDateString("uk-UA")} · {appointment.startTime}</TableCell>
                        <TableCell>{appointment.owner.fullName}</TableCell>
                        <TableCell>{appointment.pet.name}</TableCell>
                        <TableCell>{appointment.doctor.fullName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-2">
                            <StatusBadge status={appointment.status} />
                            {canConfirm ? (
                              <form action={updateAppointmentStatusAction}>
                                <input type="hidden" name="appointmentId" value={appointment.id} />
                                <input type="hidden" name="status" value="CONFIRMED" />
                                <Button
                                  type="submit"
                                  size="sm"
                                  className="rounded-full bg-slate-950 px-4 text-white shadow-[0_14px_30px_-18px_rgba(15,23,42,0.8)] hover:bg-slate-800"
                                >
                                  Підтвердити запис
                                </Button>
                              </form>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="flex flex-wrap items-center gap-2">
                            {canCancel ? (
                              <form action={deleteAppointmentAction}>
                                <input type="hidden" name="appointmentId" value={appointment.id} />
                                <Button type="submit" variant="outline" size="sm">
                                  Скасувати
                                </Button>
                              </form>
                            ) : (
                              <span className="text-sm text-slate-500">
                                {appointment.status.includes("CANCELLED")
                                  ? "Запис уже скасовано"
                                  : appointment.visit
                                    ? "Є пов’язаний візит"
                                    : "Дія недоступна"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="whitespace-normal pt-0">
                          <details className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 p-4">
                            <summary className="cursor-pointer list-none font-medium text-slate-900">
                              Редагувати цей запис: {appointment.owner.fullName} · {appointment.pet.name}
                            </summary>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              Усі зміни для цього запису.
                            </p>
                            <form action={updateAppointmentAction} className="mt-4 grid gap-3 md:grid-cols-2">
                              <input type="hidden" name="appointmentId" value={appointment.id} />
                              <select name="ownerId" defaultValue={appointment.ownerId} className="h-10 rounded-lg border border-input bg-white px-3">
                                {owners.map((owner) => (
                                  <option key={owner.id} value={owner.id}>
                                    {owner.fullName}
                                  </option>
                                ))}
                              </select>
                              <select name="petId" defaultValue={appointment.petId} className="h-10 rounded-lg border border-input bg-white px-3">
                                {pets.map((pet) => (
                                  <option key={pet.id} value={pet.id}>
                                    {pet.name} · {pet.owner.fullName}
                                  </option>
                                ))}
                              </select>
                              <select name="doctorId" defaultValue={appointment.doctorId} className="h-10 rounded-lg border border-input bg-white px-3">
                                {doctors.map((doctor) => (
                                  <option key={doctor.id} value={doctor.id}>
                                    {doctor.fullName}
                                  </option>
                                ))}
                              </select>
                              <select name="serviceId" defaultValue={appointment.serviceId} className="h-10 rounded-lg border border-input bg-white px-3">
                                {services.map((service) => (
                                  <option key={service.id} value={service.id}>
                                    {service.name}
                                  </option>
                                ))}
                              </select>
                              <input
                                name="date"
                                type="date"
                                defaultValue={appointment.date.toISOString().slice(0, 10)}
                                className="h-10 rounded-lg border border-input bg-white px-3"
                              />
                              <input
                                name="startTime"
                                type="time"
                                defaultValue={appointment.startTime}
                                className="h-10 rounded-lg border border-input bg-white px-3"
                              />
                              <select
                                name="status"
                                defaultValue={appointment.status}
                                className="h-10 rounded-lg border border-input bg-white px-3 md:col-span-2"
                              >
                                {getAdminEditableAppointmentStatuses(appointment.status).map((status) => (
                                  <option key={status} value={status}>
                                    {appointmentStatusLabelMap[status]}
                                  </option>
                                ))}
                              </select>
                              <textarea
                                name="comment"
                                defaultValue={appointment.comment ?? ""}
                                className="min-h-24 rounded-lg border border-input bg-white px-3 py-2 md:col-span-2"
                              />
                              <Button type="submit" className="md:col-span-2">
                                Зберегти зміни
                              </Button>
                            </form>
                          </details>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Нічого не знайдено"
                description="Спробуйте змінити дату або лікаря, щоб побачити інші записи."
                className="min-h-32"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
