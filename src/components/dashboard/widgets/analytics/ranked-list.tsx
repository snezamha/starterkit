"use client";

import type { BreakdownDimension } from "@/lib/analytics/breakdown";
import type { RangeValue } from "@/lib/analytics/ranges";

import { BreakdownDialog } from "./breakdown-dialog";
import {
  BreakdownRows,
  type BreakdownRenderers,
  type BreakdownRow,
} from "./breakdown-rows";

type Props = BreakdownRenderers & {
  title: string;
  rows: BreakdownRow[];
  total: number;
  dimension: BreakdownDimension;
  range: RangeValue;
  rangeLabel: string;
  emptyLabel: string;
};

export function RankedList({
  title,
  rows,
  total,
  dimension,
  range,
  rangeLabel,
  emptyLabel,
  renderLabel,
  renderIcon,
}: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-muted-foreground text-xs">{title}</p>
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      ) : (
        <>
          <BreakdownRows
            rows={rows}
            renderLabel={renderLabel}
            renderIcon={renderIcon}
          />
          {total > rows.length ? (
            <BreakdownDialog
              dimension={dimension}
              range={range}
              rangeLabel={rangeLabel}
              title={title}
              total={total}
              renderLabel={renderLabel}
              renderIcon={renderIcon}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
