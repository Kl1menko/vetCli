"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import {
  assertAppointmentStatusTransition,
  blockingAppointmentStatuses,
  isTerminalAppointmentStatus,
} from "@/lib/appointments";
import { hashPassword } from "@/lib/auth/password";
import { assertPetIsActive, buildPetArchivePayload } from "@/lib/pets";
import { canAccessAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  assertDoctorScheduleWindow,
  doctorScheduleFormSchema,
  getDoctorScheduleFieldErrorMessage,
  normalizeDoctorSchedulePayload,
} from "@/lib/schedules";
import { assertAppointmentAvailability } from "@/server/services/appointments/validation";

export type AdminActionState = {
  error?: string;
  success?: string;
};

const clientSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const petSchema = z.object({
  ownerId: z.string().min(1),
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  microchipNumber: z.string().optional(),
  notes: z.string().optional(),
});

const doctorSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  specialization: z.string().min(2),
  bio: z.string().optional(),
  isActive: z.boolean().optional(),
});

const serviceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  durationMinutes: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  category: z.string().min(2),
  isActive: z.boolean().optional(),
  isOnlineBookable: z.boolean().optional(),
});

const clinicSettingsSchema = z.object({
  name: z.string().trim().min(2),
  city: z.string().trim().min(2),
  address: z.string().trim().min(5),
  phone: z.string().trim().min(10),
  email: z.email(),
  hours: z.string().trim().min(3),
  closedDay: z.string().trim().min(2),
});

const appointmentSchema = z.object({
  ownerId: z.string().min(1),
  petId: z.string().min(1),
  doctorId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  comment: z.string().optional(),
  status: z
    .enum([
      "NEW",
      "PENDING",
      "CONFIRMED",
      "RESCHEDULED",
      "CANCELLED_BY_CLIENT",
      "CANCELLED_BY_ADMIN",
      "COMPLETED",
      "NO_SHOW",
    ])
    .optional(),
});

const scheduleBlockSchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  reason: z.string().optional(),
  type: z.enum(["VACATION", "BREAK", "MANUAL_BLOCK", "EMERGENCY_RESERVE"]),
});

async function requireAdminActionAccess() {
  const session = await auth();

  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    throw new Error("Дія доступна лише адміністратору.");
  }

  return session;
}

function revalidateAdminData() {
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/pets");
  revalidatePath("/admin/doctors");
  revalidatePath("/admin/services");
  revalidatePath("/admin/settings");
  revalidatePath("/booking");
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/appointments");
  revalidatePath("/cabinet/pets");
  revalidatePath("/doctor/appointments");
}

function buildPhoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized.startsWith("+") ? `tel:${normalized}` : `tel:+${normalized}`;
}

type ClinicSettingsRow = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
  hours: string;
  closedDay: string;
};

function toDayStart(dateString: string) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getFieldErrorMessage(result: z.ZodSafeParseError<unknown>) {
  const issue = result.error.issues[0];

  if (!issue) {
    return "Перевірте, будь ласка, заповнені поля.";
  }

  if (issue.path[0] === "password") {
    return "Тимчасовий пароль має містити щонайменше 8 символів.";
  }

  if (issue.path[0] === "email") {
    return "Вкажіть коректний email.";
  }

  if (issue.path[0] === "phone") {
    return "Вкажіть коректний номер телефону.";
  }

  if (issue.path[0] === "fullName") {
    return "Вкажіть ім'я та прізвище.";
  }

  if (issue.path[0] === "specialization") {
    return "Вкажіть спеціалізацію лікаря.";
  }

  if (issue.path[0] === "name") {
    return "Вкажіть назву.";
  }

  if (issue.path[0] === "slug") {
    return "Вкажіть системну назву для URL.";
  }

  if (issue.path[0] === "category") {
    return "Вкажіть категорію послуги.";
  }

  if (issue.path[0] === "durationMinutes") {
    return "Вкажіть коректну тривалість послуги в хвилинах.";
  }

  if (issue.path[0] === "price") {
    return "Вкажіть коректну вартість послуги.";
  }

  if (issue.path[0] === "description") {
    return "Опис послуги має містити щонайменше 10 символів.";
  }

  if (issue.path[0] === "city") {
    return "Вкажіть місто клініки.";
  }

  if (issue.path[0] === "address") {
    return "Вкажіть адресу клініки.";
  }

  if (issue.path[0] === "hours") {
    return "Вкажіть години роботи клініки.";
  }

  if (issue.path[0] === "closedDay") {
    return "Вкажіть вихідний або спеціальний режим роботи.";
  }

  if (issue.path[0] === "ownerId") {
    return "Оберіть клієнта для запису.";
  }

  if (issue.path[0] === "petId") {
    return "Оберіть тварину для запису.";
  }

  if (issue.path[0] === "doctorId") {
    return "Оберіть лікаря.";
  }

  if (issue.path[0] === "serviceId") {
    return "Оберіть послугу.";
  }

  if (issue.path[0] === "date") {
    return "Оберіть дату запису.";
  }

  if (issue.path[0] === "startTime") {
    return "Оберіть час запису.";
  }

  return "Перевірте, будь ласка, заповнені поля.";
}

