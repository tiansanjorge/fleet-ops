import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Alert } from "@fleetops/types";
import type { Alert as DbAlert } from "@prisma/client";
import { alertSchema, updateAlertSchema, alertParamsSchema } from "./schemas.js";
import { errorSchema } from "../../lib/http.js";

// timestamp es BigInt en la DB; JSON.stringify no serializa BigInt, así que
// se convierte a number (epoch ms) acá para respetar @fleetops/types.
function toAlertDTO(a: DbAlert): Alert {
  return {
    id: a.id,
    vehicleId: a.vehicleId,
    severity: a.severity,
    message: a.message,
    timestamp: Number(a.timestamp),
    read: a.read,
    dismissed: a.dismissed,
  };
}

export default async function alertsRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/",
    { schema: { response: { 200: z.array(alertSchema) } } },
    async () => {
      const alerts = await app.prisma.alert.findMany({
        orderBy: { timestamp: "desc" },
      });
      return alerts.map(toAlertDTO);
    },
  );

  r.patch(
    "/:id",
    {
      schema: {
        params: alertParamsSchema,
        body: updateAlertSchema,
        response: { 200: alertSchema, 404: errorSchema },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const existing = await app.prisma.alert.findUnique({ where: { id } });
      if (!existing) return reply.code(404).send({ message: "Alert not found" });

      const updated = await app.prisma.alert.update({
        where: { id },
        data: req.body,
      });
      return toAlertDTO(updated);
    },
  );
}
