import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function CabinetLabResultsPage() {
  const session = await requireCabinetAccess();
  const [labResults, attachments] = await Promise.all([
    prisma.labResult.findMany({
      where: {
        visit: {
          pet: {
            owner: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        visit: {
          include: {
            pet: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.fileAsset.findMany({
      where: {
        visit: {
          pet: {
            owner: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        visit: {
          include: {
            pet: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="grid gap-6">
      <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Усі аналізи та файли після прийому зібрані в одному місці.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Не потрібно шукати результати по всій історії візитів, усе важливе лежить тут.
            </p>
          </div>
          <Link href="/cabinet/visits" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
            Історія візитів
          </Link>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Результати аналізів</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {labResults.length ? (
            labResults.map((labResult) => (
              <div key={labResult.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-950">{labResult.title}</p>
                <p className="mt-1 text-sm text-slate-500">{labResult.visit.pet.name}</p>
                <p className="mt-2 text-sm text-slate-500">{labResult.comment ?? "Без коментаря"}</p>
                <a href={labResult.fileUrl} className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Відкрити результат
                </a>
              </div>
            ))
          ) : (
            <EmptyState
              title="Результатів поки немає"
              description="Коли лікар додасть аналізи, вони одразу з’являться в цьому розділі."
            />
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <CardHeader>
          <CardTitle>Додані файли</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {attachments.length ? (
            attachments.map((file) => (
              <div key={file.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-950">{file.originalName}</p>
                <p className="mt-1 text-sm text-slate-500">{file.visit?.pet.name ?? "Без прив'язки"}</p>
                <p className="mt-2 text-sm text-slate-500">{file.note ?? "Без опису"}</p>
                <a href={file.fileUrl} className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Завантажити файл
                </a>
              </div>
            ))
          ) : (
            <EmptyState title="Файлів поки немає" description="Коли лікар додасть вкладення після прийому, вони з’являться тут." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
