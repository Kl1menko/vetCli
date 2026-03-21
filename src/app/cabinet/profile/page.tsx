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
              Контактні дані для записів і зв’язку.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Ці дані використовуються в записах і картках тварин.
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
          <Card key={label} className="border-[#d7e0ea] bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f8_100%)] shadow-[0_14px_34px_-32px_rgba(15,23,42,0.12)]">
            <CardContent className="p-4 md:p-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</p>
              <p className="mt-1.5 text-lg font-semibold leading-snug tracking-[-0.03em] text-slate-950 md:text-xl">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <details className="rounded-[1.75rem] border border-[#d7e0ea] bg-[linear-gradient(180deg,#f9fbfd_0%,#f2f6fa_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.12)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-950">Редагування профілю</p>
            <p className="mt-1 text-sm text-slate-500">Оновіть контакти і нотатки.</p>
          </div>
          <span
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 shrink-0 rounded-full px-5 text-slate-800 marker:hidden hover:bg-white",
            )}
          >
            Редагувати
          </span>
        </summary>
        <div className="mt-4 border-t border-slate-200 pt-4">
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

      <Card className="border-[#d4ddea] bg-[linear-gradient(135deg,#edf4ff_0%,#e4edf9_100%)] shadow-[0_16px_36px_-32px_rgba(31,87,242,0.18)]">
        <CardHeader className="pb-3">
          <CardTitle>Важливо знати</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-7 text-slate-700">
          <p>Після збереження дані оновлюються у записах і картках тварин.</p>
          <p>Цей профіль використовується для записів і привʼязки тварин.</p>
        </CardContent>
      </Card>
    </div>
  );
}
