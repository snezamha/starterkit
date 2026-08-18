"use client";

import { LoadingSpinner } from "@/components/loading/loading-spinner";
import { useLoadingSettings } from "@/components/providers/loading-context";
import { cn } from "@/lib/utils";

export function SpinnerSection({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  const settings = useLoadingSettings();

  return (
    <div className={cn("grid place-items-center", className)}>
      <LoadingSpinner
        spinner={settings.spinner}
        colorMode={settings.colorMode}
        color={settings.color}
        size={size ?? settings.size}
      />
    </div>
  );
}
