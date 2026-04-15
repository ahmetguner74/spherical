"use client";

// ============================================
// CalendarWeatherBadge — Takvim hücresinde hava durumu emojisi + popup
// Masaüstü: hover popup | Mobil: tıklama popup
// ============================================

import { useState, useRef, useEffect } from "react";
import type { WeatherDaily, FlightSuitability } from "@/types/iha";
import {
  getWeatherEmoji,
  getWeatherLabel,
  getSuitabilityLabel,
  getSuitabilityColor,
  getDailySuitabilityWithReasons,
} from "./weatherUtils";
import { IconWind } from "@/config/icons";

interface CalendarWeatherBadgeProps {
  day: WeatherDaily;
  /** Takvim hücresinde operasyon var mı? Çakışma uyarısı için */
  hasOperations?: boolean;
}

export function CalendarWeatherBadge({ day, hasOperations }: CalendarWeatherBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { level, reasons } = getDailySuitabilityWithReasons(day);
  const isConflict = hasOperations && level !== "uygun";

  // Dış tıklama → kapat
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-[10px] sm:text-xs leading-none hover:scale-110 transition-transform"
        title={getWeatherLabel(day.weatherCode)}
      >
        {getWeatherEmoji(day.weatherCode)}
      </button>

      {open && (
        <WeatherPopup day={day} level={level} reasons={reasons} isConflict={isConflict} />
      )}
    </div>
  );
}

// ─── Mini Popup ───

function WeatherPopup({
  day,
  level,
  reasons,
  isConflict,
}: {
  day: WeatherDaily;
  level: FlightSuitability;
  reasons: string[];
  isConflict?: boolean;
}) {
  const color = getSuitabilityColor(level);
  const gust = day.gustMax ?? 0;

  return (
    <div
      className="absolute z-50 top-full mt-1 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-2.5 min-w-[160px] text-left"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Başlık */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm">{getWeatherEmoji(day.weatherCode)}</span>
        <span className="text-xs font-semibold text-[var(--foreground)]">
          {getWeatherLabel(day.weatherCode)}
        </span>
      </div>

      {/* Detaylar */}
      <div className="space-y-1 text-[11px] text-[var(--muted-foreground)]">
        <div className="flex justify-between">
          <span>Sıcaklık</span>
          <span className="font-medium text-[var(--foreground)]">
            {Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°
          </span>
        </div>
        <div className="flex justify-between">
          <span>Rüzgar</span>
          <span className="font-medium text-[var(--foreground)] flex items-center gap-0.5">
            <IconWind size={10} />
            {Math.round(day.windMax)}
            {gust > day.windMax + 5 && (
              <span className="text-[var(--feedback-error)]/80">({Math.round(gust)})</span>
            )}
            <span className="text-[var(--muted-foreground)] ml-0.5">km/h</span>
          </span>
        </div>
        {day.precipitationSum > 0 && (
          <div className="flex justify-between">
            <span>Yağış</span>
            <span className="font-medium text-[var(--foreground)]">{day.precipitationSum.toFixed(1)} mm</span>
          </div>
        )}
      </div>

      {/* Uygunluk rozeti */}
      <div className="mt-2 pt-1.5 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-semibold" style={{ color }}>
            {getSuitabilityLabel(level)}
          </span>
        </div>
        {reasons.length > 0 && (
          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
            {reasons.join(" · ")}
          </p>
        )}
      </div>

      {/* Çakışma uyarısı */}
      {isConflict && (
        <div className="mt-1.5 pt-1.5 border-t border-[var(--feedback-error)]/20 flex items-center gap-1">
          <span className="text-xs">⚠️</span>
          <span className="text-[10px] font-semibold text-[var(--feedback-error)]">
            Planlı operasyon var!
          </span>
        </div>
      )}
    </div>
  );
}
