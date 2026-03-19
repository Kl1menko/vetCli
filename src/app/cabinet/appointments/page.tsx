import Link from "next/link";

import { AppointmentRescheduleForm } from "@/components/forms/appointment-reschedule-form";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cancelAppointmentAction, rescheduleAppointmentAction } from "@/server/actions/appointments";
import { cn } from "@/lib/utils";

export default async function CabinetAppointmentsPage() {
  const session = await requireCabinetAccess();
  const [ownerProfile, doctors] = await Promise.all([
    prisma.ownerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        appointments: {
          include: { doctor: true, pet: true, service: true },
          orderBy: [{ date: "desc" }, { startTime: "desc" }],
        },
      },
    }),
    prisma.doctor.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, specialization: true },
    }),
  ]);
  const now = new Date();
  const upcomingAppointments = ownerProfile?.appointments.filter((appointment) => appointment.date >= now && !appointment.status.includes("CANCELLED")) ?? [];
  const previousAppointments = ownerProfile?.appointments.filter((appointment) => appointment.date < now) ?? [];

  return (
    <div className="grid gap-6">
      <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Тут видно ваші найближчі записи і все, що було раніше.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Можна швидко перевірити дату, перенести візит або скасувати його без дзвінка в клініку.
            </p>
          </div>
          <Link href="/booking" className={cn(buttonVariants(), "rounded-full px-5")}>
            Новий запис
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Що заплановано далі</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingAppointments.length ? (
            upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_22px_46px_-36px_rgba(15,23,42,0.24)] md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[1.45rem] font-semibold tracking-[-0.04em] text-slate-950">
                        {appointment.date.toLocaleDateString("uk-UA")} · {appointment.startTime}
                      </p>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-medium text-[#315fc9]">
                        {appointment.pet.name}
                      </span>
                      <span className="rounded-full bg-[#f4f7fb] px-3 py-1 text-sm text-slate-600">
                        {appointment.service.name}
                      </span>
                      <span className="rounded-full bg-[#f4f7fb] px-3 py-1 text-sm text-slate-600">
                        {appointment.doctor.fullName}
                      </span>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-slate-500">
                      {appointment.comment ?? "Додаткового коментаря до запису немає."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                  {appointment.status !== "COMPLETED" ? (
                    <form action={cancelAppointmentAction}>
                      <input type="hidden" name="appointmentId" value={appointment.id} />
                      <Button
                        type="submit"
                        size="sm"
                        className="rounded-full border border-[#ef4444] bg-[#ef4444] px-4 text-white hover:bg-[#dc2626]"
                      >
                        Скасувати запис
                      </Button>
                    </form>
                  ) : null}
                </div>
                {appointment.status !== "COMPLETED" ? (
                  <div className="mt-5">
                    <AppointmentRescheduleForm
                      appointment={appointment}
                      doctors={doctors}
                      action={rescheduleAppointmentAction}
                    />
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <EmptyState title="Поки що нічого не заплановано" description="Коли з’явиться новий запис, він одразу з’явиться тут." />
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <CardHeader>
          <CardTitle>Що було раніше</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {previousAppointments.length ? (
            previousAppointments.map((appointment) => (
              <div key={appointment.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-950">
                      {appointment.date.toLocaleDateString("uk-UA")} · {appointment.startTime}
                    </p>
                    <p className="text-sm text-slate-500">
                      {appointment.pet.name} · {appointment.service.name} · {appointment.doctor.fullName}
                    </p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="Історія ще порожня" description="Тут будуть зберігатися завершені, минулі та перенесені записи." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
