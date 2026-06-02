// Escucha el socket hasta capturar un alert:new en vivo (o timeout 50s).
import { io } from "socket.io-client";

const BASE = "http://localhost:4000";

const token = await fetch(`${BASE}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@fleetops.dev", password: "admin123" }),
})
  .then((r) => r.json())
  .then((d) => d.token);

const socket = io(BASE, { auth: { token }, reconnection: false });

const timer = setTimeout(() => {
  console.log("⏱️  timeout: ninguna alert:new en 50s");
  socket.close();
  process.exit(1);
}, 50_000);

socket.on("connect", () => console.log("escuchando alert:new en vivo (hasta 50s)..."));
socket.on("connect_error", (e) => {
  console.log("connect_error:", e.message);
  process.exit(1);
});
socket.on("alert:new", (a: { severity: string; message: string; vehicleId: string; timestamp: number }) => {
  console.log(`✅ alert:new EN VIVO → [${a.severity}] ${a.message}`);
  console.log(`   vehicleId=${a.vehicleId}  timestamp=${a.timestamp} (${typeof a.timestamp})`);
  clearTimeout(timer);
  socket.close();
  process.exit(0);
});
