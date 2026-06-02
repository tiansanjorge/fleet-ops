import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Vehicle } from "@fleetops/types";
import type { Vehicle as DbVehicle } from "@prisma/client";
import {
  vehicleSchema,
  createVehicleSchema,
  updateVehicleSchema,
  vehicleParamsSchema,
} from "./schemas.js";
import { errorSchema } from "../../lib/http.js";
import { EVENTS } from "../../realtime/events.js";

// Mapper DB -> contrato del frontend. El tipo de retorno Vehicle garantiza
// en compile-time que la respuesta respeta @fleetops/types.
function toVehicleDTO(v: DbVehicle): Vehicle {
  return {
    id: v.id,
    label: v.label,
    position: [v.lat, v.lng],
    status: v.status,
  };
}

export default async function vehiclesRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("view:vehicles")],
      schema: { response: { 200: z.array(vehicleSchema) } },
    },
    async () => {
      const vehicles = await app.prisma.vehicle.findMany({
        orderBy: { label: "asc" },
      });
      return vehicles.map(toVehicleDTO);
    },
  );

  r.post(
    "/",
    {
      preHandler: [app.authenticate, app.authorize("create:vehicle")],
      schema: { body: createVehicleSchema, response: { 201: vehicleSchema } },
    },
    async (req, reply) => {
      const { label, position, status } = req.body;
      const created = await app.prisma.vehicle.create({
        data: { label, lat: position[0], lng: position[1], status },
      });
      const dto = toVehicleDTO(created);
      app.io.emit(EVENTS.VEHICLE_CREATED, dto);
      return reply.code(201).send(dto);
    },
  );

  r.put(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("edit:vehicle")],
      schema: {
        params: vehicleParamsSchema,
        body: updateVehicleSchema,
        response: { 200: vehicleSchema, 404: errorSchema },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const existing = await app.prisma.vehicle.findUnique({ where: { id } });
      if (!existing) return reply.code(404).send({ message: "Vehicle not found" });

      const { label, position, status } = req.body;
      const updated = await app.prisma.vehicle.update({
        where: { id },
        data: {
          ...(label !== undefined && { label }),
          ...(position !== undefined && { lat: position[0], lng: position[1] }),
          ...(status !== undefined && { status }),
        },
      });
      const dto = toVehicleDTO(updated);
      app.io.emit(EVENTS.VEHICLE_UPDATED, dto);
      return dto;
    },
  );

  r.delete(
    "/:id",
    {
      preHandler: [app.authenticate, app.authorize("delete:vehicle")],
      schema: { params: vehicleParamsSchema },
    },
    async (req, reply) => {
      const { id } = req.params;
      const existing = await app.prisma.vehicle.findUnique({ where: { id } });
      if (!existing) return reply.code(404).send({ message: "Vehicle not found" });

      await app.prisma.vehicle.delete({ where: { id } });
      app.io.emit(EVENTS.VEHICLE_DELETED, { id });
      return reply.code(204).send();
    },
  );
}
