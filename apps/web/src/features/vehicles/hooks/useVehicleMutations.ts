import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useVehicleStore } from "../store/vehicleStore";
import type { Vehicle } from "@fleetops/types";

export type VehicleFormData = {
  label: string;
};

// FleetOps HQ — vehicles are registered here before being dispatched
export const FLEETOPS_HQ: [number, number] = [-34.6062, -58.4788]; // Seguí y Añasco, La Paternal, CABA

export function useVehicleMutations() {
  const addVehicle = useVehicleStore((state) => state.addVehicle);
  const updateVehicle = useVehicleStore((state) => state.updateVehicle);
  const removeVehicle = useVehicleStore((state) => state.removeVehicle);
  const bootVehicle = useVehicleStore((state) => state.bootVehicle);
  const removeAlertsByVehicle = useAlertStore(
    (state) => state.removeAlertsByVehicle,
  );

  async function createVehicle(data: VehicleFormData): Promise<void> {
    const payload: Omit<Vehicle, "id"> = {
      label: data.label.trim(),
      status: "stopped",
      position: FLEETOPS_HQ,
    };
    const res = await fetch("/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create vehicle");
    const created: Vehicle = await res.json();
    addVehicle(created);
    bootVehicle(created.id);
  }

  async function editVehicle(
    vehicle: Vehicle,
    data: VehicleFormData,
  ): Promise<void> {
    const payload: Vehicle = {
      ...vehicle,
      label: data.label.trim(),
    };
    const res = await fetch(`/vehicles/${vehicle.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update vehicle");
    const updated: Vehicle = await res.json();
    updateVehicle(updated);
  }

  async function deleteVehicle(id: string): Promise<void> {
    const res = await fetch(`/vehicles/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete vehicle");
    removeVehicle(id);
    removeAlertsByVehicle(id);
  }

  return { createVehicle, editVehicle, deleteVehicle };
}
