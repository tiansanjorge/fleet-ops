import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma.js";

async function start() {
  const app = Fastify({ logger: true });

  await app.register(prismaPlugin);

  app.get("/health", async () => {
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", db: "connected" };
    } catch {
      return { status: "error", db: "disconnected" };
    }
  });

  const PORT = Number(process.env.PORT) || 4000;
  await app.listen({ port: PORT, host: "0.0.0.0" });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
