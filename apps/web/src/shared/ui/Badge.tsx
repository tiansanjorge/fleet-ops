import type { VehicleStatus, AlertSeverity } from "@fleetops/types";

type BadgeVariant = VehicleStatus | AlertSeverity;

interface BadgeProps {
  variant: BadgeVariant;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; ring: string; label: string }
> = {
  moving: {
    bg: "bg-green-100 dark:bg-green-900/50",
    text: "text-green-700 dark:text-green-300",
    ring: "ring-1 ring-inset ring-green-600/50 dark:ring-green-500/40",
    label: "moving",
  },
  idle: {
    bg: "bg-amber-100 dark:bg-amber-900/50",
    text: "text-amber-700 dark:text-amber-300",
    ring: "ring-1 ring-inset ring-amber-600/50 dark:ring-amber-500/40",
    label: "idle",
  },
  stopped: {
    bg: "bg-red-100 dark:bg-red-900/50",
    text: "text-red-700 dark:text-red-300",
    ring: "ring-1 ring-inset ring-red-600/50 dark:ring-red-500/40",
    label: "stopped",
  },
  low: {
    bg: "bg-yellow-100 dark:bg-yellow-900/50",
    text: "text-yellow-700 dark:text-yellow-300",
    ring: "ring-1 ring-inset ring-yellow-600/50 dark:ring-yellow-500/40",
    label: "low",
  },
  medium: {
    bg: "bg-orange-100 dark:bg-orange-900/50",
    text: "text-orange-700 dark:text-orange-300",
    ring: "ring-1 ring-inset ring-orange-600/50 dark:ring-orange-500/40",
    label: "medium",
  },
  critical: {
    bg: "bg-red-100 dark:bg-red-900/50",
    text: "text-red-700 dark:text-red-300",
    ring: "ring-1 ring-inset ring-red-600/50 dark:ring-red-500/40",
    label: "critical",
  },
};

export function Badge({ variant }: BadgeProps) {
  const { bg, text, ring, label } = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${bg} ${text} ${ring}`}
    >
      {label}
    </span>
  );
}
