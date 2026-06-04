"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Vehicle } from "@fleetops/types";
import {
  useVehicleMutations,
  type VehicleFormData,
} from "../hooks/useVehicleMutations";
import { useVehicleStore } from "../store/vehicleStore";
import { Button } from "@/shared/ui/Button";

interface Props {
  /** Vehicle to edit. Undefined means create mode. */
  vehicle?: Vehicle;
  onClose: () => void;
}

export function VehicleFormModal({ vehicle, onClose }: Props) {
  const isEdit = Boolean(vehicle);
  const { createVehicle, editVehicle } = useVehicleMutations();
  const vehicles = useVehicleStore((state) => state.vehicles);

  const [label, setLabel] = useState(vehicle?.label ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError("Label is required");
      return;
    }
    const duplicate = vehicles.some(
      (v) =>
        v.label.trim().toLowerCase() === label.trim().toLowerCase() &&
        v.id !== vehicle?.id,
    );
    if (duplicate) {
      setError("A vehicle with that label already exists");
      return;
    }
    setLoading(true);
    setError(null);
    const data: VehicleFormData = { label };
    try {
      if (isEdit && vehicle) {
        await editVehicle(vehicle, data);
      } else {
        await createVehicle(data);
      }
      onClose();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-2000 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
      >
        <h2 className="mb-4 text-base font-medium text-foreground">
          {isEdit ? "Edit vehicle" : "Add vehicle"}
        </h2>

        {!isEdit && (
          <div className="mb-4 flex justify-center">
            <Image src="/truck-marker.webp" alt="" width={120} height={120} className="object-contain" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted" htmlFor="vf-label">
              Label
            </label>
            <input
              id="vf-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Truck 09"
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground/30"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="mt-1 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save changes" : "Add vehicle"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
