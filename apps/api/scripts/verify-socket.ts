// Cliente de prueba temporal para verificar la Fase H (Socket.io + simulación).
// Correr con la API levantada:  pnpm --filter @fleetops/api exec tsx scripts/verify-socket.ts
import { io } from "socket.io-client";

const BASE = "http://localhost:4000";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function login(email: string, password: string): Promise<string> {
  return fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((r) => r.json())
    .then((d) => d.token);
}

async function main() {
  // 1. Conexión SIN token -> el handshake debe rechazar.
  await new Promise<void>((resolve) => {
    const s = io(BASE, { reconnection: false });
    const t = setTimeout(() => {
      console.log("⏱️  sin token: sin respuesta en 3s");
      s.close();
      resolve();
    }, 3000);
    s.on("connect", () => {
      console.log("❌ conectó SIN token (no debería)");
      clearTimeout(t);
      s.close();
      resolve();
    });
    s.on("connect_error", (e) => {
      console.log(`✅ rechazo sin token: "${e.message}"`);
      clearTimeout(t);
      s.close();
      resolve();
    });
  });

  // 2. Login + conexión CON token.
  const token = await login("admin@fleetops.dev", "admin123");
  console.log(`\n🔑 token admin: ${token.length} chars`);

  const socket = io(BASE, { auth: { token }, reconnection: false });
  let positions = 0;
  const alerts: Array<{ severity: string; message: string }> = [];
  let created = false;
  let deleted = false;

  socket.on("connect", () => console.log("✅ conectado con token\n"));
  socket.on("connect_error", (e) => console.log(`❌ connect_error: ${e.message}`));
  socket.on("vehicle:position", () => {
    positions++;
  });
  socket.on("alert:new", (a: { severity: string; message: string }) => {
    alerts.push(a);
    console.log(`🔔 alert:new   [${a.severity}] ${a.message}`);
  });
  socket.on("vehicle:created", (v: { id: string; label: string }) => {
    created = true;
    console.log(`➕ vehicle:created   ${v.label} (${v.id})`);
  });
  socket.on("vehicle:updated", (v: { label: string }) => {
    console.log(`✏️  vehicle:updated   ${v.label}`);
  });
  socket.on("vehicle:deleted", (d: { id: string }) => {
    deleted = true;
    console.log(`➖ vehicle:deleted   ${d.id}`);
  });

  await wait(4000); // capturar varios vehicle:position

  // 3. POST + DELETE para ejercer los eventos REST (se autolimpia en la DB).
  const res = await fetch(`${BASE}/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      label: "RT Test",
      position: [-34.6, -58.45],
      status: "moving",
    }),
  });
  const newV = await res.json();
  await wait(1500);
  await fetch(`${BASE}/vehicles/${newV.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  await wait(8000); // ventana para capturar alguna alerta

  console.log("\n──── RESUMEN ────");
  console.log(`vehicle:position recibidos : ${positions}`);
  console.log(`vehicle:created            : ${created ? "✅" : "❌"}`);
  console.log(`vehicle:deleted            : ${deleted ? "✅" : "❌"}`);
  console.log(`alert:new recibidas        : ${alerts.length}`);
  socket.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
