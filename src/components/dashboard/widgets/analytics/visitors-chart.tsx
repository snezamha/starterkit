"use client";

import { useCallback, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  label: string;
  visitors: number;
  pageviews: number;
};

type Props = {
  data: ChartPoint[];
  visitorsLabel: string;
  pageviewsLabel: string;
};

export function VisitorsChart({ data, visitorsLabel, pageviewsLabel }: Props) {
  const observerRef = useRef<ResizeObserver | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const measure = useCallback((element: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!element) return;

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    observerRef.current = observer;
  }, []);

  return (
    <div ref={measure} dir="ltr" className="h-56 w-full min-w-0">
      {size.width > 0 && size.height > 0 ? (
        <ResponsiveContainer
          width={size.width}
          height={size.height}
          minWidth={0}
          minHeight={0}
        >
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              interval="preserveStartEnd"
              minTickGap={24}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              allowDecimals={false}
              width={28}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              name={visitorsLabel}
              dataKey="visitors"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.15}
            />
            <Area
              type="monotone"
              name={pageviewsLabel}
              dataKey="pageviews"
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
