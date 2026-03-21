import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const paymentStatusLabelMap = {
  UNPAID: "Не оплачено",
  PARTIALLY_PAID: "Частково оплачено",
  PAID: "Оплачено",
  CANCELLED: "Скасовано",
} as const;

function PaymentStatusBadge({ status }: { status: keyof typeof paymentStatusLabelMap }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent",
        status === "UNPAID" && "bg-rose-100 text-rose-900",
        status === "PARTIALLY_PAID" && "bg-amber-100 text-amber-900",
        status === "PAID" && "bg-emerald-100 text-emerald-900",
        status === "CANCELLED" && "bg-slate-200 text-slate-800",
      )}
    >
      {paymentStatusLabelMap[status]}
    </Badge>
  );
}

function formatCurrency(value: { toString(): string }) {
  return `${value.toString()} грн`;
}

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdminAccess();
  const { q, status } = await searchParams;
  const query = q?.trim() ?? "";
  const selectedStatus = status ?? "";

  const where = {
    ...(selectedStatus in paymentStatusLabelMap
      ? { paymentStatus: selectedStatus as keyof typeof paymentStatusLabelMap }
      : {}),
    ...(query
      ? {
          OR: [
            { visit: { pet: { name: { contains: query, mode: "insensitive" as const } } } },
            { visit: { pet: { owner: { fullName: { contains: query, mode: "insensitive" as const } } } } },
            { visit: { doctor: { fullName: { contains: query, mode: "insensitive" as const } } } },
            { visit: { appointment: { service: { name: { contains: query, mode: "insensitive" as const } } } } },
          ],
        }
      : {}),
  };

  const [invoices, totalCount, unpaidCount, paidCount, partialCount, cancelledCount] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: {
        visit: {
          include: {
            doctor: true,
            pet: {
              include: {
                owner: true,
              },
            },
            appointment: {
              include: {
                service: true,
              },
            },
          },
        },
      },
      take: 50,
    }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { paymentStatus: "UNPAID" } }),
    prisma.invoice.count({ where: { paymentStatus: "PAID" } }),
    prisma.invoice.count({ where: { paymentStatus: "PARTIALLY_PAID" } }),
    prisma.invoice.count({ where: { paymentStatus: "CANCELLED" } }),
  ]);

  return (
    <div className="grid gap-6">
      <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Усі рахунки і статуси оплати в одному місці.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Можна швидко перевірити, кому вже виставлено рахунок, що оплачено, а де ще потрібна увага.
            </p>
          </div>
          <Link
            href="/admin/visits"
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            До візитів
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Усі рахунки", String(totalCount)],
          ["Не оплачено", String(unpaidCount)],
          ["Частково", String(partialCount)],
          ["Оплачено", String(paidCount)],
          ["Скасовано", String(cancelledCount)],
        ].map(([title, value]) => (
          <Card key={title} className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold tracking-[-0.05em] text-slate-950">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Пошук і фільтри</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
            <input
              name="q"
              defaultValue={query}
              placeholder="Пошук за твариною, клієнтом, лікарем або послугою"
              className="h-10 rounded-lg border border-input px-3"
            />
            <select name="status" defaultValue={selectedStatus} className="h-10 rounded-lg border border-input px-3">
              <option value="">Усі статуси оплати</option>
              {Object.entries(paymentStatusLabelMap).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Застосувати
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Список рахунків</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoices.length ? (
            invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-slate-950">
                        {invoice.visit.pet.name} · {invoice.visit.appointment.service.name}
                      </p>
                      <PaymentStatusBadge status={invoice.paymentStatus} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {invoice.visit.pet.owner.fullName} · {invoice.visit.doctor.fullName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {invoice.visit.appointment.date.toLocaleDateString("uk-UA")} · {invoice.visit.appointment.startTime}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-[#eef4ff] px-3 py-1 font-medium text-[#315fc9]">
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                        Створено {invoice.createdAt.toLocaleDateString("uk-UA")}
                      </span>
                      {invoice.updatedAt.getTime() !== invoice.createdAt.getTime() ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                          Оновлено {invoice.updatedAt.toLocaleDateString("uk-UA")}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/visits`}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Перейти до візиту
                    </Link>
                    {invoice.fileUrl ? (
                      <a
                        href={invoice.fileUrl}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[#d9e4ff] bg-[#f7fbff] px-4 text-sm font-medium text-[#315fc9] hover:bg-[#eef4ff]"
                      >
                        Відкрити файл
                      </a>
                    ) : null}
                  </div>
                </div>

                {invoice.note ? (
                  <div className="mt-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Нотатка</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{invoice.note}</p>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <EmptyState
              title="Рахунків поки немає"
              description="Коли лікарі створять рахунки після візитів, вони з’являться тут."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
