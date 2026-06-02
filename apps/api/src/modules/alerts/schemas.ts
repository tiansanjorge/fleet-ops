import { z } from "zod";

export const alertSeveritySchema = z.enum(["low", "medium", "critical"]);

export const alertSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  severity: alertSeveritySchema,
  message: z.string(),
  timestamp: z.number(), // epoch ms — en la DB es BigInt, se convierte en el mapper
  read: z.boolean(),
  dismissed: z.boolean(),
});

export const updateAlertSchema = z
  .object({
    read: z.boolean().optional(),
    dismissed: z.boolean().optional(),
  })
  .refine((data) => data.read !== undefined || data.dismissed !== undefined, {
    message: "At least one of 'read' or 'dismissed' must be provided",
  });

export const alertParamsSchema = z.object({ id: z.string() });
