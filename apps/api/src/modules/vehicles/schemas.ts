import { z } from "zod";

export const vehicleStatusSchema = z.enum(["moving", "idle", "stopped"]);

// El frontend trabaja con position: [lat, lng]; la DB guarda lat/lng separados.
export const positionSchema = z.tuple([z.number(), z.number()]);

export const vehicleSchema = z.object({
  id: z.string(),
  label: z.string(),
  position: positionSchema,
  status: vehicleStatusSchema,
});

export const createVehicleSchema = z.object({
  label: z.string().min(1),
  position: positionSchema,
  status: vehicleStatusSchema.default("moving"),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleParamsSchema = z.object({ id: z.string() });
