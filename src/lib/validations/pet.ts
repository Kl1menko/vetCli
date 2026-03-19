import { z } from "zod";

export const petSchema = z.object({
  name: z.string().min(1, "Ім'я обов'язкове."),
  species: z.string().min(1, "Вид тварини обов'язковий."),
  breed: z.string().trim().optional(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]).default("UNKNOWN"),
  birthDate: z.string().optional(),
  weight: z
    .string()
    .optional()
    .refine((value) => !value || Number(value) > 0, "Вага має бути більшою за 0."),
  color: z.string().trim().optional(),
  microchipNumber: z.string().trim().optional(),
  isSterilized: z.boolean().default(false),
  allergies: z.string().max(1000).optional(),
  chronicConditions: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
});

export type PetInput = z.infer<typeof petSchema>;