async function assertPetBelongsToOwner(ownerId: string, petId: string) {
  const pet = await prisma.pet.findFirst({
    where: {
      id: petId,
      ownerId,
      isArchived: false,
    },
    select: { id: true, isArchived: true },
  });

  assertPetIsActive(pet, "Обрана тварина не належить вибраному клієнту.");
}

async function assertScheduleBlockAvailability(payload: {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  blockId?: string;
}) {
  const date = toDayStart(payload.date);
  const weekday = date.getDay() || 7;
  const startMinutes = toMinutes(payload.startTime);
  const endMinutes = toMinutes(payload.endTime);

  if (endMinutes <= startMinutes) {
    throw new Error("Час завершення блокування має бути пізніше за час початку.");
  }

  const [schedule, appointments, blocks] = await Promise.all([
    prisma.doctorSchedule.findFirst({
      where: { doctorId: payload.doctorId, weekday, isActive: true },
      select: { startTime: true, endTime: true },
    }),
    prisma.appointment.findMany({
      where: {
        doctorId: payload.doctorId,
        date,
        status: {
          in: blockingAppointmentStatuses,
        },
      },
      select: { id: true, startTime: true, endTime: true },
    }),
    prisma.scheduleBlock.findMany({
      where: {
        doctorId: payload.doctorId,
        date,
        ...(payload.blockId ? { id: { not: payload.blockId } } : {}),
      },
      select: { id: true, startTime: true, endTime: true },
    }),
  ]);

  if (!schedule) {
    throw new Error("Неможливо створити блок без активного графіка лікаря на цю дату.");
  }

  const workingStart = toMinutes(schedule.startTime);
  const workingEnd = toMinutes(schedule.endTime);

  if (startMinutes < workingStart || endMinutes > workingEnd) {
    throw new Error("Блокування виходить за межі робочого графіка лікаря.");
  }

  const overlapsAppointment = appointments.find((appointment) => {
    const appointmentStart = toMinutes(appointment.startTime);
    const appointmentEnd = toMinutes(appointment.endTime);
    return startMinutes < appointmentEnd && endMinutes > appointmentStart;
  });

  if (overlapsAppointment) {
    throw new Error("Не можна заблокувати слот, у якому вже є запис.");
  }

  const overlapsBlock = blocks.find((block) => {
    const blockStart = toMinutes(block.startTime);
    const blockEnd = toMinutes(block.endTime);
    return startMinutes < blockEnd && endMinutes > blockStart;
  });

  if (overlapsBlock) {
    throw new Error("Цей проміжок уже перекритий іншим блокуванням.");
  }

  return { date };
}

export async function createClientAction(formData: FormData) {
  await requireAdminActionAccess();

  const result = clientSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    throw new Error(getFieldErrorMessage(result));
  }

  const payload = result.data;

  const passwordHash = await hashPassword(payload.password);

  try {
    await prisma.user.create({
      data: {
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        passwordHash,
        role: "CLIENT",
        ownerProfile: {
          create: {
            fullName: payload.fullName,
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            notes: payload.notes,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Клієнт з таким email або телефоном уже існує.");
    }

    throw error;
  }

  revalidateAdminData();
}

export async function createClientFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await createClientAction(formData);
    return { success: "Клієнта створено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося створити клієнта." };
  }
}

export async function createPetAction(formData: FormData) {
  await requireAdminActionAccess();

  const payload = petSchema.parse({
    ownerId: formData.get("ownerId"),
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed"),
    microchipNumber: formData.get("microchipNumber"),
    notes: formData.get("notes"),
  });

  await prisma.pet.create({
    data: payload,
  });

  revalidateAdminData();
}

export async function createPetFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await createPetAction(formData);
    return { success: "Тварину додано." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося додати тварину." };
  }
}

