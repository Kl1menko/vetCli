import Link from "next/link";

import { deleteClientFormAction } from "@/server/actions/admin";
import { AdminClientCreateForm } from "@/components/forms/admin-client-create-form";
import { AdminClientUpdateForm } from "@/components/forms/admin-client-update-form";
import { ActionButtonForm } from "@/components/forms/action-button-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdminAccess();
  const { q } = await searchParams;
  const searchQuery = q?.trim() ?? "";

  const clients = await prisma.ownerProfile.findMany({
    where: searchQuery
      ? {
          OR: [
            { fullName: { contains: searchQuery, mode: "insensitive" } },
            { pets: { some: { isArchived: false, name: { contains: searchQuery, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    orderBy: { fullName: "asc" },
    include: {
      user: true,
      pets: {
        where: { isArchived: false },
      },
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-[#f5d8a8] bg-[linear-gradient(135deg,#fff8ed_0%,#fff3df_100%)] xl:col-span-2">
        <CardContent className="p-6">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            Тут зібрані всі клієнти клініки з контактами і картками їхніх тварин.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Можна швидко додати нового клієнта або оновити контактні дані без зайвих переходів між екранами.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Додати клієнта</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminClientCreateForm />
        </CardContent>
      </Card>
      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Усі клієнти</CardTitle>
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
              <button type="submit" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
                Знайти
              </button>
              {searchQuery ? (
                <Link
                  href="/admin/clients"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium"
                >
                  Скинути
                </Link>
              ) : null}
            </div>
          </form>

          {clients.length ? clients.map((client) => (
            <div key={client.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.2)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{client.fullName}</p>
                  <p className="text-sm text-muted-foreground">{client.email ?? client.user.email}</p>
                  <p className="text-sm text-muted-foreground">{client.phone ?? client.user.phone}</p>
                  <p className="text-sm text-muted-foreground">Тварин: {client.pets.length}</p>
                </div>
                <ActionButtonForm
                  action={deleteClientFormAction}
                  fields={[{ name: "userId", value: client.userId }]}
                  submitLabel="Архівувати"
                  pendingLabel="Архівую…"
                  variant="outline"
                  size="sm"
                  successTitle="Клієнта архівовано"
                  errorTitle="Не вдалося архівувати клієнта"
                />
              </div>
              {client.notes ? (
                <div className="mt-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Нотатка</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{client.notes}</p>
                </div>
              ) : null}
              <details className="mt-4 rounded-[1.1rem] border border-dashed border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-medium">Редагувати</summary>
                <AdminClientUpdateForm
                  client={{
                    id: client.id,
                    userId: client.userId,
                    fullName: client.fullName,
                    email: client.email ?? client.user.email ?? "",
                    phone: client.phone ?? client.user.phone ?? "",
                    address: client.address ?? "",
                    notes: client.notes ?? "",
                  }}
                />
              </details>
            </div>
          )) : (
            <EmptyState
              title="Нічого не знайдено"
              description="Спробуйте інше ім'я клієнта або тварини. Коли записи збігатимуться з пошуком, вони з'являться тут."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
