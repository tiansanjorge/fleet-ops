"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import AlertList from "@/features/alerts/components/AlertList";
import { useAlertStore } from "@/features/alerts/store/alertStore";

const Map = dynamic(() => import("@/features/vehicles/components/Map"), {
  ssr: false,
});

export default function Home() {
  const [panelOpen, setPanelOpen] = useState(true);
  const unread = useAlertStore(
    (state) => state.alerts.filter((a) => !a.read && !a.dismissed).length,
  );

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {/* Map always fills the full viewport */}
      <Map />

      {/* Overlay panel — floats on top of the map, never affects its size */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: "320px",
          display: panelOpen ? "flex" : "none",
          flexDirection: "column",
          boxShadow: "-4px 0 16px rgba(0,0,0,0.15)",
          zIndex: 1000,
        }}
      >
        <AlertList onClose={() => setPanelOpen(false)} />
      </div>

      {/* Floating bell button — visible only when panel is closed */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          aria-label="Open alerts panel"
          style={{
            position: "absolute",
            bottom: "24px",
            right: "24px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#1f2937",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
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
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                background: "#ef4444",
                color: "white",
                fontSize: "10px",
                fontWeight: "bold",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
