import { z } from "zod";

export const bookingSchema = z.object({
  petId: z.string().min(1, "Оберіть тварину."),
  serviceId: z.string().min(1, "Оберіть послугу."),
  doctorId: z.string().min(1, "Оберіть лікаря."),
  date: z.string().min(1, "Оберіть дату."),
  time: z.string().min(1, "Оберіть час."),
  comment: z.string().max(500).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
