import type { FastifyInstance } from "fastify";
import type { Vehicle as DbVehicle } from "@prisma/client";
import type { AlertSeverity, VehicleStatus } from "@fleetops/types";
import { EVENTS } from "./events.js";

// Réplica fiel de la simulación que vivía en el frontend
// (vehicleStore.ts + alertStore.ts). Ahora el backend es la fuente de verdad:
// genera el movimiento y las alertas, persiste en DB y emite por socket.

const TICK_MS = 1500;

const BOUNDS = {
  norte: -34.565944,
  sur: -34.625735,
  oeste: -58.509054,
  este: -58.415765,
};

// --- Movimiento (basado en rumbo) ---
// ~0.00008 deg/tick ≈ 8m a 1.5s ≈ ~19 km/h
const SPEED = 0.00008;
const MAX_TURN = 0.17; // ~10° de drift gradual por tick
const CORNER_CHANCE = 0.05; // probabilidad de doblar en una esquina
const CORNER_ANGLE = Math.PI / 2; // giro de 90°

// --- Transiciones de estado (tuneadas para cambios cada ~30-90s) ---
const STATUS_TRANSITIONS: Record<
  VehicleStatus,
  Array<{ next: VehicleStatus; chance: number }>
> = {
  moving: [{ next: "idle", chance: 0.008 }],
  idle: [
    { next: "moving", chance: 0.025 },
    { next: "stopped", chance: 0.005 },
  ],
  stopped: [{ next: "idle", chance: 0.012 }],
};

// --- Alertas ---
const ALERT_CHANCE = 0.05; // ~5% por tick
const COOLDOWN_MS = 8_000; // cooldown global entre alertas
const FORCE_STOP_MS = 60_000; // una alerta crítica de colisión frena 60s

type AlertTemplate = {
  message: string;
  severity: AlertSeverity;
  forceStop?: boolean;
};

const ALERT_CATALOG: Record<VehicleStatus, AlertTemplate[]> = {
  moving: [
    { message: "Speed limit exceeded on urban road", severity: "low" },
    { message: "Route deviation — not on assigned path", severity: "low" },
    {
      message: "Driver break overdue (4h continuous driving)",
      severity: "medium",
    },
    { message: "Harsh braking event detected", severity: "medium" },
    { message: "Vehicle entered restricted zone", severity: "medium" },
    {
      message: "Sudden swerve detected — possible collision risk",
      severity: "critical",
    },
    {
      message: "Collision detected — vehicle unresponsive",
      severity: "critical",
      forceStop: true,
    },
    { message: "Engine RPM above normal range", severity: "low" },
    { message: "Tire pressure warning — front left", severity: "medium" },
    {
      message: "Sharp turn at intersection — excessive speed",
      severity: "low",
    },
    { message: "Fuel consumption spike detected", severity: "low" },
    { message: "Driver seatbelt unfastened while moving", severity: "medium" },
    {
      message: "GPS signal degraded — position may be inaccurate",
      severity: "low",
    },
    {
      message: "Vehicle approaching school zone over speed limit",
      severity: "medium",
    },
    {
      message: "Windshield wiper fault — low visibility conditions",
      severity: "low",
    },
    {
      message: "Rear door sensor triggered while in motion",
      severity: "medium",
    },
    {
      message: "Rapid acceleration detected in residential area",
      severity: "low",
    },
    {
      message: "Wrong-way detection alert — check route",
      severity: "critical",
      forceStop: true,
    },
    {
      message: "Engine oil pressure below minimum threshold",
      severity: "medium",
    },
    { message: "Cargo weight sensor reading unstable", severity: "low" },
  ],
  idle: [
    { message: "Idle time exceeding delivery window", severity: "medium" },
    {
      message: "Driver not checked in after scheduled stop",
      severity: "medium",
    },
    { message: "Scheduled maintenance overdue", severity: "low" },
    { message: "Low fuel — less than 15% remaining", severity: "medium" },
    { message: "Engine temperature high while idle", severity: "critical" },
    {
      message: "AC system running continuously — fuel waste risk",
      severity: "low",
    },
    {
      message: "Delivery confirmation pending for 10+ minutes",
      severity: "medium",
    },
    {
      message: "Driver phone activity detected while engine running",
      severity: "low",
    },
    { message: "Vehicle idle in restricted loading zone", severity: "medium" },
    { message: "Battery charging level below 20%", severity: "medium" },
    { message: "No delivery scan recorded at this stop", severity: "low" },
    { message: "Coolant level low — check reservoir", severity: "medium" },
    { message: "Driver door open in active traffic area", severity: "medium" },
    {
      message: "Idle duration exceeded 15 minutes — route delay likely",
      severity: "low",
    },
    { message: "Transmission fluid temperature warning", severity: "medium" },
    { message: "Smoke detected near engine compartment", severity: "critical" },
  ],
  stopped: [
    { message: "Unscheduled stop — not on delivery route", severity: "low" },
    { message: "Stop duration exceeds allowed threshold", severity: "medium" },
    { message: "Vehicle stopped in no-parking zone", severity: "medium" },
    {
      message: "Emergency stop activated by driver",
      severity: "critical",
      forceStop: true,
    },
    {
      message: "No driver activity detected — possible abandonment",
      severity: "critical",
    },
    { message: "Cargo door open at unregistered location", severity: "medium" },
    { message: "Battery voltage drop detected", severity: "low" },
    {
      message: "Vehicle parked blocking emergency access lane",
      severity: "medium",
    },
    { message: "Engine left running during extended stop", severity: "low" },
    {
      message: "Cargo temperature out of range at delivery point",
      severity: "medium",
    },
    {
      message: "Driver panic button triggered",
      severity: "critical",
      forceStop: true,
    },
    {
      message: "Odometer mismatch — possible unauthorized use",
      severity: "medium",
    },
    {
      message: "Stop location does not match scheduled delivery address",
      severity: "low",
    },
    { message: "Trailer coupling sensor disconnected", severity: "medium" },
    { message: "Brake fluid warning light active", severity: "medium" },
    {
      message: "Vehicle tilt detected — possible accident or theft",
      severity: "critical",
    },
  ],
};

