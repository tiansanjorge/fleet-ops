"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const FEATURES = [
  "Live vehicle positions updated via WebSocket",
  "Alerts generated every ~5s by the simulation engine",
  "Click any marker on the map to inspect a vehicle",
  "Manage alerts from the panel: read, dismiss, filter by severity",
  "Role-based access control — admin, operator, viewer",
];

export function InfoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-2000 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Truck image header */}
        <div className="relative h-32 w-full bg-muted">
          <Image
            src="/truck.webp"
            alt="Fleet truck"
            fill
            className="object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-linear-to-t from-card/80 to-transparent" />
        </div>

        <div className="p-5">
          {/* Logo + title */}
          <div className="flex items-center gap-2 mb-2">
            <Image src="/logo.webp" alt="FleetOps" width={24} height={24} className="rounded" />
            <span className="text-sm font-semibold text-foreground">Fleet Operations Center</span>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Real-time fleet control demo — built with Next.js, Fastify, Socket.io and Prisma.
          </p>

          <ul className="space-y-2 mb-5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="shrink-0 text-primary font-bold leading-none mt-px">›</span>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setVisible(false)}
            className="w-full rounded-md bg-primary hover:bg-primary/75 text-primary-foreground text-xs font-semibold py-2.5 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>

        {/* Close button — top-right corner of the card, over the image */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Dismiss"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
