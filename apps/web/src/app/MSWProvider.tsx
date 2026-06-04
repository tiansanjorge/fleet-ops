"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK === "true";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  // Cuando mock=false el worker nunca arranca; ready arranca en true.
  const [ready, setReady] = useState(!IS_MOCK);

  useEffect(() => {
    if (!IS_MOCK) return;
    import("@/mocks/browser").then(({ worker }) => {
      worker.start({ onUnhandledRequest: "bypass" }).then(() => setReady(true));
    });
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
