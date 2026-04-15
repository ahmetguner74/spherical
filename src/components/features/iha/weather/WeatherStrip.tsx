"use client";

// ============================================
// WeatherStrip — Dashboard üst hava durumu şeridi
// Anlık hava + tıklayınca 7 günlük tahmin açılır
// ============================================

import { useState } from "react";
import { useWeather } from "./useWeather";
import {
  getWeatherEmoji,
  getWeatherLabel,
  getSuitabilityLabel,
  getSuitabilityColor,
  getDailySuitabilityFromWind,
} from "./weatherUtils";
import { IconWind, IconDroplet, IconRefresh, IconChevronDown, IconChevronUp } from "@/config/icons";
import type { WeatherDaily } from "@/types/iha";

export function WeatherStrip() {
  const { current, daily, suitability, isLoading, error, lastUpdate, refresh } = useWeather();
  const [expanded, setExpanded] = useState(false);

  // Hata veya yükleme — gizle veya skeleton
  if (error && !current) return null;

  if (isLoading && !current) {
    return <WeatherSkeleton />;
  }

  if (!current || !suitability) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Ana şerit */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 hover:bg-[var(--surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          {/* Hava durumu emoji + açıklama */}
          <span className="text-base sm:text-lg shrink-0" title={getWeatherLabel(current.weatherCode)}>
            {getWeatherEmoji(current.weatherCode)}
          </span>
          <span className="text-sm font-medium text-[var(--foreground)] hidden sm:inline">
            {getWeatherLabel(current.weatherCode)}
          </span>

          {/* Sıcaklık */}
          <span className="text-sm font-semibold text-[var(--foreground)]">
            {Math.round(current.temperature)}°C
          </span>

          {/* Rüzgar + hamle */}
          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <IconWind size={14} className="shrink-0" />
            <span>
              {Math.round(current.windSpeed)}
              {current.windGusts > current.windSpeed + 5 && (
                <span className="text-[var(--feedback-error)]/80"> ({Math.round(current.windGusts)})</span>
              )}
              <span className="hidden sm:inline"> km/h</span>
            </span>
          </span>

          {/* Nem (sadece masaüstü) */}
          <span className="hidden md:flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <IconDroplet size={14} className="shrink-0" />
            <span>%{current.humidity}</span>
          </span>

          {/* Ayırıcı */}
          <div className="w-px h-4 bg-[var(--border)] mx-0.5 hidden sm:block" />

          {/* Uçuş uygunluk rozeti */}
          <SuitabilityBadge suitability={suitability} label={getSuitabilityLabel(suitability)} />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Son güncelleme */}
          {lastUpdate && (
            <span className="text-[10px] text-[var(--muted-foreground)] hidden sm:inline">{lastUpdate}</span>
          )}
          {/* Yenile butonu */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); refresh(); }}
            className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
            aria-label="Hava durumunu yenile"
            title="Yenile"
          >
            <IconRefresh size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
          {/* Aç/kapa ikonu */}
          {expanded
            ? <IconChevronUp size={16} className="text-[var(--muted-foreground)]" />
            : <IconChevronDown size={16} className="text-[var(--muted-foreground)]" />
          }
        </div>
      </button>

      {/* 7 günlük tahmin (collapsible) */}
      {expanded && daily.length > 0 && (
        <ForecastPanel daily={daily} />
      )}
    </div>
  );
}

// ─── Uçuş Uygunluk Rozeti ───

function SuitabilityBadge({ suitability, label }: { suitability: string; label: string }) {
  const color = getSuitabilityColor(suitability as "uygun" | "riskli" | "uygun_degil");
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

// ─── 7 Günlük Tahmin Paneli ───

function ForecastPanel({ daily }: { daily: WeatherDaily[] }) {
  return (
    <div className="border-t border-[var(--border)] px-3 sm:px-4 py-3 bg-[var(--background)]/50">
      <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
        7 Günlük Tahmin
      </p>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {daily.map((d) => (
          <ForecastDay key={d.date} day={d} />
        ))}
      </div>
    </div>
  );
}

// ─── Tek Gün Tahmin Kartı ───

const GUN_ISIMLERI = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function ForecastDay({ day }: { day: WeatherDaily }) {
  const date = new Date(day.date + "T00:00");
  const dayName = GUN_ISIMLERI[date.getDay()];
  const dayNum = date.getDate();
  const suit = getDailySuitabilityFromWind(day.windMax, day.precipitationSum, day.weatherCode, day.gustMax);
  const dotColor = getSuitabilityColor(suit);

  return (
    <div
      className="flex flex-col items-center gap-0.5 p-1 sm:p-1.5 rounded-lg text-center hover:bg-[var(--surface-hover)] transition-colors"
      title={`${getWeatherLabel(day.weatherCode)} — Rüzgar: ${Math.round(day.windMax)} km/h${day.gustMax > day.windMax + 5 ? ` (hamle ${Math.round(day.gustMax)})` : ""} — Yağış: ${day.precipitationSum.toFixed(1)} mm`}
    >
      <span className="text-[10px] font-medium text-[var(--muted-foreground)]">{dayName}</span>
      <span className="text-[10px] text-[var(--muted-foreground)]">{dayNum}</span>
      <span className="text-sm sm:text-base">{getWeatherEmoji(day.weatherCode)}</span>
      <span className="text-[10px] sm:text-xs font-semibold text-[var(--foreground)]">
        {Math.round(day.tempMax)}°
      </span>
      <span className="text-[10px] text-[var(--muted-foreground)]">
        {Math.round(day.tempMin)}°
      </span>
      {/* Rüzgar */}
      <span className="text-[9px] text-[var(--muted-foreground)] flex items-center gap-0.5">
        <IconWind size={10} />
        {Math.round(day.windMax)}
      </span>
      {/* Uygunluk dot */}
      <span
        className="w-1.5 h-1.5 rounded-full mt-0.5"
        style={{ backgroundColor: dotColor }}
        title={getSuitabilityLabel(suit)}
      />
    </div>
  );
}

// ─── Skeleton (yükleme animasyonu) ───

function WeatherSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 sm:px-4 py-3 flex items-center gap-3">
      <div className="w-6 h-6 rounded bg-[var(--surface-hover)] animate-pulse" />
      <div className="w-16 h-4 rounded bg-[var(--surface-hover)] animate-pulse" />
      <div className="w-12 h-4 rounded bg-[var(--surface-hover)] animate-pulse" />
      <div className="w-20 h-4 rounded bg-[var(--surface-hover)] animate-pulse hidden sm:block" />
      <div className="ml-auto w-16 h-5 rounded-full bg-[var(--surface-hover)] animate-pulse" />
    </div>
  );
}
