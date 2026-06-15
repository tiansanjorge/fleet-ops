"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { useVehicles } from "../hooks/useVehicles";
import { useVehicleStore } from "../store/vehicleStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useShallow } from "zustand/react/shallow";
import { FLEETOPS_HQ } from "../hooks/useVehicleMutations";
import VehicleDetailPanel from "./VehicleDetailPanel";
import { VehicleFormModal } from "./VehicleFormModal";
import { usePermission } from "@/core/permissions/usePermission";
import type { VehicleStatus } from "@fleetops/types";

const STATUS_COLOR: Record<VehicleStatus, string> = {
  moving: "#22c55e", // green-500
  idle: "#f59e0b", // amber-400
  stopped: "#ef4444", // red-500
};

const ALERT_COLOR: Record<string, string> = {
  critical: "#ef4444", // red-500
  medium: "#f97316",   // orange-500
  low: "#eab308",      // yellow-500
};

// Created once — never changes
const hqIcon = createHQIcon();

function createHQIcon(): L.DivIcon {
  return L.divIcon({
    html: `<img src="/favicon.webp" style="width:46px;height:46px;display:block;object-fit:contain;cursor:grab;" />`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function createStatusIcon(status: VehicleStatus, selected = false, alertColor?: string): L.DivIcon {
  const color = alertColor ?? STATUS_COLOR.moving; // sin alerta → siempre verde
  const size = selected ? 56 : 48;
  const badgeSize = selected ? 14 : 12;
  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;">
      <img src="/truck-marker.webp" style="width:${size}px;height:${size}px;display:block;object-fit:contain;" />
      <span style="position:absolute;bottom:10px;right:10px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:${color};border:2px solid white;box-sizing:border-box;z-index:1000;"></span>
    </div>
  `.trim();
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const center: LatLngExpression = [-34.6, -58.45];

interface VehicleMarkerProps {
  id: string;
  onSelect: (id: string) => void;
}

// Each marker subscribes only to its own vehicle slice.
// The parent Map never re-renders on position ticks — only on id list changes.
const VehicleMarker = memo(function VehicleMarker({
  id,
  onSelect,
}: VehicleMarkerProps) {
  const vehicle = useVehicleStore((state) =>
    state.vehicles.find((v) => v.id === id),
  );
  const selected = useVehicleStore((state) => state.selectedVehicleId === id);

  // Retorna el color de la alerta activa de mayor severidad (string primitivo → no re-renderiza innecesariamente)
  const alertColor = useAlertStore((state) => {
    const active = state.alerts.filter((a) => a.vehicleId === id && !a.dismissed);
    if (active.some((a) => a.severity === "critical")) return ALERT_COLOR.critical;
    if (active.some((a) => a.severity === "medium")) return ALERT_COLOR.medium;
    if (active.some((a) => a.severity === "low")) return ALERT_COLOR.low;
    return undefined;
  });

  const icon = useMemo(
    () => createStatusIcon(vehicle?.status ?? "stopped", selected, alertColor),
    [vehicle?.status, selected, alertColor],
  );

  if (!vehicle) return null;

  return (
    <Marker
      position={vehicle.position}
      icon={icon}
      eventHandlers={{ click: () => onSelect(id) }}
    />
  );
});

function MapFocusController() {
  const map = useMap();
  const selectedId = useVehicleStore((state) => state.selectedVehicleId);

  useEffect(() => {
    if (!selectedId) return;
    const vehicle = useVehicleStore
      .getState()
      .vehicles.find((v) => v.id === selectedId);
    if (vehicle) {
      map.flyTo(vehicle.position as LatLngExpression, 15, { duration: 0.8 });
    }
    // vehicles excluded intentionally — avoids re-flying on every position tick
  }, [selectedId, map]);

  return null;
}

export default function Map() {
  // Starts fetch + realtime engine — vehicles go into the store
  useVehicles();

  // Only re-renders Map when IDs change (vehicle added/removed), not on position ticks
  const vehicleIds = useVehicleStore(
    useShallow((state) => state.vehicles.map((v) => v.id)),
  );
  const selectVehicle = useVehicleStore((state) => state.selectVehicle);
  const { can } = usePermission();
  const canCreate = can("create:vehicle");
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapFocusController />
        <Marker position={FLEETOPS_HQ} icon={hqIcon} />
        {vehicleIds.map((id) => (
          <VehicleMarker key={id} id={id} onSelect={selectVehicle} />
        ))}
      </MapContainer>
      <VehicleDetailPanel />

      {canCreate && (
        <button
          onClick={() => setAddOpen(true)}
          aria-label="Add vehicle"
          className="absolute bottom-6 left-6 z-1000 flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-md border border-border/50 px-4  text-sm font-medium text-foreground hover:bg-card/95 transition-colors duration-150 cursor-pointer"
        >
          <img
            src="/truck-marker.webp"
            alt=""
            style={{ width: 50, height: 50, objectFit: "contain" }}
          />
          Add vehicle
        </button>
      )}

      <AnimatePresence>
        {addOpen && <VehicleFormModal onClose={() => setAddOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
