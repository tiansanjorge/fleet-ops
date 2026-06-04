"use client";

import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { useAlertMutations } from "../hooks/useAlertMutations";
import { useVehicleStore } from "@/features/vehicles/store/vehicleStore";
import type { Alert, AlertSeverity } from "@fleetops/types";

const SEVERITY_ROW: Record<AlertSeverity, string> = {
  low: "border-l-4 border-yellow-400 dark:border-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/15",
  medium:
    "border-l-4 border-orange-400 dark:border-orange-500 bg-orange-500/10 dark:bg-orange-500/15",
  critical:
    "border-l-4 border-red-500 dark:border-red-400 bg-red-500/10 dark:bg-red-500/15",
};

const SEVERITY_ROW_DIMMED: Record<AlertSeverity, string> = {
  low: "border-l-4 border-yellow-400/30 dark:border-yellow-500/30 bg-yellow-500/5 dark:bg-yellow-500/5",
  medium:
    "border-l-4 border-orange-400/30 dark:border-orange-500/30 bg-orange-500/5 dark:bg-orange-500/5",
  critical:
    "border-l-4 border-red-500/30 dark:border-red-400/30 bg-red-500/5 dark:bg-red-500/5",
};

interface AlertItemProps {
  alert: Alert;
  showDismiss: boolean;
}

export function AlertItem({ alert, showDismiss }: AlertItemProps) {
  const { markAsRead, markAsUnread, dismissAlert } = useAlertMutations();
  const selectVehicle = useVehicleStore((state) => state.selectVehicle);
  const vehicleLabel = useVehicleStore(
    (state) => state.vehicles.find((v) => v.id === alert.vehicleId)?.label ?? alert.vehicleId,
  );

  const dimmed = alert.read || alert.dismissed;

  return (
    <div
      className={`rounded p-3 ${dimmed ? SEVERITY_ROW_DIMMED[alert.severity] : SEVERITY_ROW[alert.severity]}`}
    >
      <div className={dimmed ? "opacity-50" : ""}>
        <div className="flex items-center justify-between gap-2">
          <Badge variant={alert.severity} />
          <span
            className="font-mono text-xs text-muted"
            suppressHydrationWarning
          >
            {new Date(alert.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <p className="mt-2 text-sm leading-snug text-zinc-700 dark:text-zinc-300">
          {alert.message}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        {alert.dismissed ? (
          <span className="inline-flex cursor-default items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-muted/50 opacity-50 dark:bg-zinc-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-3 w-3 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
            {vehicleLabel}
          </span>
        ) : (
          <>
            <button
              onClick={() => selectVehicle(alert.vehicleId)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-muted transition-colors duration-150 hover:bg-zinc-300 hover:text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-3 w-3 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
              {vehicleLabel}
            </button>
            {!alert.read ? (
              <Button
                variant="ghost"
                className="px-2 py-0.5 text-xs"
                onClick={() => markAsRead(alert.id)}
              >
                Mark as read
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="px-2 py-0.5 text-xs"
                onClick={() => markAsUnread(alert.id)}
              >
                Mark as unread
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
          </>
        )}
      </div>
    </div>
  );
}
