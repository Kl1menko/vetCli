"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { assertPetIsActive, buildPetArchivePayload } from "@/lib/pets";
import { prisma } from "@/lib/prisma";
import { petSchema } from "@/lib/validations/pet";
import { profileSchema } from "@/lib/validations/profile";

export type CabinetActionState = {
  error?: string;
  success?: string;
};

async function getClientOwnerProfile() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CLIENT") {
    throw new Error("Дія доступна лише авторизованому клієнту.");
  }

  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!ownerProfile) {
    throw new Error("Профіль власника не знайдено.");
  }

  return { session, ownerProfile };
}

function revalidateCabinetData(petId?: string) {
  revalidatePath("/booking");
  revalidatePath("/cabinet");
  revalidatePath("/cabinet/profile");
  revalidatePath("/cabinet/pets");
  revalidatePath("/cabinet/appointments");
  revalidatePath("/cabinet/visits");
  revalidatePath("/cabinet/prescriptions");
  revalidatePath("/cabinet/lab-results");
  revalidatePath("/cabinet/invoices");

  if (petId) {
    revalidatePath(`/cabinet/pets/${petId}`);
  }
}

function parsePetPayload(formData: FormData) {
  const parsed = petSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species"),
    breed: formData.get("breed") || undefined,
    sex: formData.get("sex") || "UNKNOWN",
    birthDate: formData.get("birthDate") || undefined,
    weight: formData.get("weight") || undefined,
    color: formData.get("color") || undefined,
    microchipNumber: formData.get("microchipNumber") || undefined,
    isSterilized: formData.get("isSterilized") === "on",
    allergies: formData.get("allergies") || undefined,
    chronicConditions: formData.get("chronicConditions") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Перевір дані тварини.",
    };
  }

  const payload = parsed.data;

  return {
    data: {
      name: payload.name,
      species: payload.species,
      breed: payload.breed || null,
      sex: payload.sex,
      birthDate: payload.birthDate ? new Date(payload.birthDate) : null,
      weight: payload.weight ? new Prisma.Decimal(payload.weight) : null,
      color: payload.color || null,
      microchipNumber: payload.microchipNumber || null,
      isSterilized: payload.isSterilized,
      allergies: payload.allergies || null,
      chronicConditions: payload.chronicConditions || null,
      notes: payload.notes || null,
    },
  };
}

function parseProfilePayload(formData: FormData) {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Перевірте дані профілю.",
    };
  }

  const payload = parsed.data;

  return {
    data: {
      fullName: payload.fullName,
      phone: payload.phone || null,
      email: payload.email || null,
      address: payload.address || null,
      notes: payload.notes || null,
    },
  };
}

export async function createCabinetPetAction(
  _prevState: CabinetActionState,
  formData: FormData,
): Promise<CabinetActionState> {
  try {
    const { ownerProfile } = await getClientOwnerProfile();
    const parsed = parsePetPayload(formData);

    if ("error" in parsed) {
      return parsed;
    }

    await prisma.pet.create({
      data: {
        ownerId: ownerProfile.id,
        ...parsed.data,
      },
    });

    revalidateCabinetData();

    return { success: "Тварину додано до кабінету." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Тварина з таким номером чипа вже існує." };
    }

    return {
      error: error instanceof Error ? error.message : "Не вдалося створити картку тварини.",
    };
  }
}

export async function updateCabinetPetAction(
  _prevState: CabinetActionState,
  formData: FormData,
): Promise<CabinetActionState> {
  try {
    const { ownerProfile } = await getClientOwnerProfile();
    const petId = String(formData.get("petId") ?? "");

    if (!petId) {
      return { error: "Не вдалося визначити тварину для оновлення." };
    }

    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        ownerId: ownerProfile.id,
        isArchived: false,
      },
      select: { id: true, isArchived: true },
    });

    try {
      assertPetIsActive(pet, "Тварину не знайдено або доступ заборонено.");
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Тварину не знайдено або доступ заборонено." };
    }

    const parsed = parsePetPayload(formData);

    if ("error" in parsed) {
      return parsed;
    }

    await prisma.pet.update({
      where: { id: petId },
      data: parsed.data,
    });

    revalidateCabinetData(petId);

    return { success: "Картку тварини оновлено." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Тварина з таким номером чипа вже існує." };
    }

    return {
      error: error instanceof Error ? error.message : "Не вдалося оновити тварину.",
    };
  }
}

export async function deleteCabinetPetAction(formData: FormData) {
  const { ownerProfile } = await getClientOwnerProfile();
  const petId = String(formData.get("petId") ?? "");

  if (!petId) {
    throw new Error("Не вдалося визначити тварину для видалення.");
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: petId,
      ownerId: ownerProfile.id,
      isArchived: false,
    },
    select: { id: true, isArchived: true },
  });

  assertPetIsActive(pet, "Тварину не знайдено або доступ заборонено.");

  await prisma.pet.update({
    where: { id: pet.id },
    data: buildPetArchivePayload(),
  });

  revalidateCabinetData(pet.id);
}

export async function deleteCabinetPetFormAction(
  _prevState: CabinetActionState,
  formData: FormData,
): Promise<CabinetActionState> {
  try {
    await deleteCabinetPetAction(formData);
    return { success: "Тварину архівовано." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Не вдалося архівувати тварину." };
  }
}

export async function updateCabinetProfileAction(
  _prevState: CabinetActionState,
  formData: FormData,
): Promise<CabinetActionState> {
  try {
    const { session, ownerProfile } = await getClientOwnerProfile();
    const parsed = parseProfilePayload(formData);

    if ("error" in parsed) {
      return parsed;
    }

    await prisma.$transaction([
      prisma.ownerProfile.update({
        where: { id: ownerProfile.id },
        data: parsed.data,
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
        },
      }),
    ]);

    revalidateCabinetData();

    return { success: "Профіль оновлено." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Користувач з таким email або телефоном уже існує." };
    }

    return {
      error: error instanceof Error ? error.message : "Не вдалося оновити профіль.",
    };
  }
}
