"use client";

import type { OperationType } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";
import { statusColors, typeColors } from "@/config/tokens";
import { TYPE_ICONS } from "./calendarConstants";

export function CalendarLegend() {
  return (
    <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-3 flex-wrap">
      {(["talep", "saha", "isleme", "teslim"] as const).map((s) => (
        <div key={s} className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[s] }} />
          <span className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">
            {OPERATION_STATUS_LABELS[s]}
          </span>
        </div>
      ))}
      <span className="text-[var(--border)]">|</span>
      {(Object.entries(TYPE_ICONS) as [OperationType, string][]).map(([type, icon]) => (
        <div key={type} className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: typeColors[type] }} />
          <span className="text-[11px]">{icon}</span>
          <span className="text-[10px] sm:text-xs text-[var(--muted-foreground)] hidden sm:inline">
            {OPERATION_TYPE_LABELS[type].split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}
