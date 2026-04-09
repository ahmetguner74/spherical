"use client";

import { useState, useEffect } from "react";
import type { OperationMainCategory, OperationSubType } from "@/types/iha";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/types/iha";

interface TypeSelectorProps {
  defaultCategory?: OperationMainCategory;
  defaultSubTypes?: OperationSubType[];
  onChange: (category: OperationMainCategory, subTypes: OperationSubType[]) => void;
}

export function TypeSelector({ defaultCategory, defaultSubTypes, onChange }: TypeSelectorProps) {
  const [category, setCategory] = useState<OperationMainCategory>(defaultCategory ?? "iha");
  const [subTypes, setSubTypes] = useState<OperationSubType[]>(defaultSubTypes ?? []);

  useEffect(() => {
    onChange(category, subTypes);
  }, [category, subTypes, onChange]);

  const handleCategory = (key: OperationMainCategory) => {
    setCategory(key);
    setSubTypes([]);
  };

  const toggleSub = (key: OperationSubType) => {
    setSubTypes((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  };

  const subs = SUB_CATEGORIES[category];

  return (
    <div className="space-y-3">
      <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">Ne yapılacak?</label>
      <div className="grid grid-cols-2 gap-3">
        {MAIN_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => handleCategory(c.key)}
            className={`flex items-center justify-center gap-2 py-4 rounded-lg border-2 text-base font-semibold transition-colors ${
              category === c.key
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <span className="text-2xl">{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {subs.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => toggleSub(s.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors min-h-[40px] ${
              subTypes.includes(s.key)
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
