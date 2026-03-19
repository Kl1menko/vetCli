import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDoctorAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function DoctorClientsPage({
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

  const clients = await prisma.ownerProfile.findMany({
    where: {
      pets: {
        some: {
          OR: [
            { appointments: { some: { doctorId: doctor.id } } },
            { visits: { some: { doctorId: doctor.id } } },
          ],
        },
      },
      ...(searchQuery
        ? {
            OR: [
              { fullName: { contains: searchQuery, mode: "insensitive" } },
              { pets: { some: { name: { contains: searchQuery, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    orderBy: { fullName: "asc" },
    include: {
      pets: {
        where: {
          OR: [
            { appointments: { some: { doctorId: doctor.id } } },
            { visits: { some: { doctorId: doctor.id } } },
          ],
        },
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <div className="grid gap-6">
      <Card className="border-[#d6e5ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef5ff_100%)]">
        <CardContent className="p-6">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            Тут зібрані клієнти, з якими ви вже працювали.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Можна швидко знайти власника за його ім&apos;ям або перейти через ім&apos;я тварини, якщо так зручніше.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Клієнти</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form method="get" className="grid gap-3 rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4 md:grid-cols-[1fr_auto]">
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Пошук за ім'ям клієнта або тварини"
              className="h-11 rounded-lg border border-input bg-white px-3"
            />
            <div className="flex gap-3">
              <button type="submit" className={cn(buttonVariants(), "rounded-full px-5")}>
                Знайти
              </button>
              {searchQuery ? (
                <Link
                  href="/doctor/clients"
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}
                >
                  Скинути
                </Link>
              ) : null}
            </div>
          </form>

          {clients.length ? (
            clients.map((client) => (
              <div
                key={client.id}
                className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-950">{client.fullName}</p>
                    <p className="text-sm text-muted-foreground">{client.phone ?? "Телефон не вказано"}</p>
                    <p className="text-sm text-muted-foreground">{client.email ?? "Email не вказано"}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Тварин у роботі: {client.pets.length}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {client.pets.map((pet) => (
                    <Link
                      key={pet.id}
                      href={`/doctor/patients/${pet.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
                    >
                      {pet.name}
                    </Link>
                  ))}
                </div>
                {client.notes ? (
                  <div className="mt-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Нотатка</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{client.notes}</p>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <EmptyState
              title="Поки що нічого не знайдено"
              description="Спробуйте інше ім'я клієнта або тварини. Тут з'являються лише ті власники, з якими у вас уже були записи або візити."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
