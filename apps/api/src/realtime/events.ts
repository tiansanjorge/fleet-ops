// Nombres de eventos server -> cliente. Única fuente de verdad para evitar
// typos entre el emisor (simulación / routes) y el futuro cliente socket.
export const EVENTS = {
  VEHICLE_POSITION: "vehicle:position",
  VEHICLE_CREATED: "vehicle:created",
  VEHICLE_UPDATED: "vehicle:updated",
  VEHICLE_DELETED: "vehicle:deleted",
  ALERT_NEW: "alert:new",
} as const;
