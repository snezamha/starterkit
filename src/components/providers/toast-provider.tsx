"use client";

import { Toast } from "@base-ui/react/toast";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/toast";
import { toastManager } from "@/lib/toast-manager";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager}>
      {children}
      <Toaster />
    </Toast.Provider>
  );
}
