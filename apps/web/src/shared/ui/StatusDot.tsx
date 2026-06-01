import type { VehicleStatus, AlertSeverity } from "@fleetops/types";

type StatusDotVariant = VehicleStatus | AlertSeverity;

interface StatusDotProps {
  status: StatusDotVariant;
}

const colorMap: Record<StatusDotVariant, string> = {
  moving: "bg-green-500",
  idle: "bg-amber-400",
  stopped: "bg-red-500",
  low: "bg-yellow-500",
  medium: "bg-orange-500",
  critical: "bg-red-500",
};

export function StatusDot({ status }: StatusDotProps) {
  return (
    <span
      className={`inline-block size-2 rounded-full shrink-0 ${colorMap[status]}`}
      aria-label={status}
    />
  );
}
