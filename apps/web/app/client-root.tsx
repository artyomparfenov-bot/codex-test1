"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { AppStateProvider } from "@/lib/state";

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AppStateProvider>
  );
}
