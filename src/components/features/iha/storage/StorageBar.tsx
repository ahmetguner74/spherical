"use client";

interface StorageBarProps {
  used: number;
  total: number;
}

export function StorageBar({ used, total }: StorageBarProps) {
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  const barColor =
    percent >= 90
      ? "bg-[var(--feedback-error)]"
      : percent >= 70
        ? "bg-[var(--feedback-warning)]"
        : "bg-[var(--accent)]";

  return (
    <div>
      <div className="h-3 rounded-full bg-[var(--background)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-[var(--muted-foreground)]">
          %{percent} dolu
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {used} / {total} TB
        </span>
      </div>
    </div>
  );
}
