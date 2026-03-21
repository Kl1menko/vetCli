import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PrescriptionDetailsCard } from "@/components/shared/prescription-details-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { markCabinetNotificationsAsRead } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function CabinetPrescriptionsPage() {
  const session = await requireCabinetAccess();
  await markCabinetNotificationsAsRead(session.user.id, "prescriptions");
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
              Усі призначення після прийомів.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Ліки, дозування і рекомендації по кожній тварині.
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
              <PrescriptionDetailsCard
                key={prescription.id}
                prescription={prescription}
                className="shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]"
                headerSuffix={
                  <div className="text-right text-sm text-slate-500">
                    <p>{prescription.visit.pet.name}</p>
                    <p>{prescription.visit.appointment.doctor.fullName}</p>
                  </div>
                }
              />
            ))
          ) : (
            <EmptyState
              title="Призначень поки немає"
              description="Нові призначення з’являться тут."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
