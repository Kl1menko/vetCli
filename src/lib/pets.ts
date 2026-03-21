export function buildPetArchivePayload(now = new Date()) {
  return {
    isArchived: true,
    archivedAt: now,
  };
}

export function buildPetRestorePayload() {
  return {
    isArchived: false,
    archivedAt: null,
  };
}

export function assertPetIsActive(
  pet: { isArchived: boolean } | null | undefined,
  missingMessage = "Тварину не знайдено.",
): asserts pet is { isArchived: false } {
  if (!pet) {
    throw new Error(missingMessage);
  }

  if (pet.isArchived) {
    throw new Error("Архівовану тварину не можна використовувати в активних сценаріях.");
  }
}
