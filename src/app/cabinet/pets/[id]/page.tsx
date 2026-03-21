import { notFound } from "next/navigation";

import { PrescriptionDetailsCard } from "@/components/shared/prescription-details-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { VisitDischargeCard } from "@/components/shared/visit-discharge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCabinetAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";

export default async function PetDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCabinetAccess();
  const { id } = await params;
  const pet = await prisma.pet.findFirst({
    where: {
      id,
      isArchived: false,
      owner: {
        userId: session.user.id,
      },
    },
    include: {
      appointments: {
        include: {
          doctor: true,
          service: true,
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
      },
      visits: {
        include: {
          pet: true,
          appointment: {
            include: {
              doctor: true,
              service: true,
            },
          },
          diagnoses: true,
          prescriptions: true,
          labResults: true,
          invoice: true,
          attachments: true,
        },
        orderBy: { createdAt: "desc" },
      },
      vaccinations: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!pet) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{pet.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Вид / порода</p>
            <p className="font-medium">{pet.species} · {pet.breed ?? "Без породи"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Стать</p>
            <p className="font-medium">
              {pet.sex === "MALE" ? "Самець" : pet.sex === "FEMALE" ? "Самка" : "Невідомо"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Дата народження</p>
            <p className="font-medium">{pet.birthDate ? pet.birthDate.toLocaleDateString("uk-UA") : "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Вага</p>
            <p className="font-medium">{pet.weight ? `${pet.weight.toString()} кг` : "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Колір</p>
            <p className="font-medium">{pet.color ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Мікрочип</p>
            <p className="font-medium">{pet.microchipNumber ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Стерилізація</p>
            <p className="font-medium">{pet.isSterilized ? "Так" : "Ні"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Записів / візитів</p>
            <p className="font-medium">{pet.appointments.length} / {pet.visits.length}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">Алергії</p>
            <p className="font-medium">{pet.allergies ?? "Не вказано"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">Хронічні стани</p>
            <p className="font-medium">{pet.chronicConditions ?? "Не вказано"}</p>
          </div>
          <div className="md:col-span-2 xl:col-span-4">
            <p className="text-sm text-muted-foreground">Нотатки</p>
            <p className="font-medium">{pet.notes ?? "Нотаток поки немає"}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visits" className="grid gap-4">
        <Card className="border-[#d9e4ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef4ff_100%)] shadow-[0_20px_44px_-36px_rgba(15,23,42,0.16)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-[1.7rem] leading-tight tracking-[-0.04em] sm:text-2xl">
              Історія, записи і документи
            </CardTitle>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              Прийоми, призначення, аналізи, щеплення і записи по цій тварині.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5 pt-0">
            <TabsList className="!grid !h-auto !w-full grid-cols-2 gap-2 rounded-[1.5rem] border border-[#d7e6f0] bg-white/80 p-2 sm:!flex sm:flex-wrap sm:justify-start">
              <TabsTrigger value="visits" className="!flex-none !w-full min-h-11 rounded-full border border-transparent px-3 py-2 text-sm sm:!w-auto sm:text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Прийоми
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="!flex-none !w-full min-h-11 rounded-full border border-transparent px-3 py-2 text-sm sm:!w-auto sm:text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Призначення
              </TabsTrigger>
              <TabsTrigger value="lab" className="!flex-none !w-full min-h-11 rounded-full border border-transparent px-3 py-2 text-sm sm:!w-auto sm:text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Аналізи
              </TabsTrigger>
              <TabsTrigger value="vaccinations" className="!flex-none !w-full min-h-11 rounded-full border border-transparent px-3 py-2 text-sm sm:!w-auto sm:text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Щеплення
              </TabsTrigger>
              <TabsTrigger value="appointments" className="col-span-2 !flex-none !w-full min-h-11 rounded-full border border-transparent px-3 py-2 text-sm sm:col-span-1 sm:!w-auto sm:text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Записи
              </TabsTrigger>
            </TabsList>
            <TabsContent value="visits" className="mt-0">
              <div className="grid gap-4 rounded-[1.5rem] border border-white/80 bg-white/92 p-4 sm:rounded-[1.75rem] sm:p-6">
                {pet.visits.length ? (
                  pet.visits.map((visit) => (
                    <details key={visit.id} className="rounded-[1.35rem] border border-border p-4 sm:rounded-2xl">
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium leading-6">
                              {visit.appointment.date.toLocaleDateString("uk-UA")} · {visit.appointment.service.name}
                            </p>
                            <p className="text-sm text-muted-foreground">{visit.appointment.doctor.fullName}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Діагнозів: {visit.diagnoses.length} · Призначень: {visit.prescriptions.length}
                          </p>
                        </div>
                      </summary>
                      <VisitDischargeCard visit={visit} className="mt-4 border-slate-200 shadow-none ring-0" />
                    </details>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Поки що тут немає жодного завершеного прийому.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="prescriptions" className="mt-0">
              <div className="grid gap-4 rounded-[1.5rem] border border-white/80 bg-white/92 p-4 sm:rounded-[1.75rem] sm:p-6">
                {pet.visits.flatMap((visit) => visit.prescriptions).length ? (
                  pet.visits.flatMap((visit) =>
                    visit.prescriptions.map((prescription) => (
                      <PrescriptionDetailsCard
                        key={prescription.id}
                        prescription={prescription}
                        className="border-border shadow-none"
                        headerSuffix={
                          <p className="text-sm text-slate-500">
                            {visit.appointment.date.toLocaleDateString("uk-UA")}
                          </p>
                        }
                      />
                    )),
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Призначень для цієї тварини поки немає.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="lab" className="mt-0">
              <div className="grid gap-4 rounded-[1.5rem] border border-white/80 bg-white/92 p-4 sm:rounded-[1.75rem] sm:p-6">
                {pet.visits.flatMap((visit) => [...visit.labResults, ...visit.attachments]).length ? (
                  <>
                    {pet.visits.flatMap((visit) =>
                      visit.labResults.map((labResult) => (
                        <div key={labResult.id} className="rounded-2xl border border-border p-4">
                          <p className="font-medium">{labResult.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{labResult.comment ?? "Без коментаря"}</p>
                          <a href={labResult.fileUrl} className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
                            Відкрити файл
                          </a>
                        </div>
                      )),
                    )}
                    {pet.visits.flatMap((visit) =>
                      visit.attachments.map((file) => (
                        <div key={file.id} className="rounded-2xl border border-border p-4">
                          <p className="font-medium">{file.originalName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{file.note ?? "Медичний файл без опису"}</p>
                          <a href={file.fileUrl} className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
                            Завантажити
                          </a>
                        </div>
                      )),
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Аналізів або доданих файлів поки немає.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="vaccinations" className="mt-0">
              <div className="grid gap-4 rounded-[1.5rem] border border-white/80 bg-white/92 p-4 sm:rounded-[1.75rem] sm:p-6">
                {pet.vaccinations.length ? (
                  pet.vaccinations.map((vaccination) => (
                    <div key={vaccination.id} className="rounded-2xl border border-border p-4">
                      <p className="font-medium">{vaccination.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {vaccination.date.toLocaleDateString("uk-UA")}
                        {vaccination.nextDueDate ? ` · Наступна: ${vaccination.nextDueDate.toLocaleDateString("uk-UA")}` : ""}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{vaccination.note ?? "Без додаткової примітки"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Щеплення для цієї тварини ще не додані.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="appointments" className="mt-0">
              <div className="grid gap-4 rounded-[1.5rem] border border-white/80 bg-white/92 p-4 sm:rounded-[1.75rem] sm:p-6">
                {pet.appointments.length ? (
                  pet.appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-2xl border border-border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">
                            {appointment.date.toLocaleDateString("uk-UA")} · {appointment.startTime}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service.name} · {appointment.doctor.fullName}
                          </p>
                        </div>
                        <StatusBadge status={appointment.status} />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{appointment.comment ?? "Без коментаря до запису"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Записів для цієї тварини поки немає.</p>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Card>

      </Tabs>
    </div>
  );
}
