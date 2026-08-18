"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { useFormatter } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TrendBadge({ percentage }: { percentage: number }) {
  const format = useFormatter();

  if (!Number.isFinite(percentage)) return null;

  const isPositive = percentage > 0;
  const isNegative = percentage < 0;
  const Icon = isPositive
    ? ArrowUpRight
    : isNegative
      ? ArrowDownRight
      : ArrowRight;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 font-medium",
        isPositive &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        isNegative && "bg-destructive/10 text-destructive",
      )}
    >
      <Icon className="size-3" aria-hidden />
      {format.number(Math.round(percentage) / 100, { style: "percent" })}
    </Badge>
  );
}
