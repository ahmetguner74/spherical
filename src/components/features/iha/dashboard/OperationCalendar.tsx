"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { Operation, VehicleEvent, WeatherDaily } from "@/types/iha";
import { MonthlyCalendar } from "./MonthlyCalendar";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { CalendarDayDetail } from "./CalendarDayDetail";
import { FieldPrepPanel } from "./FieldPrepPanel";
import { useWeather } from "../weather/useWeather";
import {
  MONTHS,
  type CalendarViewMode,
  getMonday,
  dateToStr,
  formatWeekRange,
  groupOperationsByDate,
  groupVehicleEventsByDate,
} from "./calendarConstants";

interface OperationCalendarProps {
  operations: Operation[];
  vehicleEvents?: VehicleEvent[];
  onSelect: (op: Operation) => void;
  onDateChange?: (opId: string, newDate: string, startTime?: string, endTime?: string) => void;
  onNewOperation?: (date?: string, startTime?: string) => void;
}

export function OperationCalendar({ operations, vehicleEvents = [], onSelect, onDateChange, onNewOperation }: OperationCalendarProps) {
  const [today] = useState(() => new Date());
  const todayStr = dateToStr(today);

  /* ─── Görünüm modu ─── */
  const [viewMode, setViewMode] = useState<CalendarViewMode>("monthly");

  /* ─── Aylık state ─── */
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  /* ─── Haftalık state ─── */
  const [weekStart, setWeekStart] = useState(() => getMonday(today));

  /* ─── Ortak state ─── */
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  /* ─── Operasyonları grupla ─── */
  const { opsByDate, multiDayByDate } = useMemo(
    () => groupOperationsByDate(operations),
    [operations],
  );

  /* ─── Araç etkinliklerini grupla ─── */
  const vehicleEventsByDate = useMemo(
    () => groupVehicleEventsByDate(vehicleEvents),
    [vehicleEvents],
  );

  /* ─── Hava durumu (cache'li — duplicate API çağrısı yapmaz) ─── */
  const { daily: weatherDaily } = useWeather();
  const weatherByDate = useMemo(() => {
    const map = new Map<string, WeatherDaily>();
    weatherDaily.forEach((d) => map.set(d.date, d));
    return map;
  }, [weatherDaily]);

  const selectedOps = selectedDate ? opsByDate.get(selectedDate) ?? [] : [];
  const selectedVehicleEvents = selectedDate ? vehicleEventsByDate.get(selectedDate) ?? [] : [];

  // Bugünün operasyonları (panel her zaman göstersin)
  const todayOps = opsByDate.get(todayStr) ?? [];
  const activeDate = selectedDate ?? todayStr;
  const activeOps = selectedDate ? selectedOps : todayOps;
  const activeVehicleEvents = selectedDate ? selectedVehicleEvents : (vehicleEventsByDate.get(todayStr) ?? []);

  /* ─── Mod geçişi senkronizasyonu ─── */
  const switchToWeekly = useCallback(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();
    setWeekStart(getMonday(isCurrentMonth ? today : firstOfMonth));
    setViewMode("weekly");
    setShowPicker(false);
  }, [viewMonth, viewYear, today]);

  const switchToMonthly = useCallback(() => {
    setViewMonth(weekStart.getMonth());
    setViewYear(weekStart.getFullYear());
    setViewMode("monthly");
  }, [weekStart]);

  /* ─── Navigasyon ─── */
  const prev = () => {
    if (viewMode === "monthly") {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
      else setViewMonth(viewMonth - 1);
    } else {
      const d = new Date(weekStart);
      d.setDate(d.getDate() - 7);
      setWeekStart(d);
    }
  };

  const next = () => {
    if (viewMode === "monthly") {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
      else setViewMonth(viewMonth + 1);
    } else {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + 7);
      setWeekStart(d);
    }
  };

  const goToday = () => {
    if (viewMode === "monthly") {
      setViewMonth(today.getMonth());
      setViewYear(today.getFullYear());
    } else {
      setWeekStart(getMonday(today));
    }
  };

  /* ─── Başlık ─── */
  const title = viewMode === "monthly"
    ? `${MONTHS[viewMonth]} ${viewYear}`
    : formatWeekRange(weekStart);

  const isCurrentPeriod = viewMode === "monthly"
    ? viewMonth === today.getMonth() && viewYear === today.getFullYear()
    : dateToStr(getMonday(today)) === dateToStr(weekStart);

  /* ─── Picker dış tıklama ─── */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  const yearRange = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* ─── Header ─── */}
      <CalendarHeader
        viewMode={viewMode}
        title={title}
        isCurrentPeriod={isCurrentPeriod}
        showPicker={showPicker}
        pickerRef={pickerRef}
        yearRange={yearRange}
        viewYear={viewYear}
        viewMonth={viewMonth}
        todayYear={today.getFullYear()}
        onPrev={prev}
        onNext={next}
        onGoToday={goToday}
        onSwitchToMonthly={switchToMonthly}
        onSwitchToWeekly={switchToWeekly}
        onTogglePicker={() => viewMode === "monthly" && setShowPicker(!showPicker)}
        onSetYear={setViewYear}
        onSetMonth={(m) => { setViewMonth(m); setShowPicker(false); }}
      />

      {/* ─── Takvim Görünümü ─── */}
      {viewMode === "monthly" ? (
        <MonthlyCalendar
          operations={operations}
          opsByDate={opsByDate}
          multiDayByDate={multiDayByDate}
          vehicleEventsByDate={vehicleEventsByDate}
          weatherByDate={weatherByDate}
          viewMonth={viewMonth}
          viewYear={viewYear}
          today={today}
          todayStr={todayStr}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onDateChange={onDateChange}
        />
      ) : (
        <WeeklyCalendar
          opsByDate={opsByDate}
          vehicleEventsByDate={vehicleEventsByDate}
          weekStart={weekStart}
          today={today}
          todayStr={todayStr}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onSelect={onSelect}
          onDateChange={onDateChange}
          onNewOperation={onNewOperation}
        />
      )}

      {/* ─── Gün Detayı + Saha Hazırlığı (her zaman görünür) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-1">
          <CalendarDayDetail
            selectedDate={activeDate}
            operations={activeOps}
            vehicleEvents={activeVehicleEvents}
            onSelect={onSelect}
            onNewOperation={viewMode === "monthly" ? onNewOperation : undefined}
          />
        </div>
        <div className="md:col-span-2">
          <FieldPrepPanel
            selectedDate={activeDate}
            operations={activeOps.filter((op) => op.type !== "ofis")}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Header Bileşeni ─── */
function CalendarHeader({
  viewMode,
  title,
  isCurrentPeriod,
  showPicker,
  pickerRef,
  yearRange,
  viewYear,
  viewMonth,
  todayYear,
  onPrev,
  onNext,
  onGoToday,
  onSwitchToMonthly,
  onSwitchToWeekly,
  onTogglePicker,
  onSetYear,
  onSetMonth,
}: {
  viewMode: CalendarViewMode;
  title: string;
  isCurrentPeriod: boolean;
  showPicker: boolean;
  pickerRef: React.RefObject<HTMLDivElement | null>;
  yearRange: number[];
  viewYear: number;
  viewMonth: number;
  todayYear: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToday: () => void;
  onSwitchToMonthly: () => void;
  onSwitchToWeekly: () => void;
  onTogglePicker: () => void;
  onSetYear: (y: number) => void;
  onSetMonth: (m: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-[var(--border)] gap-2">
      <button
        onClick={onPrev}
        className="p-2 -m-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)] rounded-lg transition-colors shrink-0"
      >
        ←
      </button>

      <div className="flex items-center gap-2 flex-wrap justify-center min-w-0 relative" ref={pickerRef}>
        {/* Görünüm modu toggle */}
        <ViewToggle viewMode={viewMode} onMonthly={onSwitchToMonthly} onWeekly={onSwitchToWeekly} />

        {/* Başlık */}
        <button
          onClick={onTogglePicker}
          className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 min-w-0"
        >
          <span className="truncate">{title}</span>
          {viewMode === "monthly" && (
            <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">▼</span>
          )}
        </button>

        {/* Bugün butonu */}
        {!isCurrentPeriod && (
          <button
            onClick={onGoToday}
            className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors font-medium shrink-0"
          >
            Bugün
          </button>
        )}

        {/* Yıl/Ay Seçici */}
        {showPicker && viewMode === "monthly" && (
          <MonthYearPicker
            yearRange={yearRange}
            viewYear={viewYear}
            viewMonth={viewMonth}
            todayYear={todayYear}
            onSetYear={onSetYear}
            onSetMonth={onSetMonth}
          />
        )}
      </div>

      <button
        onClick={onNext}
        className="p-2 -m-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)] rounded-lg transition-colors shrink-0"
      >
        →
      </button>
    </div>
  );
}

/* ─── Görünüm Modu Toggle ─── */
function ViewToggle({
  viewMode,
  onMonthly,
  onWeekly,
}: {
  viewMode: CalendarViewMode;
  onMonthly: () => void;
  onWeekly: () => void;
}) {
  return (
    <div className="flex bg-[var(--background)] rounded-lg p-0.5 shrink-0">
      <button
        onClick={viewMode === "weekly" ? onMonthly : undefined}
        className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-md font-medium transition-colors ${
          viewMode === "monthly"
            ? "bg-[var(--accent)] text-white shadow-sm"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        Aylık
      </button>
      <button
        onClick={viewMode === "monthly" ? onWeekly : undefined}
        className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-md font-medium transition-colors ${
          viewMode === "weekly"
            ? "bg-[var(--accent)] text-white shadow-sm"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        Haftalık
      </button>
    </div>
  );
}

/* ─── Ay/Yıl Seçici ─── */
function MonthYearPicker({
  yearRange,
  viewYear,
  viewMonth,
  todayYear,
  onSetYear,
  onSetMonth,
}: {
  yearRange: number[];
  viewYear: number;
  viewMonth: number;
  todayYear: number;
  onSetYear: (y: number) => void;
  onSetMonth: (m: number) => void;
}) {
  return (
    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-3 min-w-[280px]">
      <div className="mb-3">
        <div className="text-[10px] font-medium text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Yıl</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {yearRange.map((y) => (
            <button
              key={y}
              onClick={() => onSetYear(y)}
              className={`text-xs py-1.5 rounded transition-colors ${
                y === viewYear
                  ? "bg-[var(--accent)] text-white font-semibold"
                  : y === todayYear
                  ? "text-[var(--accent)] hover:bg-[var(--surface-hover)]"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-medium text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Ay</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => onSetMonth(i)}
              className={`text-xs py-1.5 rounded transition-colors ${
                i === viewMonth && viewYear === todayYear
                  ? "bg-[var(--accent)] text-white font-semibold"
                  : i === viewMonth
                  ? "bg-[var(--accent)]/20 text-[var(--accent)] font-semibold"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
