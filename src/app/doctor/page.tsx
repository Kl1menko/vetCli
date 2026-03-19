import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDoctorAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function DoctorPage() {
  const session = await requireDoctorAccess();
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
    },
  });

  const [plannedAppointments, patientsThisWeek, openVisits, todayAppointments] = doctor
    ? await Promise.all([
        prisma.appointment.count({
          where: {
            doctorId: doctor.id,
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
            status: {
              in: ["PENDING", "CONFIRMED", "RESCHEDULED"],
            },
          },
        }),
        prisma.pet.count({
          where: {
            appointments: {
              some: {
                doctorId: doctor.id,
                date: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                },
              },
            },
          },
        }),
        prisma.visit.count({
          where: {
            doctorId: doctor.id,
            OR: [
              { status: "DRAFT" },
              { status: "IN_PROGRESS" },
            ],
          },
        }),
        prisma.appointment.count({
          where: {
            doctorId: doctor.id,
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(24, 0, 0, 0)),
            },
          },
        }),
      ])
    : [0, 0, 0, 0];

  return (
    <div className="grid gap-6">
      <Card className="border-[#cfe8df] bg-[linear-gradient(135deg,#f4fcfa_0%,#eaf7f3_100%)] shadow-[0_28px_60px_-44px_rgba(18,131,111,0.25)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Усе потрібне для робочого дня зібрано тут: розклад, пацієнти і незавершені записи.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Можна швидко відкрити сьогоднішні прийоми, перейти до картки пацієнта і повернутися до незавершених візитів.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/doctor/schedule" className={cn(buttonVariants(), "rounded-full px-5")}>
              Мій розклад
            </Link>
            <Link href="/doctor/appointments" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
              Усі прийоми
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Прийоми сьогодні", String(todayAppointments)],
          ["Заплановані прийоми", String(plannedAppointments)],
          ["Пацієнти за 7 днів", String(patientsThisWeek)],
          ["Відкриті візити", String(openVisits)],
        ].map(([title, value]) => (
          <Card key={title} className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fcfefd_100%)]">
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
              ["Розклад на сьогодні", "Почніть із розкладу, якщо потрібно швидко оцінити день і чергу прийомів."],
              ["Картки пацієнтів", "Із записів можна одразу відкрити пацієнта або створити візит без зайвих кроків."],
              ["Незавершені візити", "Краще закривати їх того ж дня, щоб клієнт одразу бачив результати у своєму кабінеті."],
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
            <p>Після завершення візиту клієнт одразу бачить історію лікування, призначення, аналізи та рахунок, тому записи мають бути зрозумілими й повними.</p>
            <p>Розділи ліворуч допомагають не губити контекст і швидко перемикатися між розкладом, прийомами та пацієнтами.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
