import Link from "next/link";
import { CalendarDays, FileText, PawPrint, Syringe } from "lucide-react";

import { PetCard } from "@/components/shared/pet-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function CabinetPage() {
  const session = await requireCabinetAccess();
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      pets: {
        include: {
          appointments: {
            where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
          },
          vaccinations: {
            orderBy: { nextDueDate: "asc" },
          },
        },
      },
      appointments: {
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        include: { doctor: true, pet: true },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
    },
  });

  const petIds = ownerProfile?.pets.map((pet) => pet.id) ?? [];
  const [prescriptionsCount, filesCount] = petIds.length
    ? await Promise.all([
        prisma.prescription.count({
          where: { visit: { petId: { in: petIds } } },
        }),
        prisma.labResult.count({
          where: { visit: { petId: { in: petIds } } },
        }),
      ])
    : [0, 0];

  const metrics = [
    { label: "Тварин у профілі", value: String(ownerProfile?.pets.length ?? 0), Icon: PawPrint },
    { label: "Найближчі записи", value: String(ownerProfile?.appointments.length ?? 0), Icon: CalendarDays },
    { label: "Активні призначення", value: String(prescriptionsCount), Icon: Syringe },
    { label: "Нові документи", value: String(filesCount), Icon: FileText },
  ];
  const nextAppointment = ownerProfile?.appointments[0];

  return (
    <div className="grid min-w-0 gap-6">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="min-w-0 border-[#d7e1f2] bg-[#f7f9fc] shadow-[0_20px_44px_-36px_rgba(15,23,42,0.14)]">
          <CardContent className="flex min-w-0 flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-6">
            <div className="min-w-0 max-w-2xl">
              <h2 className="text-[1.85rem] font-semibold tracking-[-0.045em] text-slate-950 md:text-[2.35rem]">
                Всі дані по тваринах, прийомах і документах зібрані в одному місці.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                Користуйся картками нижче, щоб швидко перейти до тварин, найближчих записів або медичних документів після прийому.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 self-start md:self-auto">
              <Link
                href="/booking"
                className={cn(
                  buttonVariants(),
                  "h-12 rounded-full border border-[#2a63f5] bg-[#2f6bff] px-6 text-white shadow-[0_16px_28px_-20px_rgba(47,107,255,0.45)] hover:bg-[#255ae0]",
                )}
              >
                Новий запис
              </Link>
              <Link
                href="/cabinet/pets"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 rounded-full border-[#bfd0ea] bg-white px-6 text-slate-800 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.18)] hover:border-[#9fb7df] hover:bg-white",
                )}
              >
                Мої тварини
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 border-[#8ec8d0] bg-[#e8f6f7] text-slate-950 shadow-[0_24px_48px_-34px_rgba(42,134,146,0.28)] ring-1 ring-[#b8dde2]">
          <CardContent className="space-y-4 p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#517984]">Найближчий запис</p>
            {nextAppointment ? (
              <>
                <p className="text-[2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950">
                  {nextAppointment.date.toLocaleDateString("uk-UA")} · {nextAppointment.startTime}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {nextAppointment.pet.name} · {nextAppointment.doctor.fullName}
                </p>
                <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[#c5e4e8] bg-white px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Статус</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">Ваш найближчий запис</p>
                  </div>
                  <StatusBadge status={nextAppointment.status} />
                </div>
              </>
            ) : (
              <>
                <p className="text-[2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950">Порожній календар</p>
                <p className="text-sm leading-7 text-slate-600">Якщо треба новий прийом, відкрий онлайн-запис і одразу обери доступний слот.</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, Icon }) => (
          <Card key={label} className="min-w-0 border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)] shadow-[0_14px_34px_-30px_rgba(15,23,42,0.18)]">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm leading-6 text-slate-500">{label}</p>
                <p className="mt-1 text-[2rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{value}</p>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[1.1rem] bg-[#eef3ff] text-[#1f57f2]">
                <Icon className="size-[1.15rem]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 gap-6 md:grid-cols-2">
        {ownerProfile?.pets.map((pet) => {
          const nextVaccination = pet.vaccinations.find((vaccination) => vaccination.nextDueDate);

          return (
            <PetCard
              key={pet.id}
              href={`/cabinet/pets/${pet.id}`}
              name={pet.name}
              species={pet.species}
              breed={pet.breed ?? "Без породи"}
              allergies={pet.allergies}
              chronicConditions={pet.chronicConditions}
              nextVaccinationLabel={
                nextVaccination?.nextDueDate
                  ? `Наступна вакцинація: ${nextVaccination.nextDueDate.toLocaleDateString("uk-UA")}`
                  : null
              }
              upcomingAppointmentsCount={pet.appointments.length}
              note="Картка синхронізована з медичною історією, вакцинаціями і документами."
            />
          );
        })}
      </div>
    </div>
  );
}
