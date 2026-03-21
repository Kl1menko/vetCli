import Link from "next/link";

import { AddPetDialog } from "@/components/forms/add-pet-dialog";
import { EditPetDialog } from "@/components/forms/edit-pet-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PetCard } from "@/components/shared/pet-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { isUpcomingAppointment } from "@/lib/appointments";
import { requireCabinetAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { createCabinetPetAction, deleteCabinetPetFormAction, updateCabinetPetAction } from "@/server/actions/cabinet";
import { cn } from "@/lib/utils";

export default async function CabinetPetsPage() {
  const session = await requireCabinetAccess();
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      pets: {
        where: { isArchived: false },
        include: {
          appointments: {
            where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
          },
          vaccinations: {
            orderBy: { nextDueDate: "asc" },
          },
          _count: {
            select: {
              visits: true,
              appointments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  const now = new Date();

  return (
    <div className="grid gap-6">
      <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[2rem] leading-tight font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.35rem]">
              Окремі картки для кожної тварини.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Додавайте тварин, перевіряйте щеплення і відкривайте картку.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <AddPetDialog action={createCabinetPetAction} />
            <Link
              href="/booking"
              className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-full px-5 sm:w-auto")}
            >
              Онлайн-запис
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {ownerProfile?.pets.map((pet) => {
          const nextVaccination = pet.vaccinations.find((vaccination) => vaccination.nextDueDate);

          return (
            <PetCard
              key={pet.id}
              href={`/cabinet/pets/${pet.id}`}
              headerActions={
                <EditPetDialog
                  pet={pet}
                  updateAction={updateCabinetPetAction}
                  deleteAction={deleteCabinetPetFormAction}
                />
              }
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
              upcomingAppointmentsCount={
                pet.appointments.filter((appointment) =>
                  isUpcomingAppointment({
                    date: appointment.date,
                    startTime: appointment.startTime,
                    status: appointment.status,
                    now,
                  }),
                ).length
              }
              note={`Візитів у картці: ${pet._count.visits}. Усього записів: ${pet._count.appointments}.`}
            />
          );
        })}
      </div>

      {!ownerProfile?.pets.length ? (
        <Card className="border-slate-200/80 bg-slate-50">
          <CardContent className="p-6">
            <EmptyState
              title="Тварин ще немає"
              description="Додайте першу тварину, щоб створювати записи і переглядати історію."
              className="min-h-32"
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
