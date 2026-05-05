import { useCallback } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { can as canDo } from "./index";
import type { Permission } from "./types";

export function usePermission() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const can = useCallback(
    (action: Permission): boolean => {
      if (!currentUser) return false;
      return canDo(currentUser.role, action);
    },
    [currentUser],
  );

  return { can };
}
