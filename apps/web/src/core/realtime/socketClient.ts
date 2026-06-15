import { io, type Socket } from "socket.io-client";
import { useVehicleStore } from "@/features/vehicles/store/vehicleStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAuthStore } from "@/core/auth/authStore";
import { useToastStore } from "@/shared/ui/toastStore";
import type { Alert, Vehicle } from "@fleetops/types";


const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

// Singleton: una sola conexión aunque múltiples hooks llamen a connectSocket().
// El refCount asegura que solo se desconecta cuando el último consumidor hace cleanup.
let socket: Socket | null = null;
let refCount = 0;

export function connectSocket(): () => void {
  if (!socket) {
    const token = useAuthStore.getState().token;
    socket = io(WS_URL, { auth: { token } });

    socket.on("vehicle:position", (data: { id: string; position: [number, number]; status: Vehicle["status"] }) => {
      useVehicleStore.getState().patchVehicle(data.id, {
        position: data.position,
        status: data.status,
      });
    });

    socket.on("vehicle:created", (vehicle: Vehicle) => {
      useVehicleStore.getState().addVehicle(vehicle);
    });

    socket.on("vehicle:updated", (vehicle: Vehicle) => {
      useVehicleStore.getState().updateVehicle(vehicle);
    });

    socket.on("vehicle:deleted", (data: { id: string }) => {
      useVehicleStore.getState().removeVehicle(data.id);
    });

    socket.on("alert:new", (alert: Alert) => {
      useAlertStore.getState().addAlert(alert);
      const vehicle = useVehicleStore.getState().vehicles.find((v) => v.id === alert.vehicleId);
      useToastStore.getState().addToast(alert.message, alert.severity, vehicle?.label);
    });
  }

  refCount++;

  return () => {
    refCount--;
    if (refCount === 0 && socket) {
      socket.disconnect();
      socket = null;
    }
  };
}
