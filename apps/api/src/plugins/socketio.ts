import fp from "fastify-plugin";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { startSimulation } from "../realtime/simulation.js";

declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}

export default fp(async (fastify) => {
  const io = new Server(fastify.server, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Unauthorized"));
    try {
      socket.data.user = fastify.jwt.verify(token);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  fastify.decorate("io", io);

  // La simulación corre solo mientras haya al menos un cliente conectado.
  // Así Neon duerme cuando no hay nadie mirando la app.
  let stopSim: (() => void) | null = null;

  io.on("connection", (socket) => {
    if (io.sockets.sockets.size === 1 && !stopSim) {
      fastify.log.info("first client connected — starting simulation");
      stopSim = startSimulation(fastify);
    }

    socket.on("disconnect", () => {
      if (io.sockets.sockets.size === 0 && stopSim) {
        fastify.log.info("last client disconnected — stopping simulation");
        stopSim();
        stopSim = null;
      }
    });
  });

  fastify.addHook("onClose", async () => {
    stopSim?.();
    await io.close();
  });
});
