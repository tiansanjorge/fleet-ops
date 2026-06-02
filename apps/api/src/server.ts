import { buildApp } from "./app.js";

async function start() {
  const app = await buildApp();
  const PORT = Number(process.env.PORT) || 4000;
  await app.listen({ port: PORT, host: "0.0.0.0" });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
