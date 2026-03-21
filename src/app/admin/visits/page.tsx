import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdminAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const visitStatusLabelMap = {
  DRAFT: "Чернетка",
  IN_PROGRESS: "У роботі",
  COMPLETED: "Завершено",
} as const;

const invoicePaymentStatusLabelMap = {
  UNPAID: "Не оплачено",
  PARTIALLY_PAID: "Частково оплачено",
  PAID: "Оплачено",
  CANCELLED: "Скасовано",
} as const;

function VisitStatusBadge({ status }: { status: keyof typeof visitStatusLabelMap }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent",
        status === "DRAFT" && "bg-slate-100 text-slate-800",
        status === "IN_PROGRESS" && "bg-amber-100 text-amber-900",
        status === "COMPLETED" && "bg-emerald-100 text-emerald-900",
      )}
    >
      {visitStatusLabelMap[status]}
    </Badge>
  );
}

function InvoiceStatusBadge({ status }: { status: keyof typeof invoicePaymentStatusLabelMap }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent",
        status === "UNPAID" && "bg-rose-100 text-rose-900",
        status === "PARTIALLY_PAID" && "bg-amber-100 text-amber-900",
        status === "PAID" && "bg-emerald-100 text-emerald-900",
        status === "CANCELLED" && "bg-slate-200 text-slate-800",
      )}
    >
      {invoicePaymentStatusLabelMap[status]}
    </Badge>
  );
}

function formatDate(value: Date) {
  return value.toLocaleDateString("uk-UA");
}

function formatDateTime(date: Date, time: string) {
  return `${formatDate(date)} · ${time}`;
}

