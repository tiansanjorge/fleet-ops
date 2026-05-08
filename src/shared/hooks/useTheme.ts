"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "fleetops-theme";

export function useTheme() {
  // Always initialize with "dark" to match the server render.
  // The inline script in layout.tsx already applies the correct class before paint.
  const [theme, setTheme] = useState<Theme>("dark");

  // After mount, sync state with whatever the inline script already applied.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return { theme, toggle };
}
