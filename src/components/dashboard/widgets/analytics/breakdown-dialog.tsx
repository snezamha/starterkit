"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState, useTransition } from "react";

import { SpinnerSection } from "@/components/loading/spinner-section";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { loadAnalyticsBreakdown } from "@/lib/analytics/actions";
import type {
  BreakdownDimension,
  BreakdownResult,
} from "@/lib/analytics/breakdown";
import type { RangeValue } from "@/lib/analytics/ranges";
import { cn } from "@/lib/utils";

import { BreakdownRows, type BreakdownRenderers } from "./breakdown-rows";

type Props = BreakdownRenderers & {
  dimension: BreakdownDimension;
  range: RangeValue;
  rangeLabel: string;
  title: string;
  total: number;
};

export function BreakdownDialog({
  dimension,
  range,
  rangeLabel,
  title,
  total,
  renderLabel,
  renderIcon,
}: Props) {
  const t = useTranslations("dashboard.widgets.analytics");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<BreakdownResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(
    (nextPage: number) => {
      startTransition(async () => {
        try {
          setResult(await loadAnalyticsBreakdown(dimension, range, nextPage));
          setPage(nextPage);
        } catch {
          setResult(null);
        }
      });
    },
    [dimension, range],
  );

  const pageCount = result
    ? Math.max(1, Math.ceil(result.total / result.pageSize))
    : 1;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) load(1);
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="self-start">
            {t("viewMore", { count: total })}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t("breakdownDescription", { range: rangeLabel })}
          </DialogDescription>
        </DialogHeader>

        <div className={cn("min-h-64", isPending && "opacity-60")}>
          {result && result.rows.length > 0 ? (
            <BreakdownRows
              rows={result.rows}
              renderLabel={renderLabel}
              renderIcon={renderIcon}
            />
          ) : isPending ? (
            <SpinnerSection className="py-8" size={24} />
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {t("empty")}
            </p>
          )}
        </div>

        <DialogFooter className="items-center justify-between gap-2 sm:justify-between">
          <span className="text-muted-foreground text-xs tabular-nums">
            {t("pageOf", { page, pages: pageCount })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={isPending || page <= 1}
              onClick={() => load(page - 1)}
            >
              <ChevronLeft className="size-4 rtl:hidden" aria-hidden />
              <ChevronRight className="hidden size-4 rtl:block" aria-hidden />
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending || page >= pageCount}
              onClick={() => load(page + 1)}
            >
              {t("next")}
              <ChevronRight className="size-4 rtl:hidden" aria-hidden />
              <ChevronLeft className="hidden size-4 rtl:block" aria-hidden />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
