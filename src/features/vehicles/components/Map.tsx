"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { useVehicles } from "../hooks/useVehicles";
import { useVehicleStore } from "../store/vehicleStore";
import VehicleDetailPanel from "./VehicleDetailPanel";
import type { VehicleStatus } from "../types";

const STATUS_COLOR: Record<VehicleStatus, string> = {
  moving: "#22c55e", // green-500
  idle: "#f59e0b", // amber-400
  stopped: "#ef4444", // red-500
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, map]);

  return null;
}

export default function Map() {
  const { vehicles } = useVehicles();
  const selectVehicle = useVehicleStore((state) => state.selectVehicle);
  const selectedId = useVehicleStore((state) => state.selectedVehicleId);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {" "}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapFocusController />
        {vehicles.map((v) => (
          <Marker
            key={v.id}
            position={v.position}
            icon={createStatusIcon(v.status, v.id === selectedId)}
            eventHandlers={{ click: () => selectVehicle(v.id) }}
          />
        ))}
      </MapContainer>
      <VehicleDetailPanel />
    </div>
  );
}
