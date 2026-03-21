import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDoctorAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function DoctorPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireDoctorAccess();
  const { q } = await searchParams;
  const searchQuery = q?.trim() ?? "";

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!doctor) {
    return null;
  }

  const pets = await prisma.pet.findMany({
    where: {
      isArchived: false,
      OR: [
        { appointments: { some: { doctorId: doctor.id } } },
        { visits: { some: { doctorId: doctor.id } } },
      ],
      ...(searchQuery
        ? {
            AND: [
              {
                OR: [
                  { name: { contains: searchQuery, mode: "insensitive" } },
                  { owner: { fullName: { contains: searchQuery, mode: "insensitive" } } },
                ],
              },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      owner: true,
      _count: {
        select: {
          appointments: true,
          visits: true,
        },
      },
    },
  });

  return (
    <div className="grid gap-6">
      <Card className="border-[#d6e5ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef5ff_100%)]">
        <CardContent className="p-6">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            Тут зібрані всі тварини, з якими ви вже працювали.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Можна шукати і за ім&apos;ям тварини, і за ім&apos;ям власника, а потім одразу відкривати картку пацієнта.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Тварини</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="get" className="grid gap-3 rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4 md:grid-cols-[1fr_auto]">
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Пошук за ім'ям тварини або клієнта"
              className="h-11 rounded-lg border border-input bg-white px-3"
            />
            <div className="flex gap-3">
              <button type="submit" className={cn(buttonVariants(), "rounded-full px-5")}>
                Знайти
              </button>
              {searchQuery ? (
                <Link
                  href="/doctor/patients"
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}
                >
                  Скинути
                </Link>
              ) : null}
            </div>
          </form>

          {pets.length ? (
            pets.map((pet) => (
              <div
                key={pet.id}
                className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-950">{pet.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pet.species} · {pet.breed ?? "Без породи"}
                    </p>
                    <p className="text-sm text-muted-foreground">Власник: {pet.owner.fullName}</p>
                  </div>
                  <Link
                    href={`/doctor/patients/${pet.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
                  >
                    Картка пацієнта
                  </Link>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  Записів: {pet._count.appointments} · Візитів: {pet._count.visits}
                </p>
                {pet.notes ? (
                  <div className="mt-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Нотатка</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{pet.notes}</p>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <EmptyState
              title="Поки що нічого не знайдено"
              description="Спробуйте інше ім'я тварини або власника. Тут з'являються лише ті пацієнти, з якими у вас уже були записи або візити."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
