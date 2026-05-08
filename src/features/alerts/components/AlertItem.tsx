"use client";

import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { useAlertStore } from "../store/alertStore";
import { useVehicleStore } from "@/features/vehicles/store/vehicleStore";
import type { Alert, AlertSeverity } from "../types";

const SEVERITY_ROW: Record<AlertSeverity, string> = {
  low: "border-l-4 border-yellow-400 dark:border-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/15",
  medium:
    "border-l-4 border-orange-400 dark:border-orange-500 bg-orange-500/10 dark:bg-orange-500/15",
  critical:
    "border-l-4 border-red-500 dark:border-red-400 bg-red-500/10 dark:bg-red-500/15",
};

interface AlertItemProps {
  alert: Alert;
  showDismiss: boolean;
}

export function AlertItem({ alert, showDismiss }: AlertItemProps) {
  const markAsRead = useAlertStore((state) => state.markAsRead);
  const dismissAlert = useAlertStore((state) => state.dismissAlert);
  const selectVehicle = useVehicleStore((state) => state.selectVehicle);

  const dimmed = alert.read || alert.dismissed;

  return (
    <div
      className={`rounded p-3 ${SEVERITY_ROW[alert.severity]} ${dimmed ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant={alert.severity} />
        <span className="font-mono text-xs text-muted" suppressHydrationWarning>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <p className="mt-1 text-sm leading-snug text-zinc-700 dark:text-zinc-300">
        {alert.message}
      </p>

      <button
        onClick={() => selectVehicle(alert.vehicleId)}
        className="mt-0.5 block cursor-pointer font-mono text-xs text-muted underline decoration-muted transition-colors duration-150 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        {alert.vehicleId}
      </button>

      {!alert.dismissed && (
        <div className="mt-1.5 flex gap-2">
          {!alert.read && (
            <Button
              variant="ghost"
              className="px-2 py-0.5 text-xs"
              onClick={() => markAsRead(alert.id)}
            >
              Mark as read
            </Button>
          )}
          {showDismiss && (
            <Button
              variant="danger"
              className="px-2 py-0.5 text-xs"
              onClick={() => dismissAlert(alert.id)}
            >
              Dismiss
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
