"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { assertAppointmentStatusTransition } from "@/lib/appointments";
import { createCabinetVisitNotification } from "@/lib/notifications";
import { canAccessDoctor } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  assertDoctorScheduleWindow,
  doctorScheduleFormSchema,
  getDoctorScheduleFieldErrorMessage,
  normalizeDoctorSchedulePayload,
} from "@/lib/schedules";
import { storeUploadedFile } from "@/lib/storage/upload";

export type DoctorActionState = {
  error?: string;
  success?: string;
};

const visitDetailsSchema = z.object({
  summary: z.string().optional(),
  anamnesis: z.string().optional(),
  examination: z.string().optional(),
  recommendations: z.string().optional(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED"]),
});

const diagnosisSchema = z.object({
  title: z.string().min(2, "Вкажи назву діагнозу."),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "RESOLVED", "CHRONIC"]),
});

const prescriptionSchema = z.object({
  medicationName: z.string().min(2, "Вкажи назву препарату."),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const labResultSchema = z.object({
  title: z.string().min(2, "Вкажи назву аналізу."),
  comment: z.string().optional(),
});

const invoiceSchema = z.object({
  totalAmount: z.coerce.number().positive("Сума має бути більшою за 0."),
  paymentStatus: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID", "CANCELLED"]),
  note: z.string().optional(),
});

const attachmentSchema = z.object({
  note: z.string().optional(),
});

async function requireDoctorActionAccess() {
  const session = await auth();

  if (!session?.user?.id || !canAccessDoctor(session.user.role)) {
    throw new Error("Дія доступна лише лікарю.");
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!doctor) {
    throw new Error("Профіль лікаря не знайдено.");
  }

  return {
    session,
    doctor,
  };
}

function revalidateDoctorData(visitId?: string, petId?: string) {
  revalidatePath("/doctor");
  revalidatePath("/doctor/appointments");
  revalidatePath("/doctor/schedule");

  if (petId) {
    revalidatePath(`/doctor/patients/${petId}`);
    revalidatePath(`/cabinet/pets/${petId}`);
  }

  if (visitId) {
    revalidatePath(`/doctor/visits/${visitId}`);
  }

  revalidatePath("/cabinet");
  revalidatePath("/cabinet/visits");
  revalidatePath("/cabinet/prescriptions");
  revalidatePath("/cabinet/lab-results");
  revalidatePath("/cabinet/invoices");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/visits");
  revalidatePath("/admin/invoices");
}

function revalidateDoctorScheduleData() {
  revalidatePath("/doctor/schedule");
  revalidatePath("/doctor");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/doctors");
  revalidatePath("/booking");
}

async function getDoctorAppointment(doctorId: string, appointmentId: string) {
  return prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctorId,
    },
    select: {
      id: true,
      petId: true,
      doctorId: true,
      status: true,
      visit: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });
}

async function getDoctorVisit(doctorId: string, visitId: string) {
  return prisma.visit.findFirst({
    where: {
      id: visitId,
      doctorId,
    },
    select: {
      id: true,
      petId: true,
      appointmentId: true,
      status: true,
      appointment: {
        select: {
          status: true,
        },
      },
    },
  });
}

export async function upsertOwnDoctorScheduleAction(formData: FormData) {
  const { doctor } = await requireDoctorActionAccess();
  const result = doctorScheduleFormSchema.safeParse({
    weekday: formData.get("weekday"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    slotDurationMinutes: formData.get("slotDurationMinutes"),
    breakStart: formData.get("breakStart") || undefined,
    breakEnd: formData.get("breakEnd") || undefined,
    isActive: formData.get("isActive") === "on",
  });

  if (!result.success) {
    throw new Error(getDoctorScheduleFieldErrorMessage(result));
  }

  const payload = normalizeDoctorSchedulePayload(result.data);
  assertDoctorScheduleWindow(payload);

  const existingSchedule = await prisma.doctorSchedule.findFirst({
    where: {
      doctorId: doctor.id,
      weekday: payload.weekday,
    },
    select: { id: true },
  });

  if (existingSchedule) {
    await prisma.doctorSchedule.update({
      where: { id: existingSchedule.id },
      data: payload,
    });
  } else {
    await prisma.doctorSchedule.create({
      data: {
        doctorId: doctor.id,
        ...payload,
      },
    });
  }

  revalidateDoctorScheduleData();
}

export async function upsertOwnDoctorScheduleFormAction(
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  try {
    await upsertOwnDoctorScheduleAction(formData);
    return { success: "Графік збережено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося зберегти графік." };
  }
}

export async function deactivateOwnDoctorScheduleAction(formData: FormData) {
  const { doctor } = await requireDoctorActionAccess();
  const weekday = z.coerce.number().int().min(1).max(7).parse(formData.get("weekday"));
  const existingSchedule = await prisma.doctorSchedule.findFirst({
    where: {
      doctorId: doctor.id,
      weekday,
    },
    select: { id: true },
  });

  if (!existingSchedule) {
    revalidateDoctorScheduleData();
    return;
  }

  await prisma.doctorSchedule.update({
    where: { id: existingSchedule.id },
    data: {
      isActive: false,
    },
  });

  revalidateDoctorScheduleData();
}

export async function deactivateOwnDoctorScheduleFormAction(
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  try {
    await deactivateOwnDoctorScheduleAction(formData);
    return { success: "День вимкнено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося вимкнути день." };
  }
}

export async function createVisitFromAppointmentAction(formData: FormData) {
  const { doctor } = await requireDoctorActionAccess();
  const appointmentId = z.string().parse(formData.get("appointmentId"));
  const appointment = await getDoctorAppointment(doctor.id, appointmentId);

  if (!appointment) {
    throw new Error("Прийом не знайдено або доступ заборонено.");
  }

  if (!["CONFIRMED", "RESCHEDULED"].includes(appointment.status)) {
    throw new Error("Візит можна створити лише для підтвердженого або перенесеного прийому.");
  }

  if (appointment.visit?.id) {
    revalidateDoctorData(appointment.visit.id, appointment.petId);
    return;
  }

  const visit = await prisma.visit.create({
    data: {
      appointmentId: appointment.id,
      petId: appointment.petId,
      doctorId: doctor.id,
      status: "DRAFT",
    },
    select: {
      id: true,
      petId: true,
    },
  });

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: "CONFIRMED",
    },
  });

  revalidateDoctorData(visit.id, visit.petId);
}

