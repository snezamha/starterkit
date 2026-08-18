import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

type DashboardPageProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardPage({ children, className }: DashboardPageProps) {
  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      {children}
    </div>
  );
}

export function DashboardPageHeader({
  title,
  description,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-1 text-start">
        <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2 self-start">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

type DashboardCardFormFooterProps = {
  cancelLabel: ReactNode;
  saveLabel: ReactNode;
  status?: ReactNode;
  isDirty: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export function DashboardCardFormFooter({
  cancelLabel,
  saveLabel,
  status,
  isDirty,
  isSaving,
  onCancel,
  onSave,
}: DashboardCardFormFooterProps) {
  return (
    <div className="flex flex-col gap-3 border-t px-5 pt-4 sm:flex-row sm:items-center sm:px-6">
      <div className="text-muted-foreground min-w-0 text-sm sm:flex-1">
        {status}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {isDirty ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button type="button" disabled={isSaving || !isDirty} onClick={onSave}>
          {isSaving ? <Loader2 className="animate-spin" /> : null}
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
