"use client";

import { useVehicleStore } from "../store/vehicleStore";
import { useNeighborhood } from "../hooks/useNeighborhood";
import type { Vehicle } from "../types";
import { usePermission } from "@/core/permissions/usePermission";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { PanelHeader } from "@/shared/ui/PanelHeader";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground font-mono">
        {value}
      </span>
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
  const canEdit = can("edit:vehicle");

  return (
    <div className="absolute top-4 left-4 z-1000 w-72 overflow-hidden rounded-lg border border-border/50 bg-card/70 backdrop-blur-md">
      <div className="px-4 py-3">
        <PanelHeader title={vehicle.label} onClose={onClose} />
      </div>

      <div className="px-4 pb-4 flex flex-col gap-4">
        <Badge variant={vehicle.status} />

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

        {canEdit && (
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={() => console.log("edit", vehicle.id)}
          >
            Edit vehicle
          </Button>
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
