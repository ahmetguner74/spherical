"use client";

const SPACINGS = [
  { token: "1", px: 4 },
  { token: "2", px: 8 },
  { token: "3", px: 12 },
  { token: "4", px: 16 },
  { token: "5", px: 20 },
  { token: "6", px: 24 },
  { token: "8", px: 32 },
  { token: "10", px: 40 },
  { token: "12", px: 48 },
  { token: "16", px: 64 },
] as const;

export function SpacingScale() {
  return (
    <div className="space-y-2">
      {SPACINGS.map((s) => (
        <div key={s.token} className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted-foreground)] w-16 shrink-0">
            {s.token} ({s.px}px)
          </span>
          <div
            className="h-4 rounded-sm bg-[var(--accent)]/30"
            style={{ width: `${s.px}px` }}
          />
        </div>
      ))}
    </div>
  );
}
