import type { UserRole } from "@/types/domain";

const adminRoles: UserRole[] = ["ADMIN", "SUPERADMIN"];

export function isAdminRole(role?: UserRole | null) {
  return Boolean(role && adminRoles.includes(role));
}

export function canAccessAdmin(role?: UserRole | null) {
  return isAdminRole(role);
}

export function canAccessDoctor(role?: UserRole | null) {
  return role === "DOCTOR" || role === "SUPERADMIN";
}

export function canAccessCabinet(role?: UserRole | null) {
  return role === "CLIENT" || role === "SUPERADMIN";
}

export function roleHomePath(role?: UserRole | null) {
  if (role === "DOCTOR") return "/doctor";
  if (isAdminRole(role)) return "/admin";
  if (role === "CLIENT") return "/cabinet";
  return "/";
}
