import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { canAccessAdmin, canAccessCabinet, canAccessDoctor, roleHomePath } from "@/lib/permissions";

export async function requireSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function requireCabinetAccess() {
  const session = await requireSession();

  if (!canAccessCabinet(session.user.role)) {
    redirect(roleHomePath(session.user.role));
  }

  return session;
}

export async function requireAdminAccess() {
  const session = await requireSession();

  if (!canAccessAdmin(session.user.role)) {
    redirect(roleHomePath(session.user.role));
  }

  return session;
}

export async function requireDoctorAccess() {
  const session = await requireSession();

  if (!canAccessDoctor(session.user.role)) {
    redirect(roleHomePath(session.user.role));
  }

  return session;
}
