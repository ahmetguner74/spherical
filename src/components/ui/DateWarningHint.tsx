"use client";

// ============================================
// DateWarningHint — Tarih input'u altında gösterilen uyarı çipi
// Tatil / Arefe / Hafta Sonu durumlarında kullanıcıyı bilgilendirir
// ============================================

import { getDateWarning } from "@/config/holidays";

interface DateWarningHintProps {
  /** "YYYY-MM-DD" formatında tarih */
  date?: string;
  className?: string;
}

export function DateWarningHint({ date, className = "" }: DateWarningHintProps) {
  const warning = date ? getDateWarning(date) : null;
  if (!warning) return null;

  return (
    <div
      className={`mt-1.5 flex items-center gap-1.5 rounded px-2 py-1 text-[11px] leading-tight ${className}`}
      style={{ backgroundColor: warning.bg, color: warning.color }}
    >
      <span className="text-sm leading-none">{warning.emoji}</span>
      <span className="font-semibold">{warning.label}:</span>
      <span className="font-medium truncate">{warning.name}</span>
      {warning.isHalfDay && (
        <span className="text-[10px] opacity-80">(öğleden sonra)</span>
      )}
    </div>
  );
}
