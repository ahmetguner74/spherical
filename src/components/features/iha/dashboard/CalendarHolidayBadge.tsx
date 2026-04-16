"use client";

// ============================================
// CalendarHolidayBadge — Takvim hücresinde tatil bayrak ikonu + popup
// Masaüstü: hover popup | Mobil: tıklama popup
// ============================================

import { useState, useRef, useEffect } from "react";
import type { Holiday } from "@/config/holidays";
import { getHolidayAccentColor } from "@/config/holidays";

interface CalendarHolidayBadgeProps {
  holiday: Holiday;
  /** Bu günde operasyon var mı? Çakışma uyarısı için */
  hasOperations?: boolean;
}

export function CalendarHolidayBadge({ holiday, hasOperations }: CalendarHolidayBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Dış tıklama → kapat
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const emoji = holiday.type === "arefe" ? "🕌" : "🇹🇷";
  const accent = getHolidayAccentColor(holiday);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-[10px] sm:text-xs leading-none hover:scale-110 transition-transform"
        title={holiday.name}
      >
        {emoji}
      </button>

      {open && <HolidayPopup holiday={holiday} accent={accent} hasOperations={hasOperations} />}
    </div>
  );
}

// ─── Mini Popup ───

function HolidayPopup({
  holiday,
  accent,
  hasOperations,
}: {
  holiday: Holiday;
  accent: string;
  hasOperations?: boolean;
}) {
  const label = holiday.type === "arefe"
    ? "Arefe (Yarım Gün)"
    : holiday.type === "dini"
    ? "Dini Bayram"
    : "Resmi Tatil";

  return (
    <div
      className="absolute z-50 bottom-full mb-1 left-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-2.5 min-w-[180px] text-left"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Başlık */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
        <span className="text-xs font-semibold text-[var(--foreground)]">{label}</span>
      </div>

      {/* Tatil adı */}
      <div className="text-[11px] font-medium text-[var(--foreground)] leading-tight">
        {holiday.name}
      </div>

      {/* Yarım gün notu */}
      {holiday.isHalfDay && (
        <div className="text-[10px] text-[var(--muted-foreground)] mt-1">
          Öğleden sonra resmi tatil
        </div>
      )}

      {/* Çakışma uyarısı */}
      {hasOperations && (
        <div className="mt-2 pt-1.5 border-t border-[var(--feedback-warning)]/20 flex items-center gap-1">
          <span className="text-xs">⚠️</span>
          <span className="text-[10px] font-semibold text-[var(--feedback-warning)]">
            Tatil gününde operasyon planlı!
          </span>
        </div>
      )}
    </div>
  );
}
