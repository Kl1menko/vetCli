"use client";

import { useActionState } from "react";

import type { Diagnosis, FileAsset, Invoice, LabResult, Prescription, Visit } from "@prisma/client";

import { EmptyState } from "@/components/shared/empty-state";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { DoctorActionState } from "@/server/actions/doctor";

const initialState: DoctorActionState = {};

function ActionMessage({ state }: { state: DoctorActionState }) {
  return <ActionFeedback error={state.error} success={state.success} errorTitle="Помилка" successTitle="Збережено" />;
}

type ActionFn = (
  state: DoctorActionState,
  formData: FormData,
) => Promise<DoctorActionState>;

export function VisitDetailsForm({
  visit,
  action,
}: {
  visit: Pick<Visit, "id" | "summary" | "anamnesis" | "examination" | "recommendations" | "status">;
  action: ActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: "Візит оновлено",
    errorTitle: "Не вдалося зберегти візит",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="visitId" value={visit.id} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="visit-status">Статус</Label>
        <select id="visit-status" name="status" defaultValue={visit.status} className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm">
          <option value="DRAFT">Чернетка</option>
          <option value="IN_PROGRESS">У роботі</option>
          <option value="COMPLETED">Завершено</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="visit-summary">Підсумок</Label>
        <Textarea id="visit-summary" name="summary" defaultValue={visit.summary ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="visit-anamnesis">Анамнез</Label>
        <Textarea id="visit-anamnesis" name="anamnesis" defaultValue={visit.anamnesis ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="visit-examination">Огляд</Label>
        <Textarea id="visit-examination" name="examination" defaultValue={visit.examination ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="visit-recommendations">Рекомендації</Label>
        <Textarea id="visit-recommendations" name="recommendations" defaultValue={visit.recommendations ?? ""} />
      </div>
      <ActionMessage state={state} />
      <Button type="submit" disabled={isPending}>Зберегти візит</Button>
    </form>
  );
}

export function DiagnosisForm({
  visitId,
  action,
}: {
  visitId: string;
  action: ActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: "Діагноз додано",
    errorTitle: "Не вдалося додати діагноз",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="visitId" value={visitId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="diagnosis-title">Назва діагнозу</Label>
        <Input id="diagnosis-title" name="title" placeholder="Гастроентерит" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="diagnosis-status">Статус</Label>
        <select id="diagnosis-status" name="status" defaultValue="ACTIVE" className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm">
          <option value="ACTIVE">Активний</option>
          <option value="RESOLVED">Вирішено</option>
          <option value="CHRONIC">Хронічний</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="diagnosis-description">Опис</Label>
        <Textarea id="diagnosis-description" name="description" />
      </div>
      <ActionMessage state={state} />
      <Button type="submit" disabled={isPending}>Додати діагноз</Button>
    </form>
  );
}

export function PrescriptionForm({
  visitId,
  action,
}: {
  visitId: string;
  action: ActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: "Призначення додано",
    errorTitle: "Не вдалося додати призначення",
  });

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="visitId" value={visitId} />
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="prescription-medication">Препарат</Label>
        <Input id="prescription-medication" name="medicationName" placeholder="VetBio" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="prescription-dosage">Дозування</Label>
        <Input id="prescription-dosage" name="dosage" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="prescription-frequency">Частота</Label>
        <Input id="prescription-frequency" name="frequency" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="prescription-duration">Тривалість</Label>
        <Input id="prescription-duration" name="duration" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="prescription-startDate">Початок</Label>
        <Input id="prescription-startDate" name="startDate" type="date" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="prescription-endDate">Кінець</Label>
        <Input id="prescription-endDate" name="endDate" type="date" />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="prescription-instructions">Інструкції</Label>
        <Textarea id="prescription-instructions" name="instructions" />
      </div>
      <div className="md:col-span-2">
        <ActionMessage state={state} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>Додати призначення</Button>
      </div>
    </form>
  );
}

export function LabResultForm({
  visitId,
  action,
}: {
  visitId: string;
  action: ActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: "Аналіз додано",
    errorTitle: "Не вдалося додати аналіз",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="visitId" value={visitId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="lab-title">Назва аналізу</Label>
        <Input id="lab-title" name="title" placeholder="Загальний аналіз крові" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lab-file">Файл аналізу</Label>
        <Input id="lab-file" name="file" type="file" accept=".pdf,image/jpeg,image/png,image/webp" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lab-comment">Коментар</Label>
        <Textarea id="lab-comment" name="comment" />
      </div>
      <ActionMessage state={state} />
      <Button type="submit" disabled={isPending}>Додати результат</Button>
    </form>
  );
}

export function InvoiceForm({
  visitId,
  invoice,
  action,
}: {
  visitId: string;
  invoice?: Pick<Invoice, "totalAmount" | "paymentStatus" | "fileUrl" | "note"> | null;
  action: ActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: "Рахунок збережено",
    errorTitle: "Не вдалося зберегти рахунок",
  });

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="visitId" value={visitId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="invoice-totalAmount">Сума</Label>
        <Input
          id="invoice-totalAmount"
          name="totalAmount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={invoice?.totalAmount?.toString() ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="invoice-paymentStatus">Статус оплати</Label>
        <select
          id="invoice-paymentStatus"
          name="paymentStatus"
          defaultValue={invoice?.paymentStatus ?? "UNPAID"}
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="UNPAID">Не оплачено</option>
          <option value="PARTIALLY_PAID">Оплачено частково</option>
          <option value="PAID">Оплачено</option>
          <option value="CANCELLED">Скасовано</option>
        </select>
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="invoice-fileUrl">Файл рахунку</Label>
        <Input id="invoice-fileUrl" name="file" type="file" accept=".pdf,image/jpeg,image/png,image/webp" />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="invoice-note">Нотатка</Label>
        <Textarea id="invoice-note" name="note" defaultValue={invoice?.note ?? ""} />
      </div>
      <div className="md:col-span-2">
        <ActionMessage state={state} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>Зберегти рахунок</Button>
      </div>
    </form>
  );
}

export function VisitAttachmentForm({
  visitId,
  action,
}: {
  visitId: string;
  action: ActionFn;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: "Вкладення додано",
    errorTitle: "Не вдалося додати вкладення",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="visitId" value={visitId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="attachment-file">Файл вкладення</Label>
        <Input id="attachment-file" name="file" type="file" accept=".pdf,image/jpeg,image/png,image/webp" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="attachment-note">Нотатка</Label>
        <Textarea id="attachment-note" name="note" />
      </div>
      <ActionMessage state={state} />
      <Button type="submit" disabled={isPending}>Додати вкладення</Button>
    </form>
  );
}

export function ExistingDiagnoses({ diagnoses }: { diagnoses: Array<Pick<Diagnosis, "id" | "title" | "description" | "status">> }) {
  return diagnoses.length ? (
    <div className="grid gap-3">
      {diagnoses.map((diagnosis) => (
        <div key={diagnosis.id} className="rounded-2xl border border-border p-4">
          <p className="font-medium">{diagnosis.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{diagnosis.status}</p>
          <p className="mt-2 text-sm text-muted-foreground">{diagnosis.description ?? "Без опису"}</p>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState title="Діагнозів поки немає" className="min-h-28" />
  );
}

export function ExistingPrescriptions({
  prescriptions,
}: {
  prescriptions: Array<Pick<Prescription, "id" | "medicationName" | "dosage" | "frequency" | "duration" | "instructions">>;
}) {
  return prescriptions.length ? (
    <div className="grid gap-3">
      {prescriptions.map((prescription) => (
        <div key={prescription.id} className="rounded-2xl border border-border p-4">
          <p className="font-medium">{prescription.medicationName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {prescription.dosage ?? "Без дозування"} · {prescription.frequency ?? "Без частоти"} · {prescription.duration ?? "Без тривалості"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{prescription.instructions ?? "Без інструкцій"}</p>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState title="Призначень поки немає" className="min-h-28" />
  );
}

export function ExistingLabResults({
  labResults,
}: {
  labResults: Array<Pick<LabResult, "id" | "title" | "comment" | "fileUrl">>;
}) {
  return labResults.length ? (
    <div className="grid gap-3">
      {labResults.map((labResult) => (
        <div key={labResult.id} className="rounded-2xl border border-border p-4">
          <p className="font-medium">{labResult.title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{labResult.comment ?? "Без коментаря"}</p>
          <a href={labResult.fileUrl} className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
            Відкрити файл
          </a>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState title="Аналізів поки немає" className="min-h-28" />
  );
}

export function ExistingAttachments({
  attachments,
}: {
  attachments: Array<Pick<FileAsset, "id" | "originalName" | "note" | "fileUrl" | "mimeType" | "sizeBytes">>;
}) {
  return attachments.length ? (
    <div className="grid gap-3">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="rounded-2xl border border-border p-4">
          <p className="font-medium">{attachment.originalName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {attachment.mimeType} · {(attachment.sizeBytes / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{attachment.note ?? "Без нотатки"}</p>
          <a href={attachment.fileUrl} className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
            Відкрити файл
          </a>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState title="Вкладень поки немає" className="min-h-28" />
  );
}
