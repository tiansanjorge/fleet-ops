import { buildApp } from "./app.js";
import { startSimulation } from "./realtime/simulation.js";
import { env } from "./config/env.js";

async function start() {
  const app = await buildApp();
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  startSimulation(app);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
