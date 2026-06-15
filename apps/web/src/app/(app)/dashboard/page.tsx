"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import AlertList from "@/features/alerts/components/AlertList";
import { useAlerts } from "@/features/alerts/hooks/useAlerts";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAuthStore } from "@/core/auth/authStore";
import { ToastContainer } from "@/shared/ui/Toast";
import { InfoBanner } from "@/shared/ui/InfoBanner";

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
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.replace("/");
    }
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) return null;

  return (
    <div className="relative h-full overflow-hidden">
      <Map />
      <InfoBanner />

      {/* Overlay panel — full-screen on mobile, floating panel on desktop */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="alerts-panel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-4 md:inset-auto md:top-4 md:right-4 z-1000 md:w-100 md:h-[calc(100vh-2rem)] flex flex-col"
          >
            <AlertList onClose={() => setPanelOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer onOpen={() => setPanelOpen(true)} />

      {/* Floating bell button — visible only when panel is closed */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          aria-label="Open alerts panel"
          className="absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer z-1000 bg-card/70 backdrop-blur-md text-foreground hover:bg-card/90 transition-colors duration-150"
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
            <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center bg-red-500 text-white text-[10px] font-medium leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
