"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/core/auth/authStore";
import { usePermission } from "@/core/permissions/usePermission";
import { useUserStore } from "@/features/users/store/userStore";
import { UserList } from "@/features/users/components/UserList";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

const roleInitialColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-red-900", text: "text-white" },
  operator: { bg: "bg-blue-900", text: "text-white" },
  viewer: { bg: "bg-zinc-500", text: "text-white" },
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
  const clearUser = useAuthStore((state) => state.clearUser);
  const { can } = usePermission();
  const panelOpen = useUserStore((state) => state.panelOpen);
  const setPanelOpen = useUserStore((state) => state.setPanelOpen);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const colorStyle = currentUser
    ? (roleInitialColors[currentUser.role] ?? roleInitialColors.viewer)
    : null;

  // Close avatar menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideAvatar = avatarRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideAvatar && !insideDropdown) {
        setAvatarMenuOpen(false);
      }
    }
    if (avatarMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [avatarMenuOpen]);

  function handleSignOut() {
    setAvatarMenuOpen(false);
    clearUser();
    router.push("/");
  }

  return (
    <>
      <header className="relative h-14 shrink-0 flex items-center justify-between px-6 border-b border-border/50 overflow-hidden">
        {/* Background image */}
        <Image
          src="/header-lg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        {/* Overlay for contrast — light en light mode, dark en dark mode */}
        <div
          className="absolute inset-0 bg-white/15 dark:bg-black/45"
          aria-hidden="true"
        />

        {/* Logo */}
        <Image
          src="/logo.webp"
          alt="FleetOps"
          width={120}
          height={36}
          priority
          className="relative z-10 object-contain"
        />

        {/* Right side: theme toggle + users button + user info */}
        <div className="relative z-10 flex items-center gap-3">
          <ThemeToggle />

          {can("manage:users") && (
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              aria-label="Toggle users panel"
              aria-pressed={panelOpen}
              className={`cursor-pointer flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                panelOpen
                  ? "bg-zinc-200 text-foreground dark:bg-zinc-700"
                  : "bg-zinc-100 text-foreground hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Manage users
            </button>
          )}

          {currentUser && colorStyle && (
            <div ref={avatarRef}>
              <button
                onClick={() => setAvatarMenuOpen((o) => !o)}
                aria-label="User menu"
                aria-expanded={avatarMenuOpen}
                className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-150 ${colorStyle.bg} ${colorStyle.text}`}
              >
                {getInitials(currentUser.name)}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Avatar dropdown — fixed to avoid backdrop-blur stacking context */}
      {/* onMouseDown stopPropagation prevents the document mousedown listener from unmounting this before onClick fires */}
      {avatarMenuOpen && currentUser && (
        <div
          ref={dropdownRef}
          className="fixed top-14 right-2.25 z-1001 w-48 rounded-b-lg border border-border bg-card py-1"
        >
          <div className="px-3 py-2 border-b border-border/50">
            <p className="text-xs font-medium text-foreground truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-muted capitalize">
              {currentUser.role}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      )}

      {/* Users modal — centered overlay */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-1001 flex items-center justify-center"
          onClick={() => setPanelOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <UserList onClose={() => setPanelOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
