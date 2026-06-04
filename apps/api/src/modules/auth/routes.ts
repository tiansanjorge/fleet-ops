import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { loginBodySchema, loginResponseSchema } from "./schemas.js";
import { userSchema } from "../users/schemas.js";
import { errorSchema } from "../../lib/http.js";

export default async function authRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.post(
    "/login",
    {
      schema: {
        body: loginBodySchema,
        response: { 200: loginResponseSchema, 401: errorSchema },
      },
    },
    async (req, reply) => {
      const { email, password } = req.body;
      const user = await app.prisma.user.findUnique({ where: { email } });

      // Mismo mensaje para usuario inexistente y password incorrecto:
      // no revelamos cuál de los dos falló.
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return reply.code(401).send({ message: "Invalid credentials" });
      }

      const sessionUser = { id: user.id, name: user.name, role: user.role };
      const token = app.jwt.sign(sessionUser);
      return { token, user: sessionUser };
    },
  );

  r.get(
    "/demo-users",
    {
      schema: {
        response: { 200: z.array(userSchema) },
      },
    },
    async () => {
      return app.prisma.user.findMany({
        select: { id: true, name: true, role: true },
        orderBy: { name: "asc" },
      });
    },
  );

  r.get(
    "/me",
    {
      preHandler: [app.authenticate],
      schema: { response: { 200: userSchema, 401: errorSchema } },
    },
    async (req) => {
      return req.user;
    },
  );
}
