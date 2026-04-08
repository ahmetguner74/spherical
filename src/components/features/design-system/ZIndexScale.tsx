"use client";

import { zIndex } from "@/config/tokens";

const LAYERS = Object.entries(zIndex) as [string, number][];

export function ZIndexScale() {
  return (
    <div className="space-y-2">
      {LAYERS.map(([name, value]) => (
        <div key={name} className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted-foreground)] w-20 shrink-0">
            {name} ({value})
          </span>
          <div
            className="h-6 rounded-sm bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center px-2"
            style={{ width: `${Math.max(value * 3, 20)}px` }}
          >
            <span className="text-[10px] text-[var(--accent)]">{value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
