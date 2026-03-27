"use client";

import type { StorageUnit } from "@/types/iha";

interface StorageSummaryProps {
  storage: StorageUnit[];
}

function getBarColor(percent: number): string {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-yellow-500";
  return "bg-[var(--accent)]";
}

export function StorageSummary({ storage }: StorageSummaryProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
        Depolama
      </h3>
      <div className="space-y-4">
        {storage.map((s) => {
          const percent =
            s.totalCapacityTB > 0
              ? Math.round((s.usedCapacityTB / s.totalCapacityTB) * 100)
              : 0;

          return (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--foreground)] font-medium">
                  {s.name}
                </span>
                <span className="text-[var(--muted-foreground)]">
                  {s.usedCapacityTB} / {s.totalCapacityTB} TB
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--background)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(percent)}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                %{percent} dolu
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
