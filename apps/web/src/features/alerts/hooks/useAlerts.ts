import { useEffect } from "react";
import { useAlertStore } from "../store/alertStore";
import { useVehicleStore } from "@/features/vehicles/store/vehicleStore";
import { startRealtimeEngine } from "@/core/realtime/realtimeEngine";
import { apiFetch } from "@/core/api/client";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK === "true";

export function useAlerts() {
  const alerts = useAlertStore((state) => state.alerts);
  const setAlerts = useAlertStore((state) => state.setAlerts);
  const maybeGenerateAlert = useAlertStore((state) => state.maybeGenerateAlert);
  const fireDemoAlert = useAlertStore((state) => state.fireDemoAlert);

  useEffect(() => {
    apiFetch("/alerts")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: unknown) => { if (Array.isArray(data)) setAlerts(data); })
      .catch(() => {});
  }, [setAlerts]);

  // Demo alert garantizada a los 5s — solo en modo mock para no mezclar
  // alertas locales con las que ya llegan del servidor vía socket.
  useEffect(() => {
    if (!IS_MOCK) return;
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
