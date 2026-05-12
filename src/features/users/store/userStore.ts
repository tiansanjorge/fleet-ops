import { create } from "zustand";
import type { User, UserRole } from "../types";

interface UserState {
  users: User[];
  panelOpen: boolean;
  setUsers: (users: User[]) => void;
  updateUserRole: (id: string, role: UserRole) => void;
  setPanelOpen: (open: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  panelOpen: false,
  setUsers: (users) => set({ users }),
  updateUserRole: (id, role) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
    })),
  setPanelOpen: (open) => set({ panelOpen: open }),
}));
