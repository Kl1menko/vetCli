import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { clinicProfile } from "@/constants/site";

export default async function AdminSettingsPage() {
  await requireAdminAccess();

  const [activeDoctors, schedules, activeServices, onlineBookableServices, todayAppointments, todayPending, unpaidInvoices] =
    await Promise.all([
      prisma.doctor.findMany({
        where: { isActive: true },
        orderBy: { fullName: "asc" },
        select: { id: true, fullName: true, specialization: true },
      }),
      prisma.doctorSchedule.findMany({
        where: { isActive: true },
        select: { doctorId: true, weekday: true },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, isOnlineBookable: true, durationMinutes: true },
      }),
      prisma.service.count({
        where: { isActive: true, isOnlineBookable: true },
      }),
      prisma.appointment.count({
        where: { date: new Date(new Date().toISOString().slice(0, 10)) },
      }),
      prisma.appointment.count({
        where: { date: new Date(new Date().toISOString().slice(0, 10)), status: "PENDING" },
      }),
      prisma.invoice.count({
        where: { paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] } },
      }),
    ]);

  const weeklyScheduleCoverage = new Map<string, number>();
  for (const schedule of schedules) {
    weeklyScheduleCoverage.set(schedule.doctorId, (weeklyScheduleCoverage.get(schedule.doctorId) ?? 0) + 1);
  }

  const doctorsWithoutSchedule = activeDoctors.filter((doctor) => !weeklyScheduleCoverage.has(doctor.id));
  const doctorsWithPartialSchedule = activeDoctors.filter((doctor) => {
    const days = weeklyScheduleCoverage.get(doctor.id) ?? 0;
    return days > 0 && days < 5;
  });
  const offlineServices = activeServices.filter((service) => !service.isOnlineBookable);

  return (
    <div className="grid gap-6">
      <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Операційний центр налаштувань клініки.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Тут видно, чи готова клініка до онлайн-запису: контакти, графіки лікарів, доступні послуги і поточні ризики.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/doctors"
              className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Лікарі
            </Link>
            <Link
              href="/admin/services"
              className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Послуги
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Активні лікарі", String(activeDoctors.length)],
          ["Онлайн-послуги", String(onlineBookableServices)],
          ["Записи на сьогодні", String(todayAppointments)],
          ["Неоплачені рахунки", String(unpaidInvoices)],
        ].map(([title, value]) => (
          <Card key={title} className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">{value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
          <CardHeader>
            <CardTitle>Контакти і режим роботи</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              ["Назва клініки", clinicProfile.name],
              ["Місто", clinicProfile.city],
              ["Адреса", clinicProfile.address],
              ["Телефон", clinicProfile.phone],
              ["Email", clinicProfile.email],
              ["Години роботи", clinicProfile.hours],
              ["Вихідний", clinicProfile.closedDay],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
              </div>
            ))}
            <p className="text-sm leading-6 text-slate-500">
              Публічні контакти зараз беруться з конфігурації сайту. Якщо потрібно зробити їх редагованими прямо з адмінки,
              наступним кроком варто винести їх у БД.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
            <CardHeader>
              <CardTitle>Що потребує уваги</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">Очікують підтвердження сьогодні</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">{todayPending}</p>
                <Link href="/admin/calendar" className="mt-3 inline-flex text-sm font-medium text-[#315fc9] hover:underline">
                  Відкрити календар
                </Link>
              </div>

              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">Лікарі без жодного графіка</p>
                {doctorsWithoutSchedule.length ? (
                  <div className="mt-3 space-y-2">
                    {doctorsWithoutSchedule.map((doctor) => (
                      <div key={doctor.id} className="rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-sm font-medium text-slate-900">{doctor.fullName}</p>
                        <p className="text-xs text-slate-500">{doctor.specialization}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-emerald-700">Усі активні лікарі мають хоча б один день у графіку.</p>
                )}
              </div>

              <div className="rounded-[1rem] border border-slate-200 bg-white px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">Лікарі з неповним тижневим графіком</p>
                {doctorsWithPartialSchedule.length ? (
                  <div className="mt-3 space-y-2">
                    {doctorsWithPartialSchedule.map((doctor) => (
                      <div key={doctor.id} className="rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-sm font-medium text-slate-900">{doctor.fullName}</p>
                        <p className="text-xs text-slate-500">
                          Активних днів: {weeklyScheduleCoverage.get(doctor.id) ?? 0}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-emerald-700">Неповних графіків не виявлено.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
            <CardHeader>
              <CardTitle>Онлайн-запис по послугах</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {offlineServices.length ? (
                offlineServices.map((service) => (
                  <div key={service.id} className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
                    <p className="font-medium text-slate-950">{service.name}</p>
                    <p className="text-sm text-slate-500">{service.durationMinutes} хв · недоступна онлайн</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Усі активні послуги відкриті для онлайн-запису"
                  description="Якщо потрібно обмежити запис на окремі послуги, це можна змінити на сторінці послуг."
                />
              )}
              <Link href="/admin/services" className="inline-flex text-sm font-medium text-[#315fc9] hover:underline">
                Перейти до керування послугами
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
