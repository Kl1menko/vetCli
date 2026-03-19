import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function CabinetPrescriptionsPage() {
  const session = await requireCabinetAccess();
  const prescriptions = await prisma.prescription.findMany({
    where: {
      visit: {
        pet: {
          owner: {
            userId: session.user.id,
          },
        },
      },
    },
    include: {
      visit: {
        include: {
          pet: true,
          appointment: {
            include: {
              doctor: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Тут зібрано все, що лікар призначив після прийому.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Зручно перевірити ліки, дозування і рекомендації для кожної тварини без пошуку по візитах.
            </p>
          </div>
          <Link href="/cabinet/visits" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
            До візитів
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Призначення</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {prescriptions.length ? (
            prescriptions.map((prescription) => (
              <div key={prescription.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]">
                <p className="text-lg font-semibold text-slate-950">{prescription.medicationName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {prescription.visit.pet.name} · {prescription.visit.appointment.doctor.fullName}
                </p>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <p>Дозування: {prescription.dosage ?? "—"}</p>
                  <p>Частота: {prescription.frequency ?? "—"}</p>
                  <p>Тривалість: {prescription.duration ?? "—"}</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-500">{prescription.instructions ?? "Інструкції відсутні."}</p>
              </div>
            ))
          ) : (
            <EmptyState
              title="Поки що нічого не призначено"
              description="Коли лікар додасть лікування або рекомендації, вони з’являться тут."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
