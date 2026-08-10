import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const CONNECT_RETRIES = 5;
const CONNECT_RETRY_DELAY_MS = 3000;

export default fp(async (fastify) => {
  const prisma = new PrismaClient();

  // Neon free tier suspende el compute tras inactividad; el primer connect
  // tras un cold start puede fallar mientras la DB todavía está despertando.
  for (let attempt = 1; attempt <= CONNECT_RETRIES; attempt++) {
    try {
      await prisma.$connect();
      break;
    } catch (err) {
      if (attempt === CONNECT_RETRIES) throw err;
      fastify.log.warn(
        { err, attempt },
        `prisma connect failed, retrying in ${CONNECT_RETRY_DELAY_MS}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, CONNECT_RETRY_DELAY_MS));
    }
  }

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async (app) => {
    await app.prisma.$disconnect();
  });
});
