"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { useVehicles } from "../hooks/useVehicles";
import { useVehicleStore } from "../store/vehicleStore";
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

// Created once — never changes
const hqIcon = createHQIcon();

function createHQIcon(): L.DivIcon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect x="2" y="2" width="28" height="28" rx="6" fill="#ffa500" stroke="#1a7bea" stroke-width="2"/>
      <path d="M16 8 L26 17 L23 17 L23 25 L19 25 L19 20 L13 20 L13 25 L9 25 L9 17 L6 17 Z"
        fill="#0453ae"/>

        
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function createStatusIcon(status: VehicleStatus, selected = false): L.DivIcon {
  const color = STATUS_COLOR[status];
  const [w, h] = selected ? [36, 46] : [28, 36];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h],
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

  const icon = useMemo(
    () => createStatusIcon(vehicle?.status ?? "stopped", selected),
    [vehicle?.status, selected],
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
          className="absolute bottom-6 left-6 z-1000 flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-md border border-border/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-card/95 transition-colors duration-150 cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="7" y1="1" x2="7" y2="13" />
            <line x1="1" y1="7" x2="13" y2="7" />
          </svg>
          Add vehicle
        </button>
      )}

      {addOpen && <VehicleFormModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
