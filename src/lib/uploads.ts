import type { UserRole } from "@/types/domain";

export type UploadAccessSession = {
  userId?: string | null;
  role?: UserRole | null;
};

export type ProtectedUploadReferenceOwners = {
  doctorUserIds: string[];
  ownerUserIds: string[];
};

export function canAccessProtectedUploadByReference(
  session: UploadAccessSession | null | undefined,
  referenceOwners: ProtectedUploadReferenceOwners,
) {
  if (!session?.userId || !session.role) {
    return false;
  }

  if (session.role === "ADMIN" || session.role === "SUPERADMIN") {
    return true;
  }

  if (session.role === "DOCTOR") {
    return referenceOwners.doctorUserIds.includes(session.userId);
  }

  if (session.role === "CLIENT") {
    return referenceOwners.ownerUserIds.includes(session.userId);
  }

  return false;
}
