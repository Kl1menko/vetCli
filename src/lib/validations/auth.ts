import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Вкажи коректний email."),
  password: z.string().min(8, "Пароль має містити щонайменше 8 символів."),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Вкажи ім'я та прізвище."),
  email: z.email("Вкажи коректний email."),
  phone: z.string().min(10, "Вкажи номер телефону."),
  password: z.string().min(8, "Пароль має містити щонайменше 8 символів."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
