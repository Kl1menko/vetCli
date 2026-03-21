import { blockingAppointmentStatuses } from "@/lib/appointments";
import { prisma } from "@/lib/prisma";

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

export async function resolveAppointmentTiming(payload: {
  serviceId: string;
  date: string;
  startTime: string;
}) {
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
    select: { durationMinutes: true, name: true },
  });

  if (!service) {
    throw new Error("Послугу не знайдено.");
  }

  const startMinutes = toMinutes(payload.startTime);
  const endTime = formatTime(startMinutes + service.durationMinutes);

  return {
    date: toDayStart(payload.date),
    endTime,
    service,
  };
}

export async function assertAppointmentAvailability(payload: {
  doctorId: string;
  serviceId: string;
  date: string;
  startTime: string;
  appointmentId?: string;
}) {
  const { date, endTime, service } = await resolveAppointmentTiming(payload);
  const weekday = date.getDay() || 7;

  const [schedule, blocks, appointments] = await Promise.all([
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
        status: {
          in: blockingAppointmentStatuses,
        },
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
