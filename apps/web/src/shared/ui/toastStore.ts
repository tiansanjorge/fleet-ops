import { create } from "zustand";
import type { AlertSeverity } from "@fleetops/types";

export interface ToastItem {
  id: string;
  message: string;
  severity: AlertSeverity;
  vehicleLabel?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, severity: AlertSeverity, vehicleLabel?: string) => void;
  removeToast: (id: string) => void;
}

let _counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message, severity, vehicleLabel) => {
    const id = `toast-${++_counter}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, severity, vehicleLabel }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4_000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
