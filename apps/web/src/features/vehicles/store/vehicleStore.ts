import { create } from "zustand";
import { Vehicle, VehicleStatus } from "@fleetops/types";

// --- Status transition probabilities per tick ---
// A vehicle can change status occasionally to keep the simulation coherent.
// Values tuned so status changes happen every ~30–90 seconds on average.
const STATUS_TRANSITIONS: Record<
  VehicleStatus,
  Array<{ next: VehicleStatus; chance: number }>
> = {
  moving: [
    { next: "idle", chance: 0.008 }, // moving → idle (traffic stop)
  ],
  idle: [
    { next: "moving", chance: 0.025 }, // idle → moving (resumes route)
    { next: "stopped", chance: 0.005 }, // idle → stopped (parking)
  ],
  stopped: [
    { next: "idle", chance: 0.012 }, // stopped → idle (engine on)
  ],
};

// Tracks vehicles under a forced status override: vehicleId → expiry timestamp
const _forcedStops = new Map<string, number>();

// Tracks newly created vehicles in boot sequence: vehicleId → createdAt timestamp
// Phase 1: 0–5s  → stopped (parked at HQ)
// Phase 2: 5–10s → idle    (engine on, about to depart)
// Phase 3: 10s+  → normal simulation
const _bootSequence = new Map<string, number>();

function nextStatus(current: VehicleStatus, vehicleId: string): VehicleStatus {
  const bootedAt = _bootSequence.get(vehicleId);
  if (bootedAt !== undefined) {
    const elapsed = Date.now() - bootedAt;
    if (elapsed < 5_000) return "stopped";
    if (elapsed < 10_000) return "idle";
    _bootSequence.delete(vehicleId); // boot complete — dispatch immediately
    return "moving";
  }
  const forcedUntil = _forcedStops.get(vehicleId);
  if (forcedUntil !== undefined) {
    if (Date.now() < forcedUntil) return "stopped";
    _forcedStops.delete(vehicleId); // expired, resume normal transitions
  }
  for (const { next, chance } of STATUS_TRANSITIONS[current]) {
    if (Math.random() < chance) return next;
  }
  return current;
}

// Urban truck speed: ~0.00008 deg/tick ≈ 8m at 1.5s avg = ~19 km/h
const SPEED = 0.00008;
// Max heading change per tick in radians (~10°) — gradual turns, not teleporting
const MAX_TURN = 0.17;
// Probability of a larger turn (simulates a street corner)
const CORNER_CHANCE = 0.05;
const CORNER_ANGLE = Math.PI / 2; // 90° turn

// Internal simulation state — not part of the Vehicle domain type
const _headings = new Map<string, number>();

function getHeading(vehicleId: string): number {
  if (!_headings.has(vehicleId)) {
    _headings.set(vehicleId, Math.random() * 2 * Math.PI);
  }
  return _headings.get(vehicleId)!;
}

function nextHeading(vehicleId: string): number {
  let heading = getHeading(vehicleId);

  if (Math.random() < CORNER_CHANCE) {
    // Simulate turning at an intersection (90° left or right)
    heading += Math.random() < 0.5 ? CORNER_ANGLE : -CORNER_ANGLE;
  } else {
    // Gradual drift — small random steering correction
    heading += (Math.random() - 0.5) * MAX_TURN;
  }

  _headings.set(vehicleId, heading);
  return heading;
}

interface VehicleStore {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  setVehicles: (vehicles: Vehicle[]) => void;
  updatePositions: () => void;
  selectVehicle: (id: string | null) => void;
  forceStop: (vehicleId: string, durationMs: number) => void;
  bootVehicle: (vehicleId: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (updated: Vehicle) => void;
  patchVehicle: (id: string, patch: Partial<Omit<Vehicle, "id">>) => void;
  removeVehicle: (id: string) => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: [],
  selectedVehicleId: null,

  setVehicles: (vehicles) => set({ vehicles }),

  selectVehicle: (id) => set({ selectedVehicleId: id }),

  forceStop: (vehicleId, durationMs) => {
    _forcedStops.set(vehicleId, Date.now() + durationMs);
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === vehicleId ? { ...v, status: "stopped" } : v,
      ),
    }));
  },

  bootVehicle: (vehicleId) => {
    _bootSequence.set(vehicleId, Date.now());
  },

  addVehicle: (vehicle) =>
    set((state) => ({ vehicles: [...state.vehicles, vehicle] })),

  updateVehicle: (updated) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === updated.id ? updated : v)),
    })),

  patchVehicle: (id, patch) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    })),

  removeVehicle: (id) =>
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
      selectedVehicleId:
        state.selectedVehicleId === id ? null : state.selectedVehicleId,
    })),

  updatePositions: () =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => {
        const status = nextStatus(v.status, v.id);

        if (status !== "moving") return { ...v, status };

        const heading = nextHeading(v.id);
        return {
          ...v,
          status,
          position: [
            v.position[0] + Math.cos(heading) * SPEED,
            v.position[1] + Math.sin(heading) * SPEED,
          ] as [number, number],
        };
      }),
    })),
}));
