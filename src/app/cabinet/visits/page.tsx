import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function CabinetVisitsPage() {
  const session = await requireCabinetAccess();
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
              Тут зберігається вся історія прийомів по ваших тваринах.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Це не просто записи, а вже завершені візити з підсумками, рекомендаціями й документами після огляду.
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
              <div key={visit.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]">
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
                <div className="mt-4 grid gap-3 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-950">Підсумок:</span> {visit.summary ?? "—"}</p>
                  <p><span className="font-medium text-slate-950">Рекомендації:</span> {visit.recommendations ?? "—"}</p>
                  <p>
                    <span className="font-medium text-slate-950">Рахунок:</span>{" "}
                    {visit.invoice ? `${visit.invoice.totalAmount.toString()} грн` : "ще не виставлено"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="Історія прийомів поки порожня"
              description="Після першого завершеного візиту тут з’являться підсумки, рекомендації та додані файли."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
