import fp from "fastify-plugin";
import { Server } from "socket.io";
import { env } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}

export default fp(async (fastify) => {
  // Socket.io se monta sobre el http.Server de Fastify. Single namespace "/",
  // sin rooms en MVP.
  const io = new Server(fastify.server, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  // Auth en el handshake: el cliente manda el JWT en auth.token. Reusamos el
  // mismo verificador de @fastify/jwt (registrado por el plugin auth, que va
  // antes que este).
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

  fastify.addHook("onClose", async () => {
    await io.close();
  });
});
