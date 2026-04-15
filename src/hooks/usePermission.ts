"use client";

import { useAuth } from "./useAuth";
import { hasPermission, type Permission, type UserRole } from "@/config/permissions";

/** Granüler izin kontrolü. Kullanım: `const can = usePermission(); can("operations.delete")` */
export function usePermission() {
  const { profile } = useAuth();
  const role: UserRole = (profile?.role as UserRole) ?? "viewer";

  return function can(permission: Permission): boolean {
    return hasPermission(role, permission);
  };
}
