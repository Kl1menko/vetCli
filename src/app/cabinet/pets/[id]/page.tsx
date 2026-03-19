import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/shared/status-badge";
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
            <CardTitle>Історія, записи і документи</CardTitle>
            <p className="text-sm leading-7 text-slate-600">
              Тут зібрано все важливе по цій тварині: що було на прийомах, які є призначення, аналізи, щеплення і майбутні записи.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5 pt-0">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[1.75rem] border border-[#d7e6f0] bg-white/80 p-2">
              <TabsTrigger value="visits" className="rounded-full border border-transparent px-4 py-2 text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Прийоми
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="rounded-full border border-transparent px-4 py-2 text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Призначення
              </TabsTrigger>
              <TabsTrigger value="lab" className="rounded-full border border-transparent px-4 py-2 text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Аналізи
              </TabsTrigger>
              <TabsTrigger value="vaccinations" className="rounded-full border border-transparent px-4 py-2 text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Щеплення
              </TabsTrigger>
              <TabsTrigger value="appointments" className="rounded-full border border-transparent px-4 py-2 text-base data-active:border-[#2f6bff] data-active:bg-[#2f6bff] data-active:text-white data-active:shadow-[0_14px_26px_-18px_rgba(47,107,255,0.7)]">
                Записи
              </TabsTrigger>
            </TabsList>
            <TabsContent value="visits" className="mt-0">
              <div className="grid gap-4 rounded-[1.75rem] border border-white/80 bg-white/92 p-6">
                {pet.visits.length ? (
                  pet.visits.map((visit) => (
                    <div key={visit.id} className="rounded-2xl border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {visit.appointment.date.toLocaleDateString("uk-UA")} · {visit.appointment.service.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{visit.appointment.doctor.fullName}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Діагнозів: {visit.diagnoses.length} · Призначень: {visit.prescriptions.length}
                        </p>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <p>{visit.summary ?? "Підсумок ще не заповнений."}</p>
                        <p>{visit.recommendations ?? "Рекомендації ще не додані."}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Поки що тут немає жодного завершеного прийому.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="prescriptions" className="mt-0">
              <div className="grid gap-4 rounded-[1.75rem] border border-white/80 bg-white/92 p-6">
                {pet.visits.flatMap((visit) => visit.prescriptions).length ? (
                  pet.visits.flatMap((visit) =>
                    visit.prescriptions.map((prescription) => (
                      <div key={prescription.id} className="rounded-2xl border border-border p-4">
                        <p className="font-medium">{prescription.medicationName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {prescription.dosage ?? "Дозування не вказане"} · {prescription.frequency ?? "Частота не вказана"}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">{prescription.instructions ?? "Інструкції відсутні."}</p>
                      </div>
                    )),
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Призначень для цієї тварини поки немає.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="lab" className="mt-0">
              <div className="grid gap-4 rounded-[1.75rem] border border-white/80 bg-white/92 p-6">
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
              <div className="grid gap-4 rounded-[1.75rem] border border-white/80 bg-white/92 p-6">
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
              <div className="grid gap-4 rounded-[1.75rem] border border-white/80 bg-white/92 p-6">
                {pet.appointments.length ? (
                  pet.appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-2xl border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
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
