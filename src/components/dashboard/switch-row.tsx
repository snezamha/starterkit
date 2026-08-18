"use client";

import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  reverse?: boolean;
  className?: string;
};

export function DashboardSwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  reverse,
  className,
}: Props) {
  const control = (
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
  );

  const text = (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        reverse
          ? "flex items-start gap-3"
          : "flex items-center justify-between gap-4",
        className,
      )}
    >
      {reverse ? control : text}
      {reverse ? text : control}
    </div>
  );
}
