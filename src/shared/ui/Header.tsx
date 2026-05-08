"use client";

import Image from "next/image";
import { useAuthStore } from "@/core/auth/authStore";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

const roleInitialColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-red-500/15", text: "text-red-400" },
  operator: { bg: "bg-blue-500/15", text: "text-blue-400" },
  viewer: { bg: "bg-zinc-500/15", text: "text-zinc-400" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Header() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const colorStyle = currentUser
    ? (roleInitialColors[currentUser.role] ?? roleInitialColors.viewer)
    : null;

  return (
    <header className="relative h-14 shrink-0 flex items-center justify-between px-6 bg-background/70 backdrop-blur-md border-b border-border/50">
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="FleetOps"
        width={120}
        height={36}
        priority
        className="object-contain"
      />

      {/* Right side: theme toggle + user info */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {currentUser && colorStyle && (
          <>
            <span className="text-sm text-muted">{currentUser.name}</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${colorStyle.bg} ${colorStyle.text}`}
            >
              {getInitials(currentUser.name)}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
