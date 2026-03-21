import Link from "next/link";

import { PrescriptionDetailsCard } from "@/components/shared/prescription-details-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const diagnosisStatusLabelMap = {
  ACTIVE: "Активний",
  RESOLVED: "Закритий",
  CHRONIC: "Хронічний",
} as const;

const invoicePaymentStatusLabelMap = {
  UNPAID: "Не оплачено",
  PARTIALLY_PAID: "Частково оплачено",
  PAID: "Оплачено",
  CANCELLED: "Скасовано",
} as const;

type VisitDischarge = {
  id: string;
  status: string;
  summary: string | null;
  anamnesis: string | null;
  examination: string | null;
  recommendations: string | null;
  pet?: {
    name: string;
  };
  appointment: {
    date: Date;
    startTime: string;
    doctor: {
      fullName: string;
    };
    service: {
      name: string;
    };
  };
  diagnoses: Array<{
    id: string;
    title: string;
    description: string | null;
    status: keyof typeof diagnosisStatusLabelMap;
  }> | undefined;
  prescriptions: Array<{
    id: string;
    medicationName: string;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
    startDate: Date | null;
    endDate: Date | null;
  }> | undefined;
  labResults: Array<{
    id: string;
    title: string;
    comment: string | null;
    fileUrl: string;
  }> | undefined;
  attachments: Array<{
    id: string;
    originalName: string;
    note: string | null;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
  }> | undefined;
  invoice: {
    totalAmount: { toString(): string };
    paymentStatus: keyof typeof invoicePaymentStatusLabelMap;
    fileUrl: string | null;
    note: string | null;
  } | null;
};

function formatDate(value: Date | null) {
  return value ? value.toLocaleDateString("uk-UA") : "—";
}

function formatRange(startDate: Date | null, endDate: Date | null) {
  if (!startDate && !endDate) return "Період не вказано";
  if (startDate && endDate) return `${formatDate(startDate)} — ${formatDate(endDate)}`;
  if (startDate) return `З ${formatDate(startDate)}`;
  return `До ${formatDate(endDate)}`;
}

function FileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  );
}

export function VisitDischargeCard({
  visit,
  className,
  title = "Виписка після прийому",
}: {
  visit: VisitDischarge;
  className?: string;
  title?: string;
}) {
  const diagnoses = Array.isArray(visit.diagnoses) ? visit.diagnoses : [];
  const prescriptions = Array.isArray(visit.prescriptions) ? visit.prescriptions : [];
  const labResults = Array.isArray(visit.labResults) ? visit.labResults : [];
  const attachments = Array.isArray(visit.attachments) ? visit.attachments : [];
  const petName = visit.pet?.name ?? "—";
  const doctorName = visit.appointment?.doctor?.fullName ?? "—";
  const serviceName = visit.appointment?.service?.name ?? "—";

  return (
    <Card className={cn("border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]", className)}>
      <CardHeader className="border-b border-slate-100">
        <CardTitle>{title}</CardTitle>
        <div className="grid gap-3 pt-2 md:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">Пацієнт</p>
            <p className="font-medium text-slate-950">{petName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Прийом</p>
            <p className="font-medium text-slate-950">
              {visit.appointment.date.toLocaleDateString("uk-UA")} · {visit.appointment.startTime}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Лікар</p>
            <p className="font-medium text-slate-950">{doctorName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Послуга</p>
            <p className="font-medium text-slate-950">{serviceName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-4 xl:grid-cols-2">
          {[
            ["Підсумок", visit.summary],
            ["Анамнез", visit.anamnesis],
            ["Огляд", visit.examination],
            ["Рекомендації", visit.recommendations],
          ].map(([sectionTitle, value]) => (
            <div key={sectionTitle} className="rounded-[1.2rem] border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-500">{sectionTitle}</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">{value || "Ще не заповнено."}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-medium text-slate-950">Діагнози</h3>
            <div className="mt-3 grid gap-3">
              {diagnoses.length ? (
                diagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-950">{diagnosis.title}</p>
                      <Badge variant="outline">{diagnosisStatusLabelMap[diagnosis.status]}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {diagnosis.description || "Опис не додано."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Діагнози не додані.</p>
              )}
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-medium text-slate-950">Призначення</h3>
            <div className="mt-3 grid gap-3">
              {prescriptions.length ? (
                prescriptions.map((prescription) => (
                  <PrescriptionDetailsCard
                    key={prescription.id}
                    prescription={prescription}
                    className="rounded-2xl border-slate-200 shadow-none"
                    headerSuffix={
                      <Badge variant="outline" className="border-slate-200 text-slate-600">
                        {formatRange(prescription.startDate, prescription.endDate)}
                      </Badge>
                    }
                  />
                ))
              ) : (
                <p className="text-sm text-slate-500">Призначення не додані.</p>
              )}
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-medium text-slate-950">Аналізи та результати</h3>
            <div className="mt-3 grid gap-3">
              {labResults.length ? (
                labResults.map((labResult) => (
                  <div key={labResult.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{labResult.title}</p>
                      <FileLink href={labResult.fileUrl} label="Відкрити результат" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {labResult.comment || "Коментар не додано."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Результати аналізів не додані.</p>
              )}
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-medium text-slate-950">Рахунок і файли</h3>
            <div className="mt-3 grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="font-medium text-slate-950">Фінальна оплата</p>
                {visit.invoice ? (
                  <div className="mt-2 grid gap-2 text-sm text-slate-600">
                    <p>{visit.invoice.totalAmount.toString()} грн</p>
                    <p>{invoicePaymentStatusLabelMap[visit.invoice.paymentStatus]}</p>
                    <p>{visit.invoice.note || "Коментар до рахунку не додано."}</p>
                    {visit.invoice.fileUrl ? <FileLink href={visit.invoice.fileUrl} label="Відкрити рахунок" /> : null}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Рахунок ще не сформовано.</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="font-medium text-slate-950">Додані файли</p>
                <div className="mt-2 grid gap-3">
                  {attachments.length ? (
                    attachments.map((attachment) => (
                      <div key={attachment.id} className="rounded-xl border border-slate-100 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-950">{attachment.originalName}</p>
                            <p className="text-sm text-slate-500">
                              {attachment.mimeType} · {(attachment.sizeBytes / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <FileLink href={attachment.fileUrl} label="Відкрити файл" />
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {attachment.note || "Опис до файлу не додано."}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Додаткові файли не прикріплені.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
