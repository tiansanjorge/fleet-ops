import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "operator", "viewer"]);

// No exponemos email ni passwordHash: el contrato @fleetops/types.User
// es { id, name, role }.
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: userRoleSchema,
});

export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});

export const userParamsSchema = z.object({ id: z.string() });
