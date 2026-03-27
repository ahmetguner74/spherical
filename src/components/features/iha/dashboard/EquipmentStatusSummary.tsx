"use client";

import type { Equipment } from "@/types/iha";
import { EQUIPMENT_STATUS_LABELS } from "@/types/iha";
import type { EquipmentStatus } from "@/types/iha";

interface EquipmentStatusSummaryProps {
  equipment: Equipment[];
}

const STATUS_DOT_COLORS: Record<EquipmentStatus, string> = {
  musait: "bg-green-500",
  "kullanımda": "bg-yellow-500",
  bakim: "bg-blue-500",
  ariza: "bg-red-500",
  odunc: "bg-gray-500",
};

export function EquipmentStatusSummary({ equipment }: EquipmentStatusSummaryProps) {
  const counts = equipment.reduce(
    (acc, eq) => {
      acc[eq.status] = (acc[eq.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<EquipmentStatus, number>
  );

  const statuses = Object.entries(counts) as [EquipmentStatus, number][];

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
        Ekipman Durumu
      </h3>
      <div className="space-y-2">
        {statuses.map(([status, count]) => (
          <div key={status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
              <span className="text-sm text-[var(--foreground)]">
                {EQUIPMENT_STATUS_LABELS[status]}
              </span>
            </div>
            <span className="text-sm font-medium text-[var(--foreground)]">
              {count}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border)] flex justify-between">
        <span className="text-xs text-[var(--muted-foreground)]">Toplam</span>
        <span className="text-sm font-bold text-[var(--foreground)]">
          {equipment.length}
        </span>
      </div>
    </div>
  );
}
