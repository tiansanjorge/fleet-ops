import { create } from "zustand";
import { Alert, Vehicle, VehicleStatus } from "@fleetops/types";
import { useVehicleStore } from "@/features/vehicles/store/vehicleStore";
import { useToastStore } from "@/shared/ui/toastStore";

// --- Alert catalog: messages keyed by vehicle status ---
type AlertTemplate = {
  message: string;
  severity: Alert["severity"];
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
    { message: "Collision detected — vehicle unresponsive", severity: "critical" },
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

const ALERT_CHANCE = 1.0;
const COOLDOWN_MS = 5_000;

let _alertCounter = 0;
let _lastAlertAt = 0;

// --- Store ---
interface AlertStore {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  dismissAlert: (id: string) => void;
  removeAlertsByVehicle: (vehicleId: string) => void;
  maybeGenerateAlert: (vehicles: Vehicle[]) => void;
  fireDemoAlert: (vehicles: Vehicle[]) => void;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) =>
    set((state) => {
      if (state.alerts.some((a) => a.id === alert.id)) return state;
      const next = [alert, ...state.alerts];
      if (next.length <= 10) return { alerts: next };
      return {
        alerts: next.map((a, i) =>
          i >= 10 ? { ...a, dismissed: true, read: true } : a,
        ),
      };
    }),

  markAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    })),

  markAsUnread: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: false } : a,
      ),
    })),

  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true, dismissed: true } : a,
      ),
    })),

  removeAlertsByVehicle: (vehicleId) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.vehicleId !== vehicleId),
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

    _lastAlertAt = now;
    set((state) => {
      const next = [alert, ...state.alerts];
      if (next.length <= 10) return { alerts: next };
      return {
        alerts: next.map((a, i) =>
          i >= 10 ? { ...a, dismissed: true, read: true } : a,
        ),
      };
    });
    useToastStore.getState().addToast(alert.message, alert.severity, vehicle.label);
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

    _lastAlertAt = now;
    set((state) => {
      const next = [alert, ...state.alerts];
      if (next.length <= 10) return { alerts: next };
      return {
        alerts: next.map((a, i) =>
          i >= 10 ? { ...a, dismissed: true, read: true } : a,
        ),
      };
    });
    useToastStore.getState().addToast(alert.message, alert.severity, vehicle.label);
  },
}));
