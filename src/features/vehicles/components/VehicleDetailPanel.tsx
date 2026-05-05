"use client";

import { useVehicleStore } from "../store/vehicleStore";
import { useNeighborhood } from "../hooks/useNeighborhood";
import type { Vehicle, VehicleStatus } from "../types";
import { usePermission } from "@/core/permissions/usePermission";

const STATUS_LABEL: Record<VehicleStatus, string> = {
  moving: "En movimiento",
  idle: "Inactivo",
  stopped: "Detenido",
};

const STATUS_COLOR: Record<VehicleStatus, string> = {
  moving: "bg-green-100 text-green-800",
  idle: "bg-yellow-100 text-yellow-800",
  stopped: "bg-red-100 text-red-800",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    </div>
  );
}

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
}

function Panel({ vehicle, onClose }: Props) {
  const { neighborhood, loading } = useNeighborhood(
    vehicle.id,
    vehicle.position,
  );
  const { can } = usePermission();

  return (
    <div className="absolute top-4 left-4 z-1000 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{vehicle.label}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none"
          aria-label="Cerrar panel"
        >
          ×
        </button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[vehicle.status]}`}
          >
            {STATUS_LABEL[vehicle.status]}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <DetailRow label="ID" value={vehicle.id} />
          <DetailRow
            label="Barrio"
            value={loading ? "Calculando…" : (neighborhood ?? "No disponible")}
          />
          {vehicle.driverId && (
            <DetailRow label="Driver ID" value={vehicle.driverId} />
          )}
        </div>

        {can("edit:vehicle") && (
          <button
            onClick={() => console.log("edit", vehicle.id)}
            className="w-full text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg py-2"
          >
            Edit vehicle
          </button>
        )}
      </div>
    </div>
  );
}

export default function VehicleDetailPanel() {
  const selectedId = useVehicleStore((state) => state.selectedVehicleId);
  const vehicles = useVehicleStore((state) => state.vehicles);
  const selectVehicle = useVehicleStore((state) => state.selectVehicle);

  const vehicle = vehicles.find((v) => v.id === selectedId) ?? null;

  if (!vehicle) return null;

  return <Panel vehicle={vehicle} onClose={() => selectVehicle(null)} />;
}
