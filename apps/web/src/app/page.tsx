"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/core/auth/authStore";
import type { User, UserRole } from "@fleetops/types";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  admin:    { email: "anagarcia@fleetops.com",    password: "admin123" },
  operator: { email: "carlosmendez@fleetops.com", password: "password" },
  viewer:   { email: "laurarios@fleetops.com",    password: "password" },
};

const FAKE_USERS: User[] = [
  { id: "u1", name: "Ana García",    role: "admin"    },
  { id: "u2", name: "Carlos Méndez", role: "operator" },
  { id: "u3", name: "Laura Ríos",    role: "viewer"   },
];

const roleConfig: Record<UserRole, { label: string; dot: string; accent: string; ring: string }> = {
  admin:    { label: "Admin",    dot: "bg-red-500",  accent: "text-red-400",  ring: "ring-red-500/40"  },
  operator: { label: "Operator", dot: "bg-blue-500", accent: "text-blue-400", ring: "ring-blue-500/40" },
  viewer:   { label: "Viewer",   dot: "bg-zinc-400", accent: "text-zinc-400", ring: "ring-zinc-400/40" },
};

// ---------------------------------------------------------------------------
// LoginModal — solo modo real (IS_MOCK=false)
// ---------------------------------------------------------------------------
interface LoginModalProps {
  users: User[];
  onClose: () => void;
  onSuccess: (token: string, user: User) => void;
}

function LoginModal({ users, onClose, onSuccess }: LoginModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail]       = useState(DEMO_CREDENTIALS.admin.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.admin.password);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  function selectUser(user: User) {
    setSelectedRole(user.role);
    setEmail(DEMO_CREDENTIALS[user.role].email);
    setPassword(DEMO_CREDENTIALS[user.role].password);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Credenciales inválidas.");
        return;
      }
      const data = (await res.json()) as { token: string; user: User };
      onSuccess(data.token, data.user);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-xl bg-zinc-900/95 border border-zinc-700/60 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-white">Sign in</p>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User selector — mismo diseño que las cards de la landing */}
        <div className="mb-5 flex flex-col gap-2">
          {users.map((user) => {
            const cfg = roleConfig[user.role];
            const active = selectedRole === user.role;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => selectUser(user)}
                className={`group relative overflow-hidden cursor-pointer flex items-center gap-3 rounded-lg px-4 py-2.5 w-full transition-all duration-200 ring-1 ${
                  active
                    ? `bg-zinc-800 ${cfg.ring}`
                    : "bg-zinc-800/50 ring-zinc-700/40 hover:bg-zinc-800 hover:ring-zinc-600/60"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                <div className="text-left">
                  <p className={`text-xs tracking-widest uppercase font-medium ${active ? cfg.accent : "text-zinc-500 group-hover:text-zinc-400"}`}>
                    {cfg.label}
                  </p>
                  <p className="text-sm text-white">{user.name}</p>
                </div>
                {active && (
                  <svg className="ml-auto text-zinc-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative overflow-hidden cursor-pointer flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-white text-sm font-medium tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-linear-to-r from-orange-500/50 to-blue-500/50 transition-opacity duration-200 group-hover:opacity-0" />
            <span className="absolute inset-0 bg-linear-to-r from-orange-500/75 to-blue-500/75 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center gap-2">
              {loading ? "Ingresando…" : (
                <>
                  Sign in
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LandingPage
// ---------------------------------------------------------------------------
export default function LandingPage() {
  // mock mode: two-step inline flow (open → cards → click = login)
  const [open, setOpen]         = useState(false);
  const [users, setUsers]       = useState<User[]>(FAKE_USERS);
  // real mode: unified modal
  const [modalOpen, setModalOpen] = useState(false);

  const setUser  = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const router   = useRouter();

  useEffect(() => {
    if (!IS_MOCK) return;
    fetch("/users")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: User[]) => setUsers(data))
      .catch(() => {});
  }, []);

  function handleSignIn() {
    if (IS_MOCK) {
      setOpen(true);
    } else {
      setModalOpen(true);
    }
  }

  // mock only
  function handleCardClick(user: User) {
    setUser(user);
    router.push("/dashboard");
  }

  function handleModalSuccess(token: string, user: User) {
    setToken(token);
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

      {/* Bottom — sign in trigger */}
      <div className="absolute bottom-10 inset-x-0 z-10 flex flex-col items-center gap-6">
        {/* Mock mode: role cards (inline, two-step) */}
        {IS_MOCK && (
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
                  onClick={() => handleCardClick(user)}
                  className="group relative overflow-hidden cursor-pointer flex items-center gap-3 rounded-lg bg-black/85 px-5 py-3 w-47.5 transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-linear-to-r from-orange-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className={`relative z-10 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                  <div className="relative z-10 text-left">
                    <p className={`text-xs tracking-widest uppercase font-medium ${cfg.accent}`}>
                      {cfg.label}
                    </p>
                    <p className="text-sm text-white">{user.name}</p>
                  </div>
                  <svg
                    className="relative z-10 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white/60"
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        )}

        {/* CTA button */}
        {IS_MOCK && open ? (
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 px-7 py-3 text-white/50 text-sm font-medium tracking-wide hover:text-white/80 transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Cancel
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            className="group relative overflow-hidden cursor-pointer flex items-center gap-2 rounded-full px-7 py-3 text-white text-sm font-medium tracking-wide transition-all duration-200"
          >
            <span className="absolute inset-0 bg-linear-to-r from-orange-500/50 to-blue-500/50 transition-opacity duration-200 group-hover:opacity-0" />
            <span className="absolute inset-0 bg-linear-to-r from-orange-500/75 to-blue-500/75 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center gap-2">
              Sign in
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* Login modal — solo modo real */}
      {!IS_MOCK && modalOpen && (
        <LoginModal
          users={users}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
