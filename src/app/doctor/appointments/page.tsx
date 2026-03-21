import Link from "next/link";

import { ActionButtonForm } from "@/components/forms/action-button-form";
import { createVisitFromAppointmentFormAction } from "@/server/actions/doctor";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDoctorAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

function VisitFlowBadge({
  visit,
}: {
  visit:
    | {
        status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";
      }
    | null
    | undefined;
}) {
  if (!visit) {
    return null;
  }

  if (visit.status === "COMPLETED") {
    return (
      <Badge variant="secondary" className="border-transparent bg-slate-200 text-slate-800">
        Візит закрито
      </Badge>
    );
  }

  if (visit.status === "DRAFT") {
    return (
      <Badge variant="secondary" className="border-transparent bg-[#e7efff] text-[#214fbd]">
        Новий візит
      </Badge>
    );
  }

  if (visit.status === "IN_PROGRESS") {
    return (
      <Badge variant="secondary" className="border-transparent bg-amber-100 text-amber-900">
        У роботі
      </Badge>
    );
  }
  return null;
}

export default async function DoctorAppointmentsPage() {
  const session = await requireDoctorAccess();
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        include: { owner: true, pet: true, service: true, visit: true },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
      },
    },
  });

  return (
    <div className="grid gap-6">
      <Card className="border-[#cfe8df] bg-[linear-gradient(135deg,#f4fcfa_0%,#eaf7f3_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Усі прийоми за списком.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Швидкий перехід до пацієнта або візиту.
            </p>
          </div>
          <Link href="/doctor/schedule" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
            День у календарі
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Усі прийоми</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {doctor?.appointments.length ? (
            doctor.appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={cn(
                  "rounded-[1.5rem] border p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]",
                  appointment.status.includes("CANCELLED")
                    ? "border-rose-200/80 bg-rose-50/60"
                    : "border-slate-200/80 bg-white",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">
                      {appointment.date.toLocaleDateString("uk-UA")} · {appointment.startTime} · {appointment.pet.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {appointment.service.name} · {appointment.owner.fullName}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/doctor/patients/${appointment.pet.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                        Відкрити пацієнта
                      </Link>
                      {appointment.visit ? (
                        <Link href={`/doctor/visits/${appointment.visit.id}`} className={cn(buttonVariants({ size: "sm" }))}>
                          Відкрити візит
                        </Link>
                      ) : ["CONFIRMED", "RESCHEDULED"].includes(appointment.status) ? (
                        <ActionButtonForm
                          action={createVisitFromAppointmentFormAction}
                          fields={[{ name: "appointmentId", value: appointment.id }]}
                          submitLabel="Створити візит"
                          pendingLabel="Створюю…"
                          size="sm"
                          buttonClassName={cn(buttonVariants({ size: "sm" }))}
                          successTitle="Візит створено"
                          errorTitle="Не вдалося створити візит"
                        />
                      ) : (
                        <div className="flex items-center rounded-full bg-slate-100 px-3 text-sm text-slate-600">
                          {appointment.status.includes("CANCELLED")
                            ? "Прийом скасовано, новий візит не створюється"
                            : appointment.status === "COMPLETED"
                              ? "Прийом уже завершено"
                              : "Візит стане доступний після підтвердження"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {appointment.visit ? <VisitFlowBadge visit={appointment.visit} /> : null}
                    <StatusBadge status={appointment.status} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="Прийомів поки немає"
              description="Нові прийоми з’являться тут."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
