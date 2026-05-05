import type { UserRole } from "@/features/users/types";
import type { Permission } from "./types";

export const PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "view:vehicles",
    "edit:vehicle",
    "view:alerts",
    "dismiss:alert",
    "manage:users",
    "view:logs",
  ],
  operator: ["view:vehicles", "edit:vehicle", "view:alerts", "dismiss:alert"],
  viewer: ["view:vehicles", "view:alerts"],
};

export function can(role: UserRole, action: Permission): boolean {
  return PERMISSIONS[role].includes(action);
}
