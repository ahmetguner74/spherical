"use client";

import { Button } from "@/components/ui/Button";
import { inputClass } from "./styles";
import type { ReactNode } from "react";

export interface ViewOption {
  key: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

interface ViewToolbarProps {
  views: ViewOption[];
  activeView: string;
  onViewChange: (view: string) => void;
  filters?: ReactNode;
  addLabel?: string;
  onAdd?: () => void;
}

export function ViewToolbar({
  views,
  activeView,
  onViewChange,
  filters,
  addLabel,
  onAdd,
}: ViewToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
          {views.map((v) => (
            <button
              key={v.key}
              onClick={() => onViewChange(v.key)}
              className={`px-2.5 py-1.5 text-xs ${
                activeView === v.key
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        {filters}
      </div>
      {addLabel && onAdd && <Button onClick={onAdd} size="sm">+ {addLabel}</Button>}
    </div>
  );
}

interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  allLabel: string;
}

export function SelectFilter({ value, onChange, options, allLabel }: SelectFilterProps) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="all">{allLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
