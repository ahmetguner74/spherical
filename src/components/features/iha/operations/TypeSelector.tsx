"use client";

import { useState, useEffect } from "react";
import type { OperationMainCategory, OperationSubType } from "@/types/iha";
import { ALL_SUB_TYPES, deriveCategoryFromSubTypes } from "@/types/iha";
import { OP_SUBTYPE_ICONS } from "@/config/icons";

interface TypeSelectorProps {
  defaultCategory?: OperationMainCategory;
  defaultSubTypes?: OperationSubType[];
  onChange: (category: OperationMainCategory, subTypes: OperationSubType[]) => void;
}

export function TypeSelector({ defaultSubTypes, onChange }: TypeSelectorProps) {
  const [subTypes, setSubTypes] = useState<OperationSubType[]>(defaultSubTypes ?? []);

  useEffect(() => {
    onChange(deriveCategoryFromSubTypes(subTypes), subTypes);
  }, [subTypes, onChange]);

  const toggle = (key: OperationSubType) => {
    setSubTypes((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  };

  const ihaTypes = ALL_SUB_TYPES.filter((s) => s.group === "iha");
  const lidarTypes = ALL_SUB_TYPES.filter((s) => s.group === "lidar");

  return (
    <div className="space-y-3">
      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Ne yapılacak?</label>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">İHA</p>
        <div className="flex flex-wrap gap-2">
          {ihaTypes.map((s) => {
            const Icon = OP_SUBTYPE_ICONS[s.key];
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggle(s.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors min-h-[44px] ${
                  subTypes.includes(s.key)
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">LİDAR</p>
        <div className="flex flex-wrap gap-2">
          {lidarTypes.map((s) => {
            const Icon = OP_SUBTYPE_ICONS[s.key];
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggle(s.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors min-h-[44px] ${
                  subTypes.includes(s.key)
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
