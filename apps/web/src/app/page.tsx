"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/core/auth/authStore";
import type { User } from "@fleetops/types";

const FAKE_USERS: User[] = [
  { id: "u1", name: "Ana García", role: "admin" },
  { id: "u2", name: "Carlos Méndez", role: "operator" },
  { id: "u3", name: "Laura Ríos", role: "viewer" },
];

const roleConfig: Record<
  string,
  { label: string; dot: string; accent: string }
> = {
  admin: { label: "Admin", dot: "bg-red-500", accent: "text-red-400" },
  operator: { label: "Operator", dot: "bg-blue-500", accent: "text-blue-400" },
  viewer: { label: "Viewer", dot: "bg-zinc-400", accent: "text-zinc-400" },
};

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(FAKE_USERS);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    fetch("/users")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: User[]) => setUsers(data))
      .catch(() => {});
  }, []);

  function handleLogin(user: User) {
    setUser(user);
    router.push("/dashboard");
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Hero background — responsive */}
      <Image
        src="/portada-sm.webp"
        alt="FleetOps hero"
        fill
        priority
        quality={90}
        sizes="(max-width: 639px) 100vw, 0px"
        className="object-cover object-center sm:hidden"
      />
      <Image
        src="/portada-md.webp"
        alt="FleetOps hero"
        fill
        priority
        quality={90}
        sizes="(max-width: 639px) 0px, (max-width: 767px) 100vw, 0px"
        className="object-cover object-center hidden sm:block md:hidden"
      />
      <Image
        src="/portada3.webp"
        alt="FleetOps hero"
        fill
        priority
        sizes="(max-width: 767px) 0px, 100vw"
        className="object-cover object-center hidden md:block"
      />

      {/* Subtle bottom vignette */}
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60" />

      {/* Top-left logo */}
      <div className="absolute top-6 left-8 z-10">
        <Image
          src="/logo.webp"
          alt="FleetOps"
          width={140}
          height={42}
          priority
          className="object-contain"
        />
      </div>

      {/* Bottom — sign in trigger + role list */}
      <div className="absolute bottom-10 inset-x-0 z-10 flex flex-col items-center gap-6">
        {/* Role cards — appear when open */}
        <div
          className={`flex flex-col md:flex-row gap-3 items-center transition-all duration-300 ${
            open
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {users.map((user) => {
            const cfg = roleConfig[user.role];
            return (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className="group relative overflow-hidden cursor-pointer flex items-center gap-3 rounded-lg bg-black/85 px-5 py-3 w-[190px] transition-all duration-300"
              >
                {/* gradient overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span
                  className={`relative z-10 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}
                />
                <div className="relative z-10 text-left">
                  <p
                    className={`text-xs tracking-widest uppercase font-medium ${cfg.accent}`}
                  >
                    {cfg.label}
                  </p>
                  <p className="text-sm text-white">{user.name}</p>
                </div>
                <svg
                  className="relative z-10 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white/60"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Main CTA button */}
        {open ? (
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 px-7 py-3 text-white/50 text-sm font-medium tracking-wide hover:text-white/80 transition-all duration-200"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="group relative overflow-hidden cursor-pointer flex items-center gap-2 rounded-full px-7 py-3 text-white text-sm font-medium tracking-wide transition-all duration-200"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-orange-500/50 to-blue-500/50 transition-opacity duration-200 group-hover:opacity-0" />
            <span className="absolute inset-0 bg-gradient-to-r from-orange-500/75 to-blue-500/75 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center gap-2">
              Sign in
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
