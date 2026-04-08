"use client";

const SIZES = [
  { token: "xs", size: "0.75rem", px: "12px" },
  { token: "sm", size: "0.875rem", px: "14px" },
  { token: "base", size: "1rem", px: "16px" },
  { token: "lg", size: "1.125rem", px: "18px" },
  { token: "xl", size: "1.25rem", px: "20px" },
  { token: "2xl", size: "1.5rem", px: "24px" },
  { token: "3xl", size: "1.875rem", px: "30px" },
  { token: "4xl", size: "2.25rem", px: "36px" },
] as const;

export function TypographyScale() {
  return (
    <div className="space-y-3">
      {SIZES.map((s) => (
        <div key={s.token} className="flex items-baseline gap-4">
          <span className="text-xs text-[var(--muted-foreground)] w-16 shrink-0">
            {s.token} ({s.px})
          </span>
          <span style={{ fontSize: s.size }} className="text-[var(--foreground)]">
            Spherical Design System
          </span>
        </div>
      ))}
    </div>
  );
}
