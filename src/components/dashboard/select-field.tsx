"use client";

import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DashboardFormField } from "./form-field";

type Props<T extends string> = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  getLabel?: (value: T) => ReactNode;
  renderItem?: (value: T) => ReactNode;
  after?: ReactNode;
  className?: string;
  triggerClassName?: string;
};

export function DashboardSelectField<T extends string>({
  id,
  label,
  description,
  value,
  options,
  onChange,
  getLabel = (option) => option,
  renderItem = getLabel,
  after,
  className,
  triggerClassName = "w-full sm:w-64",
}: Props<T>) {
  const select = (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onChange(nextValue as T);
      }}
    >
      <SelectTrigger id={id} className={triggerClassName}>
        <SelectValue>{getLabel(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {renderItem(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <DashboardFormField
      id={id}
      label={label}
      description={description}
      className={className}
    >
      {after ? (
        <div className="flex items-center gap-2">
          {select}
          {after}
        </div>
      ) : (
        select
      )}
    </DashboardFormField>
  );
}
