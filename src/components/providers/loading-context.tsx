"use client";

import { createContext, useContext } from "react";

import {
  defaultLoadingSettings,
  type LoadingSettings,
} from "@/lib/site-settings/loading";

const LoadingSettingsContext = createContext<LoadingSettings>(
  defaultLoadingSettings,
);

export function LoadingSettingsProvider({
  settings,
  children,
}: {
  settings: LoadingSettings;
  children: React.ReactNode;
}) {
  return (
    <LoadingSettingsContext.Provider value={settings}>
      {children}
    </LoadingSettingsContext.Provider>
  );
}

export function useLoadingSettings() {
  return useContext(LoadingSettingsContext);
}
