import type { ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  action?: ReactNode;
};

export function StatCard({ label, value, action }: Props) {
  return (
    <div className="bg-muted/40 flex flex-col gap-1 rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        {label}
        {action}
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
