import type { VehicleStatus } from "@/features/vehicles/types";
import type { AlertSeverity } from "@/features/alerts/types";

type BadgeVariant = VehicleStatus | AlertSeverity;

interface BadgeProps {
  variant: BadgeVariant;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; label: string }
> = {
  moving: { bg: "bg-green-500/15", text: "text-green-400", label: "moving" },
  idle: { bg: "bg-amber-400/15", text: "text-amber-400", label: "idle" },
  stopped: { bg: "bg-red-500/15", text: "text-red-400", label: "stopped" },
  low: { bg: "bg-yellow-500/15", text: "text-yellow-400", label: "low" },
  medium: { bg: "bg-orange-500/15", text: "text-orange-400", label: "medium" },
  critical: { bg: "bg-red-500/15", text: "text-red-400", label: "critical" },
};

export function Badge({ variant }: BadgeProps) {
  const { bg, text, label } = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  );
}
