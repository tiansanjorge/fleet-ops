"use client";

import { useToastStore } from "./toastStore";
import type { AlertSeverity } from "@fleetops/types";

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  low: "border-yellow-400 bg-yellow-50 text-yellow-900",
  medium: "border-orange-400 bg-orange-50 text-orange-900",
  critical: "border-red-500 bg-red-50 text-red-900",
};

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  low: "bg-yellow-500",
  medium: "bg-orange-500",
  critical: "bg-red-500",
};

interface ToastContainerProps {
  onOpen: () => void;
}

export function ToastContainer({ onOpen }: ToastContainerProps) {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-1000 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => { removeToast(toast.id); onOpen(); }}
          className={`pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-lg border text-sm max-w-sm w-max shadow-lg cursor-pointer ${SEVERITY_STYLES[toast.severity]}`}
        >
          <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[toast.severity]}`} />
          <div className="flex flex-col gap-0.5">
            {toast.vehicleLabel && (
              <span className="text-xs font-semibold opacity-70">{toast.vehicleLabel}</span>
            )}
            <span className="leading-snug">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
