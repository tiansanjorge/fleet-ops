import { create } from "zustand";
import type { User } from "@fleetops/types";

export const SESSION_TOKEN_KEY = "fleetops_token";
export const SESSION_USER_KEY = "fleetops_user";

interface AuthState {
  currentUser: User | null;
  token: string | null;
  hydrated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>(() => ({
  currentUser: null,
  token: null,
  hydrated: false,
  setUser: (user) => {
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    useAuthStore.setState({ currentUser: user });
  },
  setToken: (token) => {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    useAuthStore.setState({ token });
  },
  clearUser: () => {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
    useAuthStore.setState({ currentUser: null, token: null });
  },
  hydrate: () => {
    try {
      const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
      const raw = sessionStorage.getItem(SESSION_USER_KEY);
      const currentUser = raw ? (JSON.parse(raw) as User) : null;
      useAuthStore.setState({ token, currentUser, hydrated: true });
    } catch {
      useAuthStore.setState({ hydrated: true });
    }
  },
}));
