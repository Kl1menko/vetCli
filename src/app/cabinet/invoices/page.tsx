import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { markCabinetNotificationsAsRead } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const paymentStatusLabel = {
  UNPAID: "Не оплачено",
  PARTIALLY_PAID: "Оплачено частково",
  PAID: "Оплачено",
  CANCELLED: "Скасовано",
} as const;

export default async function CabinetInvoicesPage() {
  const session = await requireCabinetAccess();
  await markCabinetNotificationsAsRead(session.user.id, "invoices");
  const invoices = await prisma.invoice.findMany({
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
              service: true,
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
              Тут зібрані чеки й інформація про оплату після прийомів.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Можна швидко подивитися, що вже оплачено, а що ще очікує оплату.
            </p>
          </div>
          <Link href="/cabinet/visits" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
            До візитів
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Оплати й чеки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoices.length ? (
            invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{invoice.visit.pet.name} · {invoice.totalAmount.toString()} грн</p>
                    <p className="text-sm text-slate-500">
                      {invoice.visit.appointment.service.name} · {invoice.visit.appointment.doctor.fullName}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{paymentStatusLabel[invoice.paymentStatus]}</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-500">{invoice.note ?? "Без коментаря до рахунку."}</p>
                {invoice.fileUrl ? (
                  <a href={invoice.fileUrl} className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
                    Відкрити файл рахунку
                  </a>
                ) : null}
              </div>
            ))
          ) : (
            <EmptyState
              title="Чеків поки немає"
              description="Коли після візиту з’явиться рахунок або чек, він буде доступний тут."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
