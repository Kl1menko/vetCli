import Link from "next/link";

import { CabinetProfileForm } from "@/components/forms/cabinet-profile-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { updateCabinetProfileAction } from "@/server/actions/cabinet";
import { cn } from "@/lib/utils";

export default async function CabinetProfilePage() {
  const session = await requireCabinetAccess();
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="grid gap-6">
      <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Ваші контактні дані для записів і зв’язку з клінікою.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Саме ці дані підтягуються у записи, картки тварин і повідомлення від клініки.
            </p>
          </div>
          <Link href="/cabinet/appointments" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
            До записів
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["ПІБ", ownerProfile?.fullName ?? "—"],
          ["Телефон", ownerProfile?.phone ?? session.user.phone ?? "—"],
          ["Email", ownerProfile?.email ?? session.user.email ?? "—"],
          ["Адреса", ownerProfile?.address ?? "—"],
        ].map(([label, value]) => (
          <Card key={label} className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)] shadow-[0_14px_34px_-32px_rgba(15,23,42,0.16)]">
            <CardContent className="p-5 md:p-6">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-[1.55rem] font-semibold leading-tight tracking-[-0.03em] text-slate-950 md:text-[1.75rem]">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <details className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.16)]">
        <summary
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-fit cursor-pointer rounded-full px-5 text-slate-800 marker:hidden hover:bg-white",
          )}
        >
          Редагувати профіль
        </summary>
        <div className="mt-5 border-t border-slate-100 pt-5">
          <CabinetProfileForm
            action={updateCabinetProfileAction}
            profile={{
              fullName: ownerProfile?.fullName ?? session.user.name ?? "",
              phone: ownerProfile?.phone ?? session.user.phone ?? null,
              email: ownerProfile?.email ?? session.user.email ?? null,
              address: ownerProfile?.address ?? null,
              notes: ownerProfile?.notes ?? null,
            }}
          />
        </div>
      </details>

      <Card className="border-slate-200/80 bg-slate-50">
        <CardHeader>
          <CardTitle>Важливо знати</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-7 text-slate-600">
          <p>Після збереження нові дані одразу використовуються в записах, профілі власника і картках тварин.</p>
          <p>Саме цей профіль використовується для записів на прийом і прив’язки тварин до власника.</p>
        </CardContent>
      </Card>
    </div>
  );
}
