// Domain entities

export type VehicleStatus = "moving" | "idle" | "stopped";

export interface Vehicle {
  id: string;
  label: string;
  position: [number, number]; // [lat, lng]
  status: VehicleStatus;
}

export type AlertSeverity = "low" | "medium" | "critical";

export interface Alert {
  id: string;
  vehicleId: string;
  severity: AlertSeverity;
  message: string;
  timestamp: number;
  read: boolean;
  dismissed: boolean;
}

export type UserRole = "admin" | "operator" | "viewer";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export type Permission =
  | "view:vehicles"
  | "create:vehicle"
  | "edit:vehicle"
  | "delete:vehicle"
  | "view:alerts"
  | "dismiss:alert"
  | "manage:users"
  | "view:logs";

// Geo

export type GeoCoordinate = [number, number]; // [lat, lng]

// API request/response DTOs

export type CreateVehicleRequest = Omit<Vehicle, "id">;
export type UpdateVehicleRequest = Partial<Omit<Vehicle, "id">>;
export type UpdateUserRoleRequest = { role: UserRole };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// RBAC — fuente única de verdad compartida entre frontend y backend.
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
