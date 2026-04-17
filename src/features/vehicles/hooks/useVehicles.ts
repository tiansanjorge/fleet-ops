import { useEffect } from "react";
import { useVehicleStore } from "../store/vehicleStore";
import { startRealtimeEngine } from "../../../core/realtime/realtimeEngine";

export function useVehicles() {
  const vehicles = useVehicleStore((state) => state.vehicles);
  const setVehicles = useVehicleStore((state) => state.setVehicles);
  const updatePositions = useVehicleStore((state) => state.updatePositions);

  useEffect(() => {
    fetch("/vehicles")
      .then((res) => res.json())
      .then((data) => setVehicles(data));
  }, [setVehicles]);

  useEffect(() => {
    const stop = startRealtimeEngine(updatePositions);
    return stop;
  }, [updatePositions]);

  return { vehicles };
}
