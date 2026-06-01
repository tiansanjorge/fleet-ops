import { useEffect } from "react";
import { useAlertStore } from "../store/alertStore";
import { useVehicleStore } from "@/features/vehicles/store/vehicleStore";
import { startRealtimeEngine } from "@/core/realtime/realtimeEngine";

export function useAlerts() {
  const alerts = useAlertStore((state) => state.alerts);
  const setAlerts = useAlertStore((state) => state.setAlerts);
  const maybeGenerateAlert = useAlertStore((state) => state.maybeGenerateAlert);
  const fireDemoAlert = useAlertStore((state) => state.fireDemoAlert);

  useEffect(() => {
    fetch("/alerts")
      .then((res) => res.json())
      .then((data) => setAlerts(data));
  }, [setAlerts]);

  // Guaranteed alert 5s after mount so recruiters see the feature immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      const vehicles = useVehicleStore.getState().vehicles;
      fireDemoAlert(vehicles);
    }, 5_000);
    return () => clearTimeout(timer);
  }, [fireDemoAlert]);

  useEffect(() => {
    // Read vehicle IDs from store inside the tick to avoid restarting
    // the engine every time vehicle positions change
    const stop = startRealtimeEngine(() => {
      const vehicles = useVehicleStore.getState().vehicles;
      maybeGenerateAlert(vehicles);
    });
    return stop;
  }, [maybeGenerateAlert]);

  return { alerts };
}