export async function createDoctorAction(formData: FormData) {
  await requireAdminActionAccess();

  const result = doctorSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    specialization: formData.get("specialization"),
    bio: formData.get("bio"),
    isActive: formData.get("isActive") === "on",
  });

  if (!result.success) {
    throw new Error(getFieldErrorMessage(result));
  }

  const payload = result.data;

  const passwordHash = await hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      name: payload.fullName,
      email: payload.email,
      passwordHash,
      role: "DOCTOR",
    },
  });

  await prisma.doctor.create({
    data: {
      userId: user.id,
      fullName: payload.fullName,
      specialization: payload.specialization,
      bio: payload.bio,
      isActive: payload.isActive ?? true,
    },
  });

  revalidateAdminData();
}

export async function createDoctorFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await createDoctorAction(formData);
    return { success: "Лікаря створено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося створити лікаря." };
  }
}

export async function createServiceAction(formData: FormData) {
  await requireAdminActionAccess();

  const result = serviceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
    category: formData.get("category"),
    isActive: formData.get("isActive") === "on",
    isOnlineBookable: formData.get("isOnlineBookable") === "on",
  });

  if (!result.success) {
    throw new Error(getFieldErrorMessage(result));
  }

  const payload = result.data;

  await prisma.service.create({
    data: {
      ...payload,
      price: payload.price,
      isActive: payload.isActive ?? true,
      isOnlineBookable: payload.isOnlineBookable ?? true,
    },
  });

  revalidateAdminData();
}

export async function createServiceFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await createServiceAction(formData);
    return { success: "Послугу створено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося створити послугу." };
  }
}

