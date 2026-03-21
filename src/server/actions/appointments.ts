"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  assertAppointmentStatusTransition,
  isTerminalAppointmentStatus,
} from "@/lib/appointments";
import { assertPetIsActive } from "@/lib/pets";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations/appointment";
import { getAvailableBookingSlots } from "@/server/services/appointments/availability";
import { assertAppointmentAvailability } from "@/server/services/appointments/validation";

export type AppointmentActionState = {
  error?: string;
  success?: string;
};

async function getClientOwnerProfile(userId: string) {
  return prisma.ownerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
}

export async function createAppointmentAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CLIENT") {
    return {
      ok: false,
      message: "Для онлайн-запису увійди як клієнт.",
    };
  }

  const payload = bookingSchema.parse({
    petId: formData.get("petId"),
    serviceId: formData.get("serviceId"),
    doctorId: formData.get("doctorId"),
    date: formData.get("date"),
    time: formData.get("time"),
    comment: formData.get("comment"),
  });

  const ownerProfile = await getClientOwnerProfile(session.user.id);

  if (!ownerProfile) {
    return {
      ok: false,
      message: "Не вдалося знайти профіль власника.",
    };
  }

  const [pet, availableSlots] = await Promise.all([
    prisma.pet.findFirst({
      where: {
        id: payload.petId,
        ownerId: ownerProfile.id,
        isArchived: false,
      },
      select: { id: true, isArchived: true },
    }),
    getAvailableBookingSlots({
      doctorId: payload.doctorId,
      serviceId: payload.serviceId,
      date: payload.date,
    }),
  ]);

  try {
    assertPetIsActive(pet, "Обрана тварина не належить Вашому кабінету.");
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Обрана тварина не належить Вашому кабінету.",
    };
  }

  if (!availableSlots.includes(payload.time)) {
    return {
      ok: false,
      message: "Обраний час уже недоступний. Онови список часу.",
    };
  }

  let date: Date;
  let endTime: string;

  try {
    const availability = await assertAppointmentAvailability({
      doctorId: payload.doctorId,
      serviceId: payload.serviceId,
      date: payload.date,
      startTime: payload.time,
    });

    date = availability.date;
    endTime = availability.endTime;
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Обраний час уже недоступний.",
    };
  }

  const selectedDateTime = new Date(`${payload.date}T${payload.time}:00`);

  if (selectedDateTime <= new Date()) {
    return {
      ok: false,
      message: "Не можна бронювати минулий час.",
    };
  }

  await prisma.appointment.create({
    data: {
      ownerId: ownerProfile.id,
      petId: payload.petId,
      doctorId: payload.doctorId,
      serviceId: payload.serviceId,
      source: "CLIENT_CABINET",
      date,
      startTime: payload.time,
      endTime,
      status: "PENDING",
      comment: payload.comment,
      createdByUserId: session.user.id,
    },
  });

  revalidatePath("/booking");
  revalidatePath("/cabinet/appointments");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/calendar");

  return {
    ok: true,
    message: "Запис створено. Очікуй підтвердження від клініки.",
    payload,
  };
}

export async function cancelAppointmentAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CLIENT") {
    throw new Error("Для скасування потрібно увійти як клієнт.");
  }

  const appointmentId = String(formData.get("appointmentId") ?? "");

  if (!appointmentId) {
    throw new Error("Не вдалося визначити запис.");
  }

  const ownerProfile = await getClientOwnerProfile(session.user.id);

  if (!ownerProfile) {
    throw new Error("Не вдалося знайти профіль власника.");
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      ownerId: ownerProfile.id,
    },
    select: {
      id: true,
      date: true,
      status: true,
    },
  });

  if (!appointment) {
    throw new Error("Запис не знайдено або доступ заборонено.");
  }

  if (appointment.date < new Date()) {
    throw new Error("Минулий запис уже не можна скасувати з кабінету.");
  }

  if (isTerminalAppointmentStatus(appointment.status)) {
    throw new Error("Цей запис уже має фінальний статус і не може бути скасований.");
  }

  assertAppointmentStatusTransition({
    current: appointment.status,
    next: "CANCELLED_BY_CLIENT",
    actor: "CLIENT",
  });

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: "CANCELLED_BY_CLIENT",
    },
  });

  revalidatePath("/cabinet/appointments");
  revalidatePath("/cabinet");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/calendar");
  revalidatePath("/doctor/appointments");
}

export async function cancelAppointmentFormAction(
  _prevState: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  try {
    await cancelAppointmentAction(formData);
    return { success: "Запис скасовано." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося скасувати запис." };
  }
}

export async function rescheduleAppointmentAction(
  _prevState: AppointmentActionState,
  formData: FormData,
): Promise<AppointmentActionState> {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "CLIENT") {
      return { error: "Для перенесення потрібно увійти як клієнт." };
    }

    const appointmentId = String(formData.get("appointmentId") ?? "");

    if (!appointmentId) {
      return { error: "Не вдалося визначити запис." };
    }

    const payload = bookingSchema.safeParse({
      petId: formData.get("petId"),
      serviceId: formData.get("serviceId"),
      doctorId: formData.get("doctorId"),
      date: formData.get("date"),
      time: formData.get("time"),
      comment: formData.get("comment"),
    });

    if (!payload.success) {
      return { error: payload.error.issues[0]?.message ?? "Перевір дані перенесення." };
    }

    const ownerProfile = await getClientOwnerProfile(session.user.id);

    if (!ownerProfile) {
      return { error: "Не вдалося знайти профіль власника." };
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        ownerId: ownerProfile.id,
      },
      select: {
        id: true,
        petId: true,
        serviceId: true,
        comment: true,
        status: true,
      },
    });

    if (!appointment) {
      return { error: "Запис не знайдено або доступ заборонено." };
    }

    if (isTerminalAppointmentStatus(appointment.status)) {
      return { error: "Запис уже має фінальний статус і не може бути перенесений." };
    }

    const availableSlots = await getAvailableBookingSlots({
        doctorId: payload.data.doctorId,
        serviceId: appointment.serviceId,
        date: payload.data.date,
      });

    if (!availableSlots.includes(payload.data.time)) {
      return { error: "Обраний час уже недоступний. Онови список часу." };
    }

    const { date, endTime } = await assertAppointmentAvailability({
      doctorId: payload.data.doctorId,
      serviceId: appointment.serviceId,
      date: payload.data.date,
      startTime: payload.data.time,
      appointmentId: appointment.id,
    });

    assertAppointmentStatusTransition({
      current: appointment.status,
      next: "RESCHEDULED",
      actor: "CLIENT",
    });

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        doctorId: payload.data.doctorId,
        date,
        startTime: payload.data.time,
        endTime,
        comment: payload.data.comment,
        status: "RESCHEDULED",
      },
    });

    revalidatePath("/cabinet/appointments");
    revalidatePath("/cabinet");
    revalidatePath("/admin/appointments");
    revalidatePath("/admin/calendar");
    revalidatePath("/doctor/appointments");

    return { success: "Запис успішно перенесено." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Не вдалося перенести запис.",
    };
  }
}