export async function createVisitFromAppointmentFormAction(
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  try {
    await createVisitFromAppointmentAction(formData);
    return { success: "Візит створено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося створити візит." };
  }
}

export async function updateVisitDetailsAction(
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  try {
    const { doctor } = await requireDoctorActionAccess();
    const visitId = z.string().parse(formData.get("visitId"));
    const visit = await getDoctorVisit(doctor.id, visitId);

    if (!visit) {
      return { error: "Візит не знайдено або доступ заборонено." };
    }

    const parsed = visitDetailsSchema.safeParse({
      summary: formData.get("summary") || undefined,
      anamnesis: formData.get("anamnesis") || undefined,
      examination: formData.get("examination") || undefined,
      recommendations: formData.get("recommendations") || undefined,
      status: formData.get("status") || "DRAFT",
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Перевір форму візиту." };
    }

    const nextAppointmentStatus = parsed.data.status === "COMPLETED" ? "COMPLETED" : "CONFIRMED";

    if (nextAppointmentStatus === "COMPLETED") {
      assertAppointmentStatusTransition({
        current: visit.appointment.status,
        next: "COMPLETED",
        actor: "DOCTOR_SYSTEM",
        hasCompletedVisit: true,
      });
    }

    await prisma.$transaction([
      prisma.visit.update({
        where: { id: visit.id },
        data: parsed.data,
      }),
      prisma.appointment.update({
        where: { id: visit.appointmentId },
        data: {
          status: parsed.data.status === "COMPLETED" ? "COMPLETED" : "CONFIRMED",
        },
      }),
    ]);

    if (parsed.data.status === "COMPLETED") {
      await createCabinetVisitNotification({
        visitId: visit.id,
        section: "visits",
        title: "Виписка після прийому готова",
        message: "Лікар завершив візит і додав підсумки та рекомендації.",
      });
    }

    revalidateDoctorData(visit.id, visit.petId);

    return { success: "Дані візиту оновлено." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Не вдалося оновити візит.",
    };
  }
}

export async function createDiagnosisAction(
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  try {
    const { doctor } = await requireDoctorActionAccess();
    const visitId = z.string().parse(formData.get("visitId"));
    const visit = await getDoctorVisit(doctor.id, visitId);

    if (!visit) {
      return { error: "Візит не знайдено або доступ заборонено." };
    }

    const parsed = diagnosisSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      status: formData.get("status") || "ACTIVE",
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Перевір діагноз." };
    }

    await prisma.diagnosis.create({
      data: {
        visitId,
        ...parsed.data,
      },
    });

    revalidateDoctorData(visit.id, visit.petId);

    return { success: "Діагноз додано." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Не вдалося додати діагноз.",
    };
  }
}

