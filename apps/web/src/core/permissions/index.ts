import type { UserRole, Permission } from "@fleetops/types";

export const PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "view:vehicles",
    "create:vehicle",
    "edit:vehicle",
    "delete:vehicle",
    "view:alerts",
    "dismiss:alert",
    "manage:users",
    "view:logs",
  ],
  operator: [
    "view:vehicles",
    "create:vehicle",
    "edit:vehicle",
    "delete:vehicle",
    "view:alerts",
    "dismiss:alert",
  ],
  viewer: ["view:vehicles", "view:alerts"],
};

export function can(role: UserRole, action: Permission): boolean {
  return PERMISSIONS[role].includes(action);
}
