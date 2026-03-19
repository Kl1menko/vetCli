"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/auth";
import { hashPassword } from "@/lib/auth/password";
import { canAccessAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

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
  revalidatePath("/booking");
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/appointments");
  revalidatePath("/cabinet/pets");
  revalidatePath("/doctor/appointments");
}

function toDayStart(dateString: string) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
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
    return "Вкажіть ім'я та прізвище клієнта.";
  }

  return "Перевірте, будь ласка, заповнені поля.";
}

async function resolveAppointmentTiming(payload: {
  serviceId: string;
  date: string;
  startTime: string;
}) {
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
    select: { durationMinutes: true },
  });

  if (!service) {
    throw new Error("Послугу не знайдено.");
  }

  const [hours, minutes] = payload.startTime.split(":").map(Number);
  const date = toDayStart(payload.date);

  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + service.durationMinutes;
  const endTime = formatTime(endMinutes);

  return { date, endTime };
}

async function assertAppointmentAvailability(payload: {
  doctorId: string;
  serviceId: string;
  date: string;
  startTime: string;
  appointmentId?: string;
}) {
  const { date, endTime } = await resolveAppointmentTiming(payload);
  const weekday = date.getDay() || 7;

  const [service, schedule, blocks, appointments] = await Promise.all([
    prisma.service.findUnique({
      where: { id: payload.serviceId },
      select: { durationMinutes: true, name: true },
    }),
    prisma.doctorSchedule.findFirst({
      where: { doctorId: payload.doctorId, weekday, isActive: true },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        breakStart: true,
        breakEnd: true,
      },
    }),
    prisma.scheduleBlock.findMany({
      where: {
        doctorId: payload.doctorId,
        date,
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        reason: true,
      },
    }),
    prisma.appointment.findMany({
      where: {
        doctorId: payload.doctorId,
        date,
        ...(payload.appointmentId
          ? {
              id: {
                not: payload.appointmentId,
              },
            }
          : {}),
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
      },
    }),
  ]);

  if (!service) {
    throw new Error("Послугу не знайдено.");
  }

  if (!schedule) {
    throw new Error("Для цього лікаря на обрану дату немає активного графіка.");
  }

  const startMinutes = toMinutes(payload.startTime);
  const endMinutes = toMinutes(endTime);
  const workingStart = toMinutes(schedule.startTime);
  const workingEnd = toMinutes(schedule.endTime);

  if (startMinutes < workingStart || endMinutes > workingEnd) {
    throw new Error("Час прийому виходить за межі графіка лікаря.");
  }

  if (schedule.breakStart && schedule.breakEnd) {
    const breakStart = toMinutes(schedule.breakStart);
    const breakEnd = toMinutes(schedule.breakEnd);

    if (startMinutes < breakEnd && endMinutes > breakStart) {
      throw new Error("Обраний час перетинається з перервою лікаря.");
    }
  }

  const overlapsBlock = blocks.find((block) => {
    const blockStart = toMinutes(block.startTime);
    const blockEnd = toMinutes(block.endTime);
    return startMinutes < blockEnd && endMinutes > blockStart;
  });

  if (overlapsBlock) {
    throw new Error(overlapsBlock.reason ? `Слот заблокований: ${overlapsBlock.reason}` : "Слот заблокований адміністратором.");
  }

  const overlapsAppointment = appointments.find((appointment) => {
    const appointmentStart = toMinutes(appointment.startTime);
    const appointmentEnd = toMinutes(appointment.endTime);
    return startMinutes < appointmentEnd && endMinutes > appointmentStart;
  });

  if (overlapsAppointment) {
    throw new Error("На цей час уже існує інший запис.");
  }

  return {
    date,
    endTime,
    service,
  };
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

export async function createServiceAction(formData: FormData) {
  await requireAdminActionAccess();

  const payload = serviceSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
    category: formData.get("category"),
    isActive: formData.get("isActive") === "on",
    isOnlineBookable: formData.get("isOnlineBookable") === "on",
  });

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

export async function createAdminAppointmentAction(formData: FormData) {
  await requireAdminActionAccess();

  const payload = appointmentSchema.parse({
    ownerId: formData.get("ownerId"),
    petId: formData.get("petId"),
    doctorId: formData.get("doctorId"),
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    comment: formData.get("comment"),
    status: "CONFIRMED",
  });

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

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  revalidateAdminData();
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

export async function deleteClientAction(formData: FormData) {
  await requireAdminActionAccess();

  const userId = z.string().parse(formData.get("userId"));

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidateAdminData();
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

  await prisma.pet.update({
    where: { id: petId },
    data: payload,
  });

  revalidateAdminData();
}

export async function deletePetAction(formData: FormData) {
  await requireAdminActionAccess();

  const petId = z.string().parse(formData.get("petId"));

  await prisma.pet.delete({
    where: { id: petId },
  });

  revalidateAdminData();
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

export async function deleteDoctorAction(formData: FormData) {
  await requireAdminActionAccess();

  const userId = z.string().parse(formData.get("userId"));
  const doctorId = z.string().parse(formData.get("doctorId"));

  const relationsCount = await prisma.appointment.count({
    where: { doctorId },
  });

  if (relationsCount > 0) {
    throw new Error("Неможливо видалити лікаря з існуючими записами.");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidateAdminData();
}

export async function updateServiceAction(formData: FormData) {
  await requireAdminActionAccess();

  const serviceId = z.string().parse(formData.get("serviceId"));
  const payload = serviceSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
    category: formData.get("category"),
    isActive: formData.get("isActive") === "on",
    isOnlineBookable: formData.get("isOnlineBookable") === "on",
  });

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

export async function deleteServiceAction(formData: FormData) {
  await requireAdminActionAccess();

  const serviceId = z.string().parse(formData.get("serviceId"));

  const relationsCount = await prisma.appointment.count({
    where: { serviceId },
  });

  if (relationsCount > 0) {
    throw new Error("Неможливо видалити послугу, яка вже використовується в записах.");
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  revalidateAdminData();
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

  const { date, endTime } = await assertAppointmentAvailability({
    ...payload,
    appointmentId,
  });

  const existingAppointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      doctorId: true,
      date: true,
      startTime: true,
    },
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

  await prisma.appointment.delete({
    where: { id: appointmentId },
  });

  revalidateAdminData();
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

export async function deleteScheduleBlockAction(formData: FormData) {
  await requireAdminActionAccess();

  const blockId = z.string().parse(formData.get("blockId"));

  await prisma.scheduleBlock.delete({
    where: { id: blockId },
  });

  revalidateAdminData();
}
