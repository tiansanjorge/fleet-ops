import { create } from "zustand";
import { Alert } from "../types";
import { Vehicle, VehicleStatus } from "@/features/vehicles/types";
import { useVehicleStore } from "@/features/vehicles/store/vehicleStore";

// --- Alert catalog: messages keyed by vehicle status ---
type AlertTemplate = {
  message: string;
  severity: Alert["severity"];
  forceStop?: boolean;
};

const ALERT_CATALOG: Record<VehicleStatus, AlertTemplate[]> = {
  moving: [
    // Operacional
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
    // Técnico
    { message: "Engine RPM above normal range", severity: "low" },
    { message: "Tire pressure warning — front left", severity: "medium" },
  ],

  idle: [
    // Operacional
    { message: "Idle time exceeding delivery window", severity: "medium" },
    {
      message: "Driver not checked in after scheduled stop",
      severity: "medium",
    },
    // Técnico
    { message: "Scheduled maintenance overdue", severity: "low" },
    { message: "Low fuel — less than 15% remaining", severity: "medium" },
    { message: "Engine temperature high while idle", severity: "critical" },
  ],

  stopped: [
    // Operacional
    { message: "Unscheduled stop — not on delivery route", severity: "low" },
    { message: "Stop duration exceeds allowed threshold", severity: "medium" },
    { message: "Vehicle stopped in no-parking zone", severity: "medium" },
    { message: "Emergency stop activated by driver", severity: "critical" },
    {
      message: "No driver activity detected — possible abandonment",
      severity: "critical",
    },
    // Técnico
    { message: "Cargo door open at unregistered location", severity: "medium" },
    { message: "Battery voltage drop detected", severity: "low" },
  ],
};

function pickTemplate(status: VehicleStatus): AlertTemplate {
  const pool = ALERT_CATALOG[status];
  return pool[Math.floor(Math.random() * pool.length)];
}

// --- Rate control ---
// ~5% chance per tick → ~1 alert every 20-30s (visible without being noisy)
const ALERT_CHANCE = 0.05;
// Minimum ms between any two generated alerts (global cooldown)
const COOLDOWN_MS = 8_000;

let _alertCounter = 0;
let _lastAlertAt = 0;

// --- Store ---
interface AlertStore {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  markAsRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  maybeGenerateAlert: (vehicles: Vehicle[]) => void;
  fireDemoAlert: (vehicles: Vehicle[]) => void;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],

  setAlerts: (alerts) => set({ alerts }),

  markAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    })),

  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true, dismissed: true } : a,
      ),
    })),

  maybeGenerateAlert: (vehicles) => {
    if (vehicles.length === 0) return;

    // Global cooldown
    const now = Date.now();
    if (now - _lastAlertAt < COOLDOWN_MS) return;

    // Random gate
    if (Math.random() > ALERT_CHANCE) return;

    // Find eligible vehicles: no unread critical alert already active
    const { alerts } = get();
    const vehiclesWithActiveCritical = new Set(
      alerts
        .filter((a) => !a.read && a.severity === "critical")
        .map((a) => a.vehicleId),
    );

    const eligible = vehicles.filter(
      (v) => !vehiclesWithActiveCritical.has(v.id),
    );
    if (eligible.length === 0) return;

    const vehicle = eligible[Math.floor(Math.random() * eligible.length)];
    const template = pickTemplate(vehicle.status);

    const alert: Alert = {
      id: `rt-${++_alertCounter}-${now}`,
      vehicleId: vehicle.id,
      severity: template.severity,
      message: template.message,
      timestamp: now,
      read: false,
      dismissed: false,
    };

    if (template.forceStop) {
      useVehicleStore.getState().forceStop(vehicle.id, 60_000);
    }

    _lastAlertAt = now;
    set((state) => ({ alerts: [alert, ...state.alerts] }));
  },

  // Bypasses all rate controls — used for the guaranteed demo alert on load
  fireDemoAlert: (vehicles) => {
    if (vehicles.length === 0) return;

    const now = Date.now();
    const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
    const template = pickTemplate(vehicle.status);

    const alert: Alert = {
      id: `demo-${++_alertCounter}-${now}`,
      vehicleId: vehicle.id,
      severity: template.severity,
      message: template.message,
      timestamp: now,
      read: false,
      dismissed: false,
    };

    if (template.forceStop) {
      useVehicleStore.getState().forceStop(vehicle.id, 60_000);
    }

    _lastAlertAt = now;
    set((state) => ({ alerts: [alert, ...state.alerts] }));
  },
}));
