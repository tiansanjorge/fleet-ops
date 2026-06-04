import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import { env } from "../config/env.js";

export default fp(async (fastify) => {
  await fastify.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    // Sin lista explícita, @fastify/cors puede devolver wildcard en
    // Access-Control-Allow-Headers, lo que los browsers rechazan cuando
    // credentials=true — el resultado es que OPTIONS llega (204) pero
    // el PUT/DELETE nunca sale del cliente.
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
});
