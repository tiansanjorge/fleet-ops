"use client";

import { useState } from "react";
import React from "react";
import { useVehicleStore } from "../store/vehicleStore";
import { useVehicleMutations } from "../hooks/useVehicleMutations";
import { useNeighborhood } from "../hooks/useNeighborhood";
import type { Vehicle } from "../types";
import { usePermission } from "@/core/permissions/usePermission";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { VehicleFormModal } from "./VehicleFormModal";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
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
  const canDelete = can("delete:vehicle");

  const { deleteVehicle } = useVehicleMutations();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteVehicle(vehicle.id);
      onClose();
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div className="absolute top-4 left-4 z-1000 w-[calc(100vw-2rem)] md:w-72 overflow-hidden rounded-lg border border-border/50 bg-card/70 backdrop-blur-md">
        <div className="px-4 py-3">
          <PanelHeader title={vehicle.label} onClose={onClose} />
        </div>

        <div className="px-4 pb-4 flex flex-col gap-4">
          <Badge variant={vehicle.status} />

          <div className="flex flex-col gap-3">
            <DetailRow label="ID" value={vehicle.id} />
            <DetailRow
              label="Barrio"
              value={
                loading ? (
                  <span className="inline-block w-28 h-4 rounded bg-surface-raised animate-pulse" />
                ) : (
                  (neighborhood ?? "No disponible")
                )
              }
            />
          </div>

          {(canEdit || canDelete) && (
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="primary"
                  className="flex-1 justify-center"
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  className="flex-1 justify-center"
                  onClick={() => setConfirmOpen(true)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <VehicleFormModal
          vehicle={vehicle}
          onClose={() => setEditOpen(false)}
        />
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-2000 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-medium text-foreground">
              Delete vehicle
            </h2>
            <p className="mt-2 text-sm text-muted">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {vehicle.label}
              </span>
              ? This action is irreversible.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
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
