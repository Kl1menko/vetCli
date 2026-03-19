import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getBookingCalendar,
  getAvailableBookingSlotOptions,
} from "@/server/services/appointments/availability";

const querySchema = z.object({
  doctorId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
  weekStart: z.string().optional(),
  days: z.coerce.number().int().min(1).max(14).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    doctorId: searchParams.get("doctorId"),
    serviceId: searchParams.get("serviceId"),
    date: searchParams.get("date"),
    weekStart: searchParams.get("weekStart") || undefined,
    days: searchParams.get("days") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ slots: [], calendar: [], error: "Invalid query" }, { status: 400 });
  }

  const [slots, calendar] = await Promise.all([
    getAvailableBookingSlotOptions(parsed.data),
    getBookingCalendar({
      doctorId: parsed.data.doctorId,
      serviceId: parsed.data.serviceId,
      startDate: parsed.data.weekStart ?? parsed.data.date,
      days: parsed.data.days ?? 7,
    }),
  ]);

  return NextResponse.json({ slots, calendar });
}
