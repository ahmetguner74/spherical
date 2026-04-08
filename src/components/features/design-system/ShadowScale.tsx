"use client";

import { shadow } from "@/config/tokens";

const SHADOWS = [
  { token: "sm", value: shadow.sm },
  { token: "md", value: shadow.md },
  { token: "lg", value: shadow.lg },
] as const;

export function ShadowScale() {
  return (
    <div className="flex flex-wrap gap-6">
      {SHADOWS.map((s) => (
        <div key={s.token} className="flex flex-col items-center gap-2">
          <div
            className="w-24 h-16 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
            style={{ boxShadow: s.value }}
          />
          <span className="text-xs text-[var(--muted-foreground)]">{s.token}</span>
        </div>
      ))}
    </div>
  );
}
