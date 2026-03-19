import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/auth/access";
import { cn } from "@/lib/utils";

export default async function AdminPage() {
  await requireAdminAccess();

  const [appointmentsToday, pendingAppointments, activeDoctors, upcomingBlocks] = await Promise.all([
    prisma.appointment.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
    }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.scheduleBlock.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return (
    <div className="grid gap-6">
      <Card className="border-[#f5d8a8] bg-[linear-gradient(135deg,#fff8ed_0%,#fff3df_100%)] shadow-[0_28px_60px_-44px_rgba(217,119,6,0.28)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Тут видно все важливе по роботі клініки на сьогодні.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Можна швидко відкрити календар, підтвердити нові записи і перевірити завантаження лікарів.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/calendar" className={cn(buttonVariants(), "rounded-full px-5")}>
              Відкрити календар
            </Link>
            <Link href="/admin/appointments" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
              Усі записи
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Сьогоднішні прийоми", String(appointmentsToday)],
          ["Очікують підтвердження", String(pendingAppointments)],
          ["Активні лікарі", String(activeDoctors)],
          ["Блоки часу", String(upcomingBlocks)],
        ].map(([title, value]) => (
          <Card key={title} className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfd_100%)]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">{value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle>З чого почати</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Нові записи", "Зайдіть у записи, якщо потрібно швидко обробити нові або перенесені прийоми."],
              ["Графік лікарів", "Календар і блокування часу краще тримати в актуальному стані щодня."],
              ["База клініки", "Клієнти, тварини, лікарі й послуги розкладені по окремих розділах, щоб було простіше працювати."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-slate-950 text-white">
          <CardHeader>
            <CardTitle className="text-white">Що важливо сьогодні</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-white/72">
            <p>Нові записи, які ще чекають підтвердження, краще переглядати в першу чергу. Так клієнт швидше отримує відповідь і не лишається в невизначеності.</p>
            <p>Зміни в розкладі лікарів і перерви в календарі краще вносити до початку робочого дня, щоб уникнути плутанини із записами.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
