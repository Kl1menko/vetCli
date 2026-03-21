import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { VisitDischargeCard } from "@/components/shared/visit-discharge-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { markCabinetNotificationsAsRead } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function CabinetVisitsPage() {
  const session = await requireCabinetAccess();
  await markCabinetNotificationsAsRead(session.user.id, "visits");
  const visits = await prisma.visit.findMany({
    where: {
      pet: {
        owner: {
          userId: session.user.id,
        },
      },
    },
    include: {
      pet: true,
      appointment: {
        include: {
          doctor: true,
          service: true,
        },
      },
      diagnoses: true,
      prescriptions: true,
      labResults: true,
      attachments: true,
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Історія завершених візитів.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Підсумки, рекомендації і документи після прийому.
            </p>
          </div>
          <Link href="/cabinet/lab-results" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
            Аналізи і файли
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Що було на прийомах</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {visits.length ? (
            visits.map((visit) => (
              <details key={visit.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]">
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">
                        {visit.pet.name} · {visit.appointment.date.toLocaleDateString("uk-UA")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {visit.appointment.service.name} · {visit.appointment.doctor.fullName}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">
                      Діагнозів: {visit.diagnoses.length} · Аналізів: {visit.labResults.length}
                    </p>
                  </div>
                </summary>
                <VisitDischargeCard visit={visit} className="mt-5 border-slate-200 shadow-none ring-0" />
              </details>
            ))
          ) : (
            <EmptyState
              title="Візитів поки немає"
              description="Після першого завершеного візиту тут з’явиться виписка."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
