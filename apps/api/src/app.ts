import Fastify, { type FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import prismaPlugin from "./plugins/prisma.js";
import vehiclesRoutes from "./modules/vehicles/routes.js";
import alertsRoutes from "./modules/alerts/routes.js";
import usersRoutes from "./modules/users/routes.js";

// Builder separado de server.ts para poder instanciar la app en tests
// sin abrir un puerto.
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // Zod valida los request y serializa los response.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(prismaPlugin);

  app.get("/health", async () => {
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", db: "connected" };
    } catch {
      return { status: "error", db: "disconnected" };
    }
  });

  await app.register(vehiclesRoutes, { prefix: "/vehicles" });
  await app.register(alertsRoutes, { prefix: "/alerts" });
  await app.register(usersRoutes, { prefix: "/users" });

  return app;
}
