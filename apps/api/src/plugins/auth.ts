import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { can, type Permission, type UserRole } from "@fleetops/types";
import { env } from "../config/env.js";

// Lo que firmamos en el token y lo que req.user expone tras jwtVerify.
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; name: string; role: UserRole };
    user: { id: string; name: string; role: UserRole };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (
      permission: Permission,
    ) => (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  // 401 — autenticación: ¿hay un token válido?
  fastify.decorate(
    "authenticate",
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        await req.jwtVerify();
      } catch {
        return reply.code(401).send({ message: "Unauthorized" });
      }
    },
  );

  // 403 — autorización: ¿el rol tiene el permiso? Usa el mismo can() que el
  // frontend. Asume que authenticate corrió antes y pobló req.user.
  fastify.decorate("authorize", (permission: Permission) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
      if (!can(req.user.role, permission)) {
        return reply.code(403).send({ message: "Forbidden" });
      }
    };
  });
});
