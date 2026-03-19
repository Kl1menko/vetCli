import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DiagnosisForm,
  ExistingAttachments,
  ExistingDiagnoses,
  ExistingLabResults,
  ExistingPrescriptions,
  InvoiceForm,
  LabResultForm,
  PrescriptionForm,
  VisitAttachmentForm,
  VisitDetailsForm,
} from "@/components/forms/doctor-visit-forms";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDoctorAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import {
  createDiagnosisAction,
  createLabResultAction,
  createPrescriptionAction,
  createVisitAttachmentAction,
  upsertInvoiceAction,
  updateVisitDetailsAction,
} from "@/server/actions/doctor";
import { cn } from "@/lib/utils";

export default async function DoctorVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireDoctorAccess();
  const { id } = await params;
  const visit = await prisma.visit.findFirst({
    where: {
      id,
      doctor: {
        userId: session.user.id,
      },
    },
    include: {
      pet: {
        include: {
          owner: true,
        },
      },
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
  });

  if (!visit) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card className="border-[#cfe8df] bg-[linear-gradient(135deg,#f4fcfa_0%,#eaf7f3_100%)]">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              {visit.pet.name} · {visit.appointment.service.name}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Усі дані по цьому прийому розкладені по секціях, щоб було простіше заповнювати запис і нічого не загубити.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/doctor/patients/${visit.pet.id}`} className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
              Картка пацієнта
            </Link>
            <Link href="/doctor/schedule" className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}>
              До розкладу
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]">
        <CardHeader>
          <CardTitle>Коротко про прийом</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Власник</p>
            <p className="font-medium">{visit.pet.owner.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Дата прийому</p>
            <p className="font-medium">{visit.appointment.date.toLocaleDateString("uk-UA")} · {visit.appointment.startTime}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Послуга</p>
            <p className="font-medium">{visit.appointment.service.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Статус візиту</p>
            <p className="font-medium">{visit.status}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-white">
        <CardHeader>
          <CardTitle>Що було на прийомі</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitDetailsForm visit={visit} action={updateVisitDetailsAction} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle>Діагнози</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <DiagnosisForm visitId={visit.id} action={createDiagnosisAction} />
            <ExistingDiagnoses diagnoses={visit.diagnoses} />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle>Призначення</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <PrescriptionForm visitId={visit.id} action={createPrescriptionAction} />
            <ExistingPrescriptions prescriptions={visit.prescriptions} />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle>Аналізи та результати</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <LabResultForm visitId={visit.id} action={createLabResultAction} />
            <ExistingLabResults labResults={visit.labResults} />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle>Оплата</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm visitId={visit.id} invoice={visit.invoice} action={upsertInvoiceAction} />
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white">
          <CardHeader>
            <CardTitle>Додані файли</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <VisitAttachmentForm visitId={visit.id} action={createVisitAttachmentAction} />
            <ExistingAttachments attachments={visit.attachments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
