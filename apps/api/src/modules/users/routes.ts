import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { User } from "@fleetops/types";
import type { User as DbUser } from "@prisma/client";
import { userSchema, updateUserRoleSchema, userParamsSchema } from "./schemas.js";
import { errorSchema } from "../../lib/http.js";

// Mapper deliberadamente acotado: nunca filtra passwordHash ni email.
function toUserDTO(u: DbUser): User {
  return {
    id: u.id,
    name: u.name,
    role: u.role,
  };
}

export default async function usersRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    "/",
    { schema: { response: { 200: z.array(userSchema) } } },
    async () => {
      const users = await app.prisma.user.findMany({ orderBy: { name: "asc" } });
      return users.map(toUserDTO);
    },
  );

  r.patch(
    "/:id/role",
    {
      schema: {
        params: userParamsSchema,
        body: updateUserRoleSchema,
        response: { 200: userSchema, 404: errorSchema },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const existing = await app.prisma.user.findUnique({ where: { id } });
      if (!existing) return reply.code(404).send({ message: "User not found" });

      const updated = await app.prisma.user.update({
        where: { id },
        data: { role: req.body.role },
      });
      return toUserDTO(updated);
    },
  );
}
