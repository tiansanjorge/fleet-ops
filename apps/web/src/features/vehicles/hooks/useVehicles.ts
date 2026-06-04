import { useEffect } from "react";
import { useVehicleStore } from "../store/vehicleStore";
import { startRealtimeEngine } from "../../../core/realtime/realtimeEngine";
import { apiFetch } from "@/core/api/client";

export function useVehicles() {
  const vehicles = useVehicleStore((state) => state.vehicles);
  const setVehicles = useVehicleStore((state) => state.setVehicles);
  const updatePositions = useVehicleStore((state) => state.updatePositions);

  useEffect(() => {
    apiFetch("/vehicles")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: unknown) => { if (Array.isArray(data)) setVehicles(data); })
      .catch(() => {});
  }, [setVehicles]);

  useEffect(() => {
    const stop = startRealtimeEngine(updatePositions);
    return stop;
  }, [updatePositions]);

  return { vehicles };
}
