"use client";

import { useEffect } from "react";
import { useAuthStore } from "./authStore";

export function AuthHydrator() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return null;
}
