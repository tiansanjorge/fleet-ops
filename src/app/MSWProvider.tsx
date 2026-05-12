"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("@/mocks/browser").then(({ worker }) => {
        worker.start({ onUnhandledRequest: "bypass" }).then(() => {
          setReady(true);
        });
      });
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
