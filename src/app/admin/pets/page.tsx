import Link from "next/link";

import { deletePetFormAction } from "@/server/actions/admin";
import { AdminPetCreateForm } from "@/components/forms/admin-pet-create-form";
import { AdminPetUpdateForm } from "@/components/forms/admin-pet-update-form";
import { ActionButtonForm } from "@/components/forms/action-button-form";
import { EmptyState } from "@/components/shared/empty-state";
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
      where: {
        isArchived: false,
        ...(searchQuery
          ? {
              OR: [
                { name: { contains: searchQuery, mode: "insensitive" } },
                { owner: { fullName: { contains: searchQuery, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
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
          <AdminPetCreateForm owners={owners.map((owner) => ({ id: owner.id, fullName: owner.fullName }))} />
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
              <button type="submit" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
                Знайти
              </button>
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
                <ActionButtonForm
                  action={deletePetFormAction}
                  fields={[{ name: "petId", value: pet.id }]}
                  submitLabel="Архівувати"
                  pendingLabel="Архівую…"
                  variant="outline"
                  size="sm"
                  successTitle="Тварину архівовано"
                  errorTitle="Не вдалося архівувати тварину"
                />
              </div>
              {pet.notes ? (
                <div className="mt-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Нотатка</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{pet.notes}</p>
                </div>
              ) : null}
              <details className="mt-4 rounded-[1.1rem] border border-dashed border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-medium">Редагувати</summary>
                <AdminPetUpdateForm
                  pet={{
                    id: pet.id,
                    ownerId: pet.ownerId,
                    name: pet.name,
                    species: pet.species,
                    breed: pet.breed ?? "",
                    microchipNumber: pet.microchipNumber ?? "",
                    notes: pet.notes ?? "",
                  }}
                  owners={owners.map((owner) => ({ id: owner.id, fullName: owner.fullName }))}
                />
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
