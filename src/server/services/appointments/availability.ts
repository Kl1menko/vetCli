import { prisma } from "@/lib/prisma";
import { blockingAppointmentStatuses } from "@/lib/appointments";

type SlotRequest = {
  serviceDurationMinutes: number;
  workingStart: string;
  workingEnd: string;
  blockedRanges?: Array<{ start: string; end: string }>;
};

type BookingAvailabilityRequest = {
  doctorId: string;
  serviceId: string;
  date: string;
};

type DoctorSummary = {
  id: string;
  fullName: string;
  specialization: string;
};

export type BookingSlotOption = {
  time: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
};

export type BookingCalendarDay = {
  date: string;
  slotCount: number;
  firstAvailableSlot: string | null;
};

function toDayStart(dateString: string) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getAvailableSlots({
  serviceDurationMinutes,
  workingStart,
  workingEnd,
  blockedRanges = [],
}: SlotRequest) {
  const slots: string[] = [];
  const [startHour, startMinute] = workingStart.split(":").map(Number);
  const [endHour, endMinute] = workingEnd.split(":").map(Number);

  let cursor = startHour * 60 + startMinute;
  const finish = endHour * 60 + endMinute;

  while (cursor + serviceDurationMinutes <= finish) {
    const label = `${String(Math.floor(cursor / 60)).padStart(2, "0")}:${String(cursor % 60).padStart(2, "0")}`;
    const blocked = blockedRanges.some(({ start, end }) => {
      const [sHour, sMinute] = start.split(":").map(Number);
      const [eHour, eMinute] = end.split(":").map(Number);
      const blockStart = sHour * 60 + sMinute;
      const blockEnd = eHour * 60 + eMinute;

      return cursor < blockEnd && cursor + serviceDurationMinutes > blockStart;
    });

    if (!blocked) {
      slots.push(label);
    }

    cursor += serviceDurationMinutes;
  }

  return slots;
}

export async function getAvailableBookingSlots({
  doctorId,
  serviceId,
  date,
}: BookingAvailabilityRequest) {
  const selectedDate = toDayStart(date);
  const now = new Date();

  if (selectedDate < new Date(now.setHours(0, 0, 0, 0))) {
    return [];
  }

  const weekday = selectedDate.getDay() || 7;
  const [service, schedule, blocks, appointments] = await Promise.all([
    prisma.service.findUnique({
      where: { id: serviceId },
      select: { durationMinutes: true, isActive: true, isOnlineBookable: true },
    }),
    prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        weekday,
        isActive: true,
      },
    }),
    prisma.scheduleBlock.findMany({
      where: {
        doctorId,
        date: selectedDate,
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        doctorId,
        date: selectedDate,
        status: {
          in: blockingAppointmentStatuses,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
      orderBy: { startTime: "asc" },
    }),
  ]);

  if (!service?.isActive || !service.isOnlineBookable || !schedule) {
    return [];
  }

  const blockedRanges = [
    ...(schedule.breakStart && schedule.breakEnd
      ? [{ start: schedule.breakStart, end: schedule.breakEnd }]
      : []),
    ...blocks.map((block) => ({ start: block.startTime, end: block.endTime })),
    ...appointments.map((appointment) => ({
      start: appointment.startTime,
      end: appointment.endTime,
    })),
  ];

  return getAvailableSlots({
    serviceDurationMinutes: service.durationMinutes,
    workingStart: schedule.startTime,
    workingEnd: schedule.endTime,
    blockedRanges,
  }).filter((slot) => {
    const selectedDateTime = new Date(`${date}T${slot}:00`);
    return selectedDateTime > new Date();
  });
}

async function getActiveDoctors(doctorId: string) {
  if (doctorId === "ANY") {
    return prisma.doctor.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        specialization: true,
      },
    });
  }

  const doctor = await prisma.doctor.findFirst({
    where: {
      id: doctorId,
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      specialization: true,
    },
  });

  return doctor ? [doctor] : [];
}

async function getDoctorSlotOptions(doctor: DoctorSummary, serviceId: string, date: string) {
  const slots = await getAvailableBookingSlots({
    doctorId: doctor.id,
    serviceId,
    date,
  });

  return slots.map((time) => ({
    time,
    doctorId: doctor.id,
    doctorName: doctor.fullName,
    doctorSpecialization: doctor.specialization,
  }));
}

export async function getAvailableBookingSlotOptions({
  doctorId,
  serviceId,
  date,
}: BookingAvailabilityRequest): Promise<BookingSlotOption[]> {
  const doctors = await getActiveDoctors(doctorId);
  const slotGroups = await Promise.all(
    doctors.map((doctor) => getDoctorSlotOptions(doctor, serviceId, date)),
  );

  return slotGroups.flat().toSorted((left, right) => {
    if (left.time !== right.time) {
      return left.time.localeCompare(right.time);
    }

    return left.doctorName.localeCompare(right.doctorName, "uk-UA");
  });
}

export async function getBookingCalendar({
  doctorId,
  serviceId,
  startDate,
  days = 7,
}: {
  doctorId: string;
  serviceId: string;
  startDate: string;
  days?: number;
}): Promise<BookingCalendarDay[]> {
  const start = toDayStart(startDate);
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date.toISOString().slice(0, 10);
  });

  const slotGroups = await Promise.all(
    dates.map((date) =>
      getAvailableBookingSlotOptions({
        doctorId,
        serviceId,
        date,
      }),
    ),
  );

  return dates.map((date, index) => ({
    date,
    slotCount: slotGroups[index].length,
    firstAvailableSlot: slotGroups[index][0]?.time ?? null,
  }));
}
