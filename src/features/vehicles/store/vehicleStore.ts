import { create } from "zustand";
import { Vehicle } from "../types";

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
  setVehicles: (vehicles: Vehicle[]) => void;
  updatePositions: () => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: [],

  setVehicles: (vehicles) => set({ vehicles }),

  updatePositions: () =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => {
        if (v.status !== "moving") return v;

        const heading = nextHeading(v.id);
        return {
          ...v,
          position: [
            v.position[0] + Math.cos(heading) * SPEED,
            v.position[1] + Math.sin(heading) * SPEED,
          ] as [number, number],
        };
      }),
    })),
}));
