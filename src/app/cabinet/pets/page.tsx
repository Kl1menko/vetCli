import Link from "next/link";

import { PetForm } from "@/components/forms/pet-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PetCard } from "@/components/shared/pet-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { createCabinetPetAction, deleteCabinetPetAction, updateCabinetPetAction } from "@/server/actions/cabinet";
import { cn } from "@/lib/utils";

export default async function CabinetPetsPage() {
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

  return (
    <div className="grid gap-6">
      <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Окремі картки для кожної тварини, щоб нічого не змішувалося.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Тут можна додати нову тварину, перевірити щеплення і відкрити її картку з історією та записами.
            </p>
          </div>
          <Link href="/booking" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
            Онлайн-запис
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Додати тварину</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm action={createCabinetPetAction} mode="create" submitLabel="Додати тварину" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {ownerProfile?.pets.map((pet) => {
          const nextVaccination = pet.vaccinations.find((vaccination) => vaccination.nextDueDate);

          return (
            <div key={pet.id} className="grid gap-4">
              <PetCard
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
                note={`Візитів у картці: ${pet._count.visits}. Усього записів: ${pet._count.appointments}.`}
              />

              <details className="rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_44px_-34px_rgba(15,23,42,0.24)]">
                <summary className="cursor-pointer px-5 py-4 font-medium text-slate-900">Редагувати картку</summary>
                <div className="border-t border-border/70 p-5">
                  <PetForm action={updateCabinetPetAction} mode="update" pet={pet} submitLabel="Зберегти зміни" />
                  <form action={deleteCabinetPetAction} className="mt-4">
                    <input type="hidden" name="petId" value={pet.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-destructive transition-opacity hover:opacity-80"
                    >
                      Видалити тварину
                    </button>
                  </form>
                </div>
              </details>
            </div>
          );
        })}
      </div>

      {!ownerProfile?.pets.length ? (
        <Card className="border-slate-200/80 bg-slate-50">
          <CardContent className="p-6">
            <EmptyState
              title="Тут ще немає тварин"
              description="Додайте першу картку, щоб записувати тварину на прийом і бачити її історію."
              className="min-h-32"
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
