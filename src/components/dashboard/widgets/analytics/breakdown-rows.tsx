"use client";

import type { ReactNode } from "react";
import { useFormatter } from "next-intl";

export type BreakdownRow = [string, number];

export type BreakdownRenderers = {
  renderLabel: (key: string) => string;
  renderIcon?: (key: string) => ReactNode;
};

type Props = BreakdownRenderers & {
  rows: BreakdownRow[];
};

export function BreakdownRows({ rows, renderLabel, renderIcon }: Props) {
  const format = useFormatter();
  const max = Math.max(1, ...rows.map(([, value]) => value));

  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map(([key, value]) => (
        <li key={key} className="flex items-center gap-2">
          {renderIcon ? (
            <span className="shrink-0 leading-none">{renderIcon(key)}</span>
          ) : null}
          <span
            title={renderLabel(key)}
            className="min-w-0 flex-1 truncate text-sm"
          >
            {renderLabel(key)}
          </span>
          <span
            aria-hidden
            className="bg-primary/15 h-1.5 w-16 shrink-0 overflow-hidden rounded-full"
          >
            <span
              className="bg-primary block h-full rounded-full"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </span>
          <span className="text-muted-foreground w-8 shrink-0 text-end text-sm tabular-nums">
            {format.number(value)}
          </span>
        </li>
      ))}
    </ul>
  );
}