function formatCurrency(value: { toString(): string }) {
  return `${value.toString()} грн`;
}

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; doctorId?: string; status?: string }>;
}) {
  await requireAdminAccess();
  const { q, doctorId, status } = await searchParams;
  const query = q?.trim() ?? "";
  const selectedDoctorId = doctorId ?? "";
  const selectedStatus = status ?? "";

  const where = {
    ...(selectedDoctorId ? { doctorId: selectedDoctorId } : {}),
    ...(selectedStatus === "DRAFT" || selectedStatus === "IN_PROGRESS" || selectedStatus === "COMPLETED"
      ? { status: selectedStatus }
      : {}),
    ...(query
      ? {
          OR: [
            { pet: { name: { contains: query, mode: "insensitive" as const } } },
            { pet: { owner: { fullName: { contains: query, mode: "insensitive" as const } } } },
            { appointment: { service: { name: { contains: query, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };

  const [doctors, visits, totalVisits, completedVisits, visitsWithInvoice] = await Promise.all([
    prisma.doctor.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true },
    }),
    prisma.visit.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: 40,
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
        doctor: true,
        appointment: {
          include: {
            service: true,
          },
        },
        diagnoses: {
          orderBy: { createdAt: "desc" },
        },
        prescriptions: {
          orderBy: { createdAt: "desc" },
        },
        labResults: {
          orderBy: { createdAt: "desc" },
        },
        attachments: {
          orderBy: { createdAt: "desc" },
        },
        invoice: true,
      },
    }),
    prisma.visit.count(),
    prisma.visit.count({
      where: { status: "COMPLETED" },
    }),
    prisma.visit.count({
      where: {
        invoice: {
          isNot: null,
        },
      },
    }),
  ]);

  return (
    <div className="grid gap-6">
      <Card className="border-[#f5d8a8] bg-[linear-gradient(135deg,#fff8ed_0%,#fff3df_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Історія прийомів без редагування медичної частини.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Адміністратор бачить контекст по кожному візиту: хто був на прийомі, які є діагнози, призначення, файли та
              рахунок.
            </p>
          </div>
          <Link
            href="/admin/appointments"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50",
            )}
          >
            До записів
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Усі візити", String(totalVisits)],
          ["Завершені", String(completedVisits)],
          ["З рахунком", String(visitsWithInvoice)],
        ].map(([title, value]) => (
          <Card key={title} className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Пошук і перегляд</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_240px_220px_auto]">
            <input
              name="q"
              defaultValue={query}
              placeholder="Пошук за твариною, клієнтом або послугою"
              className="h-10 rounded-lg border border-input px-3"
            />
            <select name="doctorId" defaultValue={selectedDoctorId} className="h-10 rounded-lg border border-input px-3">
              <option value="">Усі лікарі</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={selectedStatus} className="h-10 rounded-lg border border-input px-3">
              <option value="">Усі статуси</option>
              {Object.entries(visitStatusLabelMap).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Button type="submit">Фільтрувати</Button>
          </form>

          {visits.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Прийом</TableHead>
                    <TableHead>Клієнт</TableHead>
                    <TableHead>Лікар</TableHead>
                    <TableHead>Статуси</TableHead>
                    <TableHead>Медичний вміст</TableHead>
                    <TableHead>Оплата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="whitespace-normal">
                        <p className="font-medium text-slate-950">
                          {visit.pet.name} · {visit.appointment.service.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDateTime(visit.appointment.date, visit.appointment.startTime)}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <p className="font-medium text-slate-950">{visit.pet.owner.fullName}</p>
                        <p className="text-sm text-slate-500">
                          {visit.pet.species}
                          {visit.pet.breed ? ` · ${visit.pet.breed}` : ""}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <p className="font-medium text-slate-950">{visit.doctor.fullName}</p>
                        <p className="text-sm text-slate-500">{visit.doctor.specialization}</p>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={visit.appointment.status} />
                          <VisitStatusBadge status={visit.status} />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal text-sm text-slate-600">
                        Діагнозів: {visit.diagnoses.length} · Призначень: {visit.prescriptions.length} · Аналізів:{" "}
                        {visit.labResults.length} · Файлів: {visit.attachments.length}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {visit.invoice ? (
                          <div className="grid gap-2">
                            <InvoiceStatusBadge status={visit.invoice.paymentStatus} />
                            <p className="text-sm text-slate-600">{formatCurrency(visit.invoice.totalAmount)}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">Рахунок ще не створено</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 space-y-4">
                {visits.map((visit) => (
                  <details key={visit.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="font-medium text-slate-950">
                            {visit.pet.name} · {visit.pet.owner.fullName} · {formatDateTime(visit.appointment.date, visit.appointment.startTime)}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {visit.appointment.service.name} · {visit.doctor.fullName}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={visit.appointment.status} />
                          <VisitStatusBadge status={visit.status} />
                          {visit.invoice ? <InvoiceStatusBadge status={visit.invoice.paymentStatus} /> : null}
                        </div>
                      </div>
                    </summary>

                    <div className="mt-5 grid gap-6 border-t border-slate-100 pt-5">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-sm text-slate-500">Клієнт</p>
                          <p className="font-medium text-slate-950">{visit.pet.owner.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Пацієнт</p>
                          <p className="font-medium text-slate-950">{visit.pet.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Лікар</p>
                          <p className="font-medium text-slate-950">{visit.doctor.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Послуга</p>
                          <p className="font-medium text-slate-950">{visit.appointment.service.name}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 xl:grid-cols-2">
                        {[
                          ["Підсумок", visit.summary],
                          ["Анамнез", visit.anamnesis],
                          ["Огляд", visit.examination],
                          ["Рекомендації", visit.recommendations],
                        ].map(([title, value]) => (
                          <div
                            key={title}
                            className="rounded-[1.2rem] border border-slate-200/80 bg-[linear-gradient(180deg,#fcfcfd_0%,#ffffff_100%)] p-4"
                          >
                            <p className="text-sm font-medium text-slate-500">{title}</p>
                            <p className="mt-2 text-sm leading-7 text-slate-700">{value || "Ще не заповнено."}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-4 xl:grid-cols-2">
                        <section className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50 p-4">
                          <h3 className="font-medium text-slate-950">Діагнози</h3>
                          <div className="mt-3 grid gap-3">
                            {visit.diagnoses.length ? (
                              visit.diagnoses.map((diagnosis) => (
                                <div key={diagnosis.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-slate-950">{diagnosis.title}</p>
                                    <Badge variant="outline">{diagnosis.status}</Badge>
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {diagnosis.description || "Опис не додано."}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500">Діагнози ще не додані.</p>
                            )}
                          </div>
                        </section>

                        <section className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50 p-4">
                          <h3 className="font-medium text-slate-950">Призначення</h3>
                          <div className="mt-3 grid gap-3">
                            {visit.prescriptions.length ? (
                              visit.prescriptions.map((prescription) => (
                                <div key={prescription.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                  <p className="font-medium text-slate-950">{prescription.medicationName}</p>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {[prescription.dosage, prescription.frequency, prescription.duration]
                                      .filter(Boolean)
                                      .join(" · ") || "Деталі не вказані."}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {prescription.instructions || "Інструкції не додані."}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500">Призначення ще не додані.</p>
                            )}
                          </div>
                        </section>

                        <section className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50 p-4">
                          <h3 className="font-medium text-slate-950">Аналізи та результати</h3>
                          <div className="mt-3 grid gap-3">
                            {visit.labResults.length ? (
                              visit.labResults.map((labResult) => (
                                <div key={labResult.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="font-medium text-slate-950">{labResult.title}</p>
                                    <Link
                                      href={labResult.fileUrl}
                                      target="_blank"
                                      className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
                                    >
                                      Відкрити файл
                                    </Link>
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {labResult.comment || "Коментар не додано."}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500">Результати аналізів ще не додані.</p>
                            )}
                          </div>
                        </section>

                        <section className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50 p-4">
                          <h3 className="font-medium text-slate-950">Рахунок і вкладення</h3>
                          <div className="mt-3 grid gap-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                              <p className="font-medium text-slate-950">Рахунок</p>
                              {visit.invoice ? (
                                <div className="mt-2 grid gap-2 text-sm text-slate-600">
                                  <InvoiceStatusBadge status={visit.invoice.paymentStatus} />
                                  <p>{formatCurrency(visit.invoice.totalAmount)}</p>
                                  <p>{visit.invoice.note || "Нотатка до рахунку не додана."}</p>
                                  {visit.invoice.fileUrl ? (
                                    <Link
                                      href={visit.invoice.fileUrl}
                                      target="_blank"
                                      className="font-medium text-slate-700 underline-offset-4 hover:underline"
                                    >
                                      Відкрити PDF або файл рахунку
                                    </Link>
                                  ) : null}
                                </div>
                              ) : (
                                <p className="mt-2 text-sm text-slate-500">Рахунок ще не створено.</p>
                              )}
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                              <p className="font-medium text-slate-950">Додані файли</p>
                              <div className="mt-2 grid gap-2">
                                {visit.attachments.length ? (
                                  visit.attachments.map((attachment) => (
                                    <div key={attachment.id} className="rounded-xl border border-slate-100 p-3">
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                          <p className="text-sm font-medium text-slate-950">{attachment.originalName}</p>
                                          <p className="text-sm text-slate-500">
                                            {attachment.kind} · {Math.round(attachment.sizeBytes / 1024)} KB
                                          </p>
                                        </div>
                                        <Link
                                          href={attachment.fileUrl}
                                          target="_blank"
                                          className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
                                        >
                                          Відкрити
                                        </Link>
                                      </div>
                                      <p className="mt-2 text-sm text-slate-600">
                                        {attachment.note || "Нотатка до файлу не додана."}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-slate-500">Файли до візиту ще не додані.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="Візити не знайдено"
              description="Спробуйте змінити фільтри. У цьому розділі з’являються лише ті прийоми, для яких лікар уже створив візит."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
