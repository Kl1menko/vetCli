import Link from "next/link";

import { createVisitFromAppointmentAction } from "@/server/actions/doctor";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDoctorAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

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
              Тут зібрані всі ваші прийоми з швидким переходом до пацієнта або візиту.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Зручно, коли потрібно пройтися по списку прийомів, відкрити картку тварини або почати новий візит.
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
              <div key={appointment.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]">
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
            ))
          ) : (
            <EmptyState
              title="Прийомів поки немає"
              description="Коли в розкладі з’являться записи, їх можна буде відкрити тут разом із переходом до пацієнта та візиту."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