// --- Estado efímero en memoria (no es parte del dominio) ---
const headings = new Map<string, number>();
const forcedStops = new Map<string, number>(); // vehicleId -> expiry ms
let lastAlertAt = 0;

function getHeading(id: string): number {
  let h = headings.get(id);
  if (h === undefined) {
    h = Math.random() * 2 * Math.PI;
    headings.set(id, h);
  }
  return h;
}

function nextHeading(id: string): number {
  let heading = getHeading(id);
  if (Math.random() < CORNER_CHANCE) {
    heading += Math.random() < 0.5 ? CORNER_ANGLE : -CORNER_ANGLE;
  } else {
    heading += (Math.random() - 0.5) * MAX_TURN;
  }
  headings.set(id, heading);
  return heading;
}

function nextStatus(current: VehicleStatus, id: string): VehicleStatus {
  // Un forceStop activo mantiene el vehículo detenido hasta que expira.
  const forcedUntil = forcedStops.get(id);
  if (forcedUntil !== undefined) {
    if (Date.now() < forcedUntil) return "stopped";
    forcedStops.delete(id);
  }
  for (const { next, chance } of STATUS_TRANSITIONS[current]) {
    if (Math.random() < chance) return next;
  }
  return current;
}

function pickTemplate(status: VehicleStatus): AlertTemplate {
  const pool = ALERT_CATALOG[status];
  return pool[Math.floor(Math.random() * pool.length)];
}

async function maybeGenerateAlert(app: FastifyInstance, vehicles: DbVehicle[]) {
  if (vehicles.length === 0) return;

  const now = Date.now();
  if (now - lastAlertAt < COOLDOWN_MS) return;
  if (Math.random() > ALERT_CHANCE) return;

  // Un vehículo con una crítica no-leída activa no recibe otra alerta.
  const activeCritical = await app.prisma.alert.findMany({
    where: { read: false, severity: "critical" },
    select: { vehicleId: true },
  });
  const blocked = new Set(activeCritical.map((a) => a.vehicleId));
  const eligible = vehicles.filter((v) => !blocked.has(v.id));
  if (eligible.length === 0) return;

  const vehicle = eligible[Math.floor(Math.random() * eligible.length)];
  const template = pickTemplate(vehicle.status);

  const created = await app.prisma.alert.create({
    data: {
      vehicleId: vehicle.id,
      severity: template.severity,
      message: template.message,
      timestamp: BigInt(now),
    },
  });

  if (template.forceStop) {
    forcedStops.set(vehicle.id, now + FORCE_STOP_MS);
  }
  lastAlertAt = now;

  app.io.emit(EVENTS.ALERT_NEW, {
    id: created.id,
    vehicleId: created.vehicleId,
    severity: created.severity,
    message: created.message,
    timestamp: Number(created.timestamp),
    read: created.read,
    dismissed: created.dismissed,
  });
}

/**
 * Arranca el loop de simulación. Devuelve una función para detenerlo.
 * Lee de la DB cada tick para no desincronizarse con las mutaciones REST.
 */
export function startSimulation(app: FastifyInstance): () => void {
  const tick = async () => {
    try {
      const vehicles = await app.prisma.vehicle.findMany();

      for (const v of vehicles) {
        const status = nextStatus(v.status, v.id);

        if (status === "moving") {
          let heading = nextHeading(v.id);
          let lat = v.lat + Math.cos(heading) * SPEED;
          let lng = v.lng + Math.sin(heading) * SPEED;

          if (lat < BOUNDS.sur || lat > BOUNDS.norte)
            heading = Math.PI - heading;
          if (lng < BOUNDS.oeste || lng > BOUNDS.este) heading = -heading;
          lat = Math.max(BOUNDS.sur, Math.min(BOUNDS.norte, lat));
          lng = Math.max(BOUNDS.oeste, Math.min(BOUNDS.este, lng));
          headings.set(v.id, heading);

          await app.prisma.vehicle.update({
            where: { id: v.id },
            data: { lat, lng, status },
          });
          app.io.emit(EVENTS.VEHICLE_POSITION, {
            id: v.id,
            position: [lat, lng],
            status,
          });
        } else if (status !== v.status) {
          // No se mueve pero cambió de estado: persistir y emitir con la
          // posición actual para que el front actualice el marker.
          await app.prisma.vehicle.update({
            where: { id: v.id },
            data: { status },
          });
          app.io.emit(EVENTS.VEHICLE_POSITION, {
            id: v.id,
            position: [v.lat, v.lng],
            status,
          });
        }
      }

      await maybeGenerateAlert(app, vehicles);
    } catch (err) {
      app.log.error({ err }, "simulation tick failed");
    }
  };

  const interval = setInterval(tick, TICK_MS);
  app.log.info(`simulation started (tick ${TICK_MS}ms)`);
  return () => clearInterval(interval);
}
