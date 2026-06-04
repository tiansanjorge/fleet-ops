import { create } from "zustand";
import type { User } from "@fleetops/types";

interface AuthState {
  currentUser: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  token: null,
  setUser: (user) => set({ currentUser: user }),
  setToken: (token) => set({ token }),
  clearUser: () => set({ currentUser: null, token: null }),
}));
