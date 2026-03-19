import Link from "next/link";

import { createPetAction, deletePetAction, updatePetAction } from "@/server/actions/admin";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";

export default async function AdminPetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdminAccess();
  const { q } = await searchParams;
  const searchQuery = q?.trim() ?? "";

  const [owners, pets] = await Promise.all([
    prisma.ownerProfile.findMany({ orderBy: { fullName: "asc" } }),
    prisma.pet.findMany({
      where: searchQuery
        ? {
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" } },
              { owner: { fullName: { contains: searchQuery, mode: "insensitive" } } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
      include: { owner: true },
    }),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-[#f5d8a8] bg-[linear-gradient(135deg,#fff8ed_0%,#fff3df_100%)] xl:col-span-2">
        <CardContent className="p-6">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            Тут зібрані всі тварини клініки разом із власниками.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Зручно, коли потрібно швидко додати нового пацієнта, змінити власника або оновити базові дані.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Додати тварину</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPetAction} className="grid gap-4">
            <select name="ownerId" className="h-10 rounded-lg border border-input px-3">
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.fullName}
                </option>
              ))}
            </select>
            <input name="name" placeholder="Ім'я тварини" className="h-10 rounded-lg border border-input px-3" />
            <input name="species" placeholder="Вид" className="h-10 rounded-lg border border-input px-3" />
            <input name="breed" placeholder="Порода" className="h-10 rounded-lg border border-input px-3" />
            <input name="microchipNumber" placeholder="Номер чипа" className="h-10 rounded-lg border border-input px-3" />
            <textarea name="notes" placeholder="Нотатки" className="min-h-24 rounded-lg border border-input px-3 py-2" />
            <Button type="submit">Додати тварину</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Картки тварин</CardTitle>
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
              <Button type="submit">Знайти</Button>
              {searchQuery ? (
                <Link
                  href="/admin/pets"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium"
                >
                  Скинути
                </Link>
              ) : null}
            </div>
          </form>

          {pets.length ? pets.map((pet) => (
            <div key={pet.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{pet.name}</p>
                  <p className="text-sm text-muted-foreground">{pet.species} · {pet.breed ?? "Без породи"}</p>
                  <p className="text-sm text-muted-foreground">Власник: {pet.owner.fullName}</p>
                </div>
                <form action={deletePetAction}>
                  <input type="hidden" name="petId" value={pet.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Видалити
                  </Button>
                </form>
              </div>
              {pet.notes ? (
                <div className="mt-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Нотатка</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{pet.notes}</p>
                </div>
              ) : null}
              <details className="mt-4 rounded-[1.1rem] border border-dashed border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-medium">Редагувати</summary>
                <form action={updatePetAction} className="mt-4 grid gap-3">
                  <input type="hidden" name="petId" value={pet.id} />
                  <select name="ownerId" defaultValue={pet.ownerId} className="h-10 rounded-lg border border-input px-3">
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.fullName}
                      </option>
                    ))}
                  </select>
                  <input name="name" defaultValue={pet.name} className="h-10 rounded-lg border border-input px-3" />
                  <input name="species" defaultValue={pet.species} className="h-10 rounded-lg border border-input px-3" />
                  <input name="breed" defaultValue={pet.breed ?? ""} className="h-10 rounded-lg border border-input px-3" />
                  <input
                    name="microchipNumber"
                    defaultValue={pet.microchipNumber ?? ""}
                    className="h-10 rounded-lg border border-input px-3"
                  />
                  <textarea
                    name="notes"
                    defaultValue={pet.notes ?? ""}
                    className="min-h-24 rounded-lg border border-input px-3 py-2"
                  />
                  <Button type="submit">Зберегти зміни</Button>
                </form>
              </details>
            </div>
          )) : (
            <EmptyState
              title="Нічого не знайдено"
              description="Спробуйте інше ім'я тварини або власника. Відповідні картки з'являться тут."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
