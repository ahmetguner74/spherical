"use client";

const RADII = [
  { token: "none", value: "0" },
  { token: "sm", value: "0.25rem" },
  { token: "md", value: "0.375rem" },
  { token: "lg", value: "0.5rem" },
  { token: "xl", value: "0.75rem" },
  { token: "2xl", value: "1rem" },
  { token: "full", value: "9999px" },
] as const;

export function RadiusScale() {
  return (
    <div className="flex flex-wrap gap-4">
      {RADII.map((r) => (
        <div key={r.token} className="flex flex-col items-center gap-1">
          <div
            className="w-16 h-16 border-2 border-[var(--accent)] bg-[var(--accent)]/10"
            style={{ borderRadius: r.value }}
          />
          <span className="text-xs text-[var(--muted-foreground)]">{r.token}</span>
        </div>
      ))}
    </div>
  );
}
