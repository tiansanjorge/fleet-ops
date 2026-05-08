"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AlertList from "@/features/alerts/components/AlertList";
import { useAlerts } from "@/features/alerts/hooks/useAlerts";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAuthStore } from "@/core/auth/authStore";

const Map = dynamic(() => import("@/features/vehicles/components/Map"), {
  ssr: false,
});

export default function Dashboard() {
  const [panelOpen, setPanelOpen] = useState(true);
  const router = useRouter();
  useAlerts();
  const unread = useAlertStore(
    (state) => state.alerts.filter((a) => !a.read && !a.dismissed).length,
  );
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/");
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <div className="relative h-full overflow-hidden">
      {/* Map always fills the full viewport */}
      <Map />

      {/* Overlay panel — floats on top of the map, never affects its size */}
      {panelOpen && (
        <div className="absolute top-4 right-4 z-1000 w-80 max-h-[calc(100vh-2rem)] flex flex-col">
          <AlertList onClose={() => setPanelOpen(false)} />
        </div>
      )}

      {/* Floating bell button — visible only when panel is closed */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          aria-label="Open alerts panel"
          className="absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer z-1000 bg-foreground hover:bg-zinc-700 dark:hover:bg-zinc-600 text-background transition-colors duration-150"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center bg-red-500 text-white text-[10px] font-medium leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
