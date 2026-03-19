import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Вкажіть ім'я та прізвище."),
  phone: z.string().trim().max(50, "Телефон занадто довгий.").optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, "Вкажіть коректний email."),
  address: z.string().trim().max(255, "Адреса занадто довга.").optional(),
  notes: z.string().trim().max(1000, "Нотатка занадто довга.").optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