export async function updateClinicSettingsAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdminActionAccess();

    const parsed = clinicSettingsSchema.safeParse({
      name: formData.get("name"),
      city: formData.get("city"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      hours: formData.get("hours"),
      closedDay: formData.get("closedDay"),
    });

    if (!parsed.success) {
      return { error: getFieldErrorMessage(parsed) };
    }

    const data = parsed.data;

    const phoneHref = buildPhoneHref(data.phone);

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "ClinicSettings" ("id", "name", "city", "address", "phone", "phoneHref", "email", "hours", "closedDay", "createdAt", "updatedAt")
      VALUES (
        'default',
        ${data.name},
        ${data.city},
        ${data.address},
        ${data.phone},
        ${phoneHref},
        ${data.email},
        ${data.hours},
        ${data.closedDay},
        NOW(),
        NOW()
      )
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "city" = EXCLUDED."city",
        "address" = EXCLUDED."address",
        "phone" = EXCLUDED."phone",
        "phoneHref" = EXCLUDED."phoneHref",
        "email" = EXCLUDED."email",
        "hours" = EXCLUDED."hours",
        "closedDay" = EXCLUDED."closedDay",
        "updatedAt" = NOW()
    `);

    const [savedSettings] = await prisma.$queryRaw<ClinicSettingsRow[]>(Prisma.sql`
      SELECT "id", "name", "city", "address", "phone", "phoneHref", "email", "hours", "closedDay"
      FROM "ClinicSettings"
      WHERE "id" = 'default'
      LIMIT 1
    `);

    if (!savedSettings) {
      return { error: "Налаштування збережено, але не вдалося підтвердити запис у базі." };
    }

    revalidateAdminData();

    return { success: "Налаштування клініки збережено." };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Не вдалося зберегти налаштування клініки." };
  }
}

export async function createAdminAppointmentAction(formData: FormData) {
  await requireAdminActionAccess();

  const result = appointmentSchema.safeParse({
    ownerId: formData.get("ownerId"),
    petId: formData.get("petId"),
    doctorId: formData.get("doctorId"),
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    comment: formData.get("comment"),
    status: "CONFIRMED",
  });

  if (!result.success) {
    throw new Error(getFieldErrorMessage(result));
  }

  const payload = result.data;

  await assertPetBelongsToOwner(payload.ownerId, payload.petId);

  const { date, endTime } = await assertAppointmentAvailability(payload);

  await prisma.appointment.create({
    data: {
      ownerId: payload.ownerId,
      petId: payload.petId,
      doctorId: payload.doctorId,
      serviceId: payload.serviceId,
      source: "ADMIN_MANUAL",
      date,
      startTime: payload.startTime,
      endTime,
      status: payload.status ?? "CONFIRMED",
      comment: payload.comment,
    },
  });

  revalidateAdminData();
}

export async function createAdminAppointmentFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await createAdminAppointmentAction(formData);
    return { success: "Запис створено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося створити запис." };
  }
}

export async function updateAppointmentStatusAction(formData: FormData) {
  await requireAdminActionAccess();

  const appointmentId = z.string().parse(formData.get("appointmentId"));
  const status = z
    .enum([
      "NEW",
      "PENDING",
      "CONFIRMED",
      "RESCHEDULED",
      "CANCELLED_BY_CLIENT",
      "CANCELLED_BY_ADMIN",
      "COMPLETED",
      "NO_SHOW",
    ])
    .parse(formData.get("status"));

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      status: true,
      visit: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("Запис не знайдено.");
  }

  assertAppointmentStatusTransition({
    current: appointment.status,
    next: status,
    actor: "ADMIN",
    hasCompletedVisit: appointment.visit?.status === "COMPLETED",
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  revalidateAdminData();
}

export async function updateAppointmentStatusFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await updateAppointmentStatusAction(formData);
    return { success: "Статус запису оновлено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося оновити статус запису." };
  }
}

export async function upsertDoctorScheduleAction(formData: FormData) {
  await requireAdminActionAccess();

  const doctorId = z.string().parse(formData.get("doctorId"));
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
      doctorId,
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
        doctorId,
        ...payload,
      },
    });
  }

  revalidateAdminData();
  revalidatePath("/admin/doctors");
  revalidatePath("/doctor/schedule");
}

export async function upsertDoctorScheduleFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await upsertDoctorScheduleAction(formData);
    return { success: "Графік збережено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося зберегти графік." };
  }
}

export async function deactivateDoctorScheduleAction(formData: FormData) {
  await requireAdminActionAccess();

  const doctorId = z.string().parse(formData.get("doctorId"));
  const weekday = z.coerce.number().int().min(1).max(7).parse(formData.get("weekday"));
  const existingSchedule = await prisma.doctorSchedule.findFirst({
    where: {
      doctorId,
      weekday,
    },
    select: { id: true },
  });

  if (!existingSchedule) {
    revalidateAdminData();
    revalidatePath("/admin/doctors");
    return;
  }

  await prisma.doctorSchedule.update({
    where: { id: existingSchedule.id },
    data: {
      isActive: false,
    },
  });

  revalidateAdminData();
  revalidatePath("/admin/doctors");
  revalidatePath("/doctor/schedule");
}

export async function deactivateDoctorScheduleFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await deactivateDoctorScheduleAction(formData);
    return { success: "День вимкнено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося вимкнути день." };
  }
}

export async function updateClientAction(formData: FormData) {
  await requireAdminActionAccess();

  const ownerProfileId = z.string().parse(formData.get("ownerProfileId"));
  const userId = z.string().parse(formData.get("userId"));
  const payload = clientSchema.omit({ password: true }).parse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
      },
    }),
    prisma.ownerProfile.update({
      where: { id: ownerProfileId },
      data: payload,
    }),
  ]);

  revalidateAdminData();
}

export async function updateClientFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await updateClientAction(formData);
    return { success: "Дані клієнта оновлено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося оновити клієнта." };
  }
}

export async function deleteClientAction(formData: FormData) {
  await requireAdminActionAccess();

  const userId = z.string().parse(formData.get("userId"));
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: "DISABLED" },
    }),
    ...(ownerProfile
      ? [
          prisma.appointment.updateMany({
            where: {
              ownerId: ownerProfile.id,
              date: {
                gte: new Date(),
              },
              status: {
                in: blockingAppointmentStatuses,
              },
            },
            data: {
              status: "CANCELLED_BY_ADMIN",
            },
          }),
        ]
      : []),
  ]);

  revalidateAdminData();
}

export async function deleteClientFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await deleteClientAction(formData);
    return { success: "Клієнта архівовано." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося архівувати клієнта." };
  }
}

export async function updatePetAction(formData: FormData) {
  await requireAdminActionAccess();

  const petId = z.string().parse(formData.get("petId"));
  const payload = petSchema.parse({
    ownerId: formData.get("ownerId"),
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed"),
    microchipNumber: formData.get("microchipNumber"),
    notes: formData.get("notes"),
  });

  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    select: { id: true, isArchived: true },
  });

  assertPetIsActive(pet, "Тварину не знайдено.");

  await prisma.pet.update({
    where: { id: petId },
    data: payload,
  });

  revalidateAdminData();
}

export async function updatePetFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await updatePetAction(formData);
    return { success: "Картку тварини оновлено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося оновити картку тварини." };
  }
}

export async function deletePetAction(formData: FormData) {
  await requireAdminActionAccess();

  const petId = z.string().parse(formData.get("petId"));

  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    select: { id: true, isArchived: true },
  });

  assertPetIsActive(pet, "Тварину не знайдено.");

  await prisma.pet.update({
    where: { id: petId },
    data: buildPetArchivePayload(),
  });

  revalidateAdminData();
}

export async function deletePetFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await deletePetAction(formData);
    return { success: "Тварину архівовано." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося архівувати тварину." };
  }
}

export async function updateDoctorAction(formData: FormData) {
  await requireAdminActionAccess();

  const doctorId = z.string().parse(formData.get("doctorId"));
  const userId = z.string().parse(formData.get("userId"));
  const payload = doctorSchema.omit({ password: true }).parse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    specialization: formData.get("specialization"),
    bio: formData.get("bio"),
    isActive: formData.get("isActive") === "on",
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: payload.fullName,
        email: payload.email,
      },
    }),
    prisma.doctor.update({
      where: { id: doctorId },
      data: {
        fullName: payload.fullName,
        specialization: payload.specialization,
        bio: payload.bio,
        isActive: payload.isActive ?? false,
      },
    }),
  ]);

  revalidateAdminData();
}

export async function updateDoctorFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await updateDoctorAction(formData);
    return { success: "Дані лікаря оновлено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося оновити лікаря." };
  }
}

export async function deleteDoctorAction(formData: FormData) {
  await requireAdminActionAccess();

  const userId = z.string().parse(formData.get("userId"));
  const doctorId = z.string().parse(formData.get("doctorId"));

  const activeAppointments = await prisma.appointment.count({
    where: {
      doctorId,
      date: {
        gte: new Date(),
      },
      status: {
        in: blockingAppointmentStatuses,
      },
    },
  });

  if (activeAppointments > 0) {
    throw new Error("Неможливо архівувати лікаря з майбутніми активними записами. Спершу перенеси або скасуй їх.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: "DISABLED" },
    }),
    prisma.doctor.update({
      where: { id: doctorId },
      data: { isActive: false },
    }),
  ]);

  revalidateAdminData();
}

export async function deleteDoctorFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await deleteDoctorAction(formData);
    return { success: "Лікаря архівовано." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося архівувати лікаря." };
  }
}

export async function updateServiceAction(formData: FormData) {
  await requireAdminActionAccess();

  const serviceId = z.string().parse(formData.get("serviceId"));
  const result = serviceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
    category: formData.get("category"),
    isActive: formData.get("isActive") === "on",
    isOnlineBookable: formData.get("isOnlineBookable") === "on",
  });

  if (!result.success) {
    throw new Error(getFieldErrorMessage(result));
  }

  const payload = result.data;

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      ...payload,
      isActive: payload.isActive ?? false,
      isOnlineBookable: payload.isOnlineBookable ?? false,
    },
  });

  revalidateAdminData();
}

export async function updateServiceFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await updateServiceAction(formData);
    return { success: "Послугу оновлено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося оновити послугу." };
  }
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdminActionAccess();

  const serviceId = z.string().parse(formData.get("serviceId"));
  await prisma.service.update({
    where: { id: serviceId },
    data: {
      isActive: false,
      isOnlineBookable: false,
    },
  });

  revalidateAdminData();
}

export async function deleteServiceFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await deleteServiceAction(formData);
    return { success: "Послугу деактивовано." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося деактивувати послугу." };
  }
}

export async function updateAppointmentAction(formData: FormData) {
  await requireAdminActionAccess();

  const appointmentId = z.string().parse(formData.get("appointmentId"));
  const payload = appointmentSchema.parse({
    ownerId: formData.get("ownerId"),
    petId: formData.get("petId"),
    doctorId: formData.get("doctorId"),
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    comment: formData.get("comment"),
    status: formData.get("status"),
  });

  await assertPetBelongsToOwner(payload.ownerId, payload.petId);

  const { date, endTime } = await assertAppointmentAvailability({
    ...payload,
    appointmentId,
  });

  const existingAppointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      ownerId: true,
      petId: true,
      serviceId: true,
      doctorId: true,
      date: true,
      startTime: true,
      status: true,
      visit: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!existingAppointment) {
    throw new Error("Запис не знайдено.");
  }

  const mutatesCoreFields =
    existingAppointment.ownerId !== payload.ownerId ||
    existingAppointment.petId !== payload.petId ||
    existingAppointment.serviceId !== payload.serviceId ||
    existingAppointment.doctorId !== payload.doctorId ||
    existingAppointment.startTime !== payload.startTime ||
    existingAppointment.date.toISOString().slice(0, 10) !== payload.date;

  if (isTerminalAppointmentStatus(existingAppointment.status) && mutatesCoreFields) {
    throw new Error("Термінальний запис не можна редагувати по часу, лікарю, послузі або пацієнту.");
  }

  assertAppointmentStatusTransition({
    current: existingAppointment.status,
    next: payload.status ?? existingAppointment.status,
    actor: "ADMIN",
    hasCompletedVisit: existingAppointment.visit?.status === "COMPLETED",
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      ownerId: payload.ownerId,
      petId: payload.petId,
      doctorId: payload.doctorId,
      serviceId: payload.serviceId,
      date,
      startTime: payload.startTime,
      endTime,
      comment: payload.comment,
      status:
        payload.status ??
        (existingAppointment &&
        (existingAppointment.doctorId !== payload.doctorId ||
          existingAppointment.startTime !== payload.startTime ||
          existingAppointment.date.toISOString().slice(0, 10) !== payload.date)
          ? "RESCHEDULED"
          : "CONFIRMED"),
    },
  });

  revalidateAdminData();
}

export async function deleteAppointmentAction(formData: FormData) {
  await requireAdminActionAccess();

  const appointmentId = z.string().parse(formData.get("appointmentId"));
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      status: true,
      visit: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("Запис не знайдено.");
  }

  if (appointment.visit?.id || appointment.status === "COMPLETED") {
    throw new Error("Завершений запис або запис із візитом не можна видаляти. Його можна лише скасувати або залишити в історії.");
  }

  if (isTerminalAppointmentStatus(appointment.status)) {
    if (appointment.status === "CANCELLED_BY_ADMIN") {
      revalidateAdminData();
      return;
    }

    throw new Error("Запис уже має фінальний статус і не може бути повторно скасований.");
  }

  assertAppointmentStatusTransition({
    current: appointment.status,
    next: "CANCELLED_BY_ADMIN",
    actor: "ADMIN",
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED_BY_ADMIN" },
  });

  revalidateAdminData();
}

export async function deleteAppointmentFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await deleteAppointmentAction(formData);
    return { success: "Запис скасовано." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося скасувати запис." };
  }
}

export async function createScheduleBlockAction(formData: FormData) {
  await requireAdminActionAccess();

  const payload = scheduleBlockSchema.parse({
    doctorId: formData.get("doctorId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    reason: formData.get("reason"),
    type: formData.get("type"),
  });

  const { date } = await assertScheduleBlockAvailability(payload);

  await prisma.scheduleBlock.create({
    data: {
      doctorId: payload.doctorId,
      date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      reason: payload.reason,
      type: payload.type,
    },
  });

  revalidateAdminData();
}

export async function createScheduleBlockFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await createScheduleBlockAction(formData);
    return { success: "Блок часу створено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося створити блок часу." };
  }
}

export async function updateScheduleBlockAction(formData: FormData) {
  await requireAdminActionAccess();

  const blockId = z.string().parse(formData.get("blockId"));
  const payload = scheduleBlockSchema.parse({
    doctorId: formData.get("doctorId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    reason: formData.get("reason"),
    type: formData.get("type"),
  });

  const { date } = await assertScheduleBlockAvailability({
    ...payload,
    blockId,
  });

  await prisma.scheduleBlock.update({
    where: { id: blockId },
    data: {
      doctorId: payload.doctorId,
      date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      reason: payload.reason,
      type: payload.type,
    },
  });

  revalidateAdminData();
}

export async function updateScheduleBlockFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await updateScheduleBlockAction(formData);
    return { success: "Блок часу оновлено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося оновити блок часу." };
  }
}

export async function deleteScheduleBlockAction(formData: FormData) {
  await requireAdminActionAccess();

  const blockId = z.string().parse(formData.get("blockId"));

  await prisma.scheduleBlock.delete({
    where: { id: blockId },
  });

  revalidateAdminData();
}

export async function deleteScheduleBlockFormAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await deleteScheduleBlockAction(formData);
    return { success: "Блок часу видалено." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося видалити блок часу." };
  }
}
