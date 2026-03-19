"use server";

import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { roleHomePath } from "@/lib/permissions";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Перевір форму входу." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });

  if (!user) {
    return { error: "Користувача з таким email не знайдено." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: roleHomePath(user.role),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Невірний email або пароль." };
    }

    throw error;
  }

  return { success: "Вхід успішний." };
}

export async function registerOwnerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Перевір форму реєстрації." };
  }

  const payload = parsed.data;
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
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Користувач з таким email або телефоном уже існує." };
    }

    throw error;
  }

  await signIn("credentials", {
    email: payload.email,
    password: payload.password,
    redirectTo: "/cabinet",
  });

  return { success: "Реєстрація успішна." };
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/",
  });
}