export async function createPrescriptionAction(
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  try {
    const { doctor } = await requireDoctorActionAccess();
    const visitId = z.string().parse(formData.get("visitId"));
    const visit = await getDoctorVisit(doctor.id, visitId);

    if (!visit) {
      return { error: "Візит не знайдено або доступ заборонено." };
    }

    const parsed = prescriptionSchema.safeParse({
      medicationName: formData.get("medicationName"),
      dosage: formData.get("dosage") || undefined,
      frequency: formData.get("frequency") || undefined,
      duration: formData.get("duration") || undefined,
      instructions: formData.get("instructions") || undefined,
      startDate: formData.get("startDate") || undefined,
      endDate: formData.get("endDate") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Перевір призначення." };
    }

    await prisma.prescription.create({
      data: {
        visitId,
        medicationName: parsed.data.medicationName,
        dosage: parsed.data.dosage,
        frequency: parsed.data.frequency,
        duration: parsed.data.duration,
        instructions: parsed.data.instructions,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      },
    });

    await createCabinetVisitNotification({
      visitId: visit.id,
      section: "prescriptions",
      title: "Нове призначення",
      message: `Лікар додав призначення: ${parsed.data.medicationName}.`,
    });

    revalidateDoctorData(visit.id, visit.petId);

    return { success: "Призначення додано." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Не вдалося додати призначення.",
    };
  }
}

export async function createLabResultAction(
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  try {
    const { doctor } = await requireDoctorActionAccess();
    const visitId = z.string().parse(formData.get("visitId"));
    const visit = await getDoctorVisit(doctor.id, visitId);

    if (!visit) {
      return { error: "Візит не знайдено або доступ заборонено." };
    }

    const parsed = labResultSchema.safeParse({
      title: formData.get("title"),
      comment: formData.get("comment") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Перевір дані аналізу." };
    }

    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { error: "Додай файл аналізу." };
    }

    const storedFile = await storeUploadedFile(file, {
      directory: `visits/${visit.id}/lab-results`,
    });

    await prisma.labResult.create({
      data: {
        visitId,
        title: parsed.data.title,
        comment: parsed.data.comment,
        fileUrl: storedFile.fileUrl,
      },
    });

    await createCabinetVisitNotification({
      visitId: visit.id,
      section: "lab-results",
      title: "Новий результат аналізу",
      message: `Лікар додав результат: ${parsed.data.title}.`,
      type: "LAB_RESULT_READY",
    });

    revalidateDoctorData(visit.id, visit.petId);

    return { success: "Результат аналізу додано." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Не вдалося додати аналіз.",
    };
  }
}

export async function upsertInvoiceAction(
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  try {
    const { doctor } = await requireDoctorActionAccess();
    const visitId = z.string().parse(formData.get("visitId"));
    const visit = await getDoctorVisit(doctor.id, visitId);

    if (!visit) {
      return { error: "Візит не знайдено або доступ заборонено." };
    }

    const parsed = invoiceSchema.safeParse({
      totalAmount: formData.get("totalAmount"),
      paymentStatus: formData.get("paymentStatus") || "UNPAID",
      note: formData.get("note") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Перевір дані рахунку." };
    }

    const file = formData.get("file");
    let fileUrl: string | null | undefined;

    if (file instanceof File && file.size > 0) {
      const storedFile = await storeUploadedFile(file, {
        directory: `visits/${visit.id}/invoices`,
      });

      fileUrl = storedFile.fileUrl;
    }

    await prisma.invoice.upsert({
      where: { visitId },
      update: {
        totalAmount: new Prisma.Decimal(parsed.data.totalAmount),
        paymentStatus: parsed.data.paymentStatus,
        fileUrl: fileUrl ?? undefined,
        note: parsed.data.note || null,
      },
      create: {
        visitId,
        totalAmount: new Prisma.Decimal(parsed.data.totalAmount),
        paymentStatus: parsed.data.paymentStatus,
        fileUrl: fileUrl ?? null,
        note: parsed.data.note || null,
      },
    });

    await createCabinetVisitNotification({
      visitId: visit.id,
      section: "invoices",
      title: "Оновлено чек або рахунок",
      message: "У кабінеті з'явився новий або оновлений рахунок після прийому.",
      type: "INVOICE_ISSUED",
    });

    revalidateDoctorData(visit.id, visit.petId);

    return { success: "Рахунок збережено." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Не вдалося зберегти рахунок.",
    };
  }
}

export async function createVisitAttachmentAction(
  _prevState: DoctorActionState,
  formData: FormData,
): Promise<DoctorActionState> {
  try {
    const { doctor, session } = await requireDoctorActionAccess();
    const visitId = z.string().parse(formData.get("visitId"));
    const visit = await getDoctorVisit(doctor.id, visitId);

    if (!visit) {
      return { error: "Візит не знайдено або доступ заборонено." };
    }

    const parsed = attachmentSchema.safeParse({
      note: formData.get("note") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Перевір вкладення." };
    }

    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { error: "Додай файл вкладення." };
    }

    const storedFile = await storeUploadedFile(file, {
      directory: `visits/${visit.id}/attachments`,
    });

    await prisma.fileAsset.create({
      data: {
        visitId: visit.id,
        uploadedByUserId: session.user.id,
        kind: "VISIT_ATTACHMENT",
        originalName: storedFile.originalName,
        fileUrl: storedFile.fileUrl,
        mimeType: storedFile.mimeType,
        sizeBytes: storedFile.sizeBytes,
        note: parsed.data.note || null,
      },
    });

    await createCabinetVisitNotification({
      visitId: visit.id,
      section: "lab-results",
      title: "Додано новий файл",
      message: "Лікар додав новий файл до матеріалів візиту.",
      type: "LAB_RESULT_READY",
    });

    revalidateDoctorData(visit.id, visit.petId);

    return { success: "Вкладення додано до візиту." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Не вдалося додати вкладення.",
    };
  }
}
