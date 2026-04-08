"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Operation, OperationType } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";
import { statusColors, statusBgColors } from "@/config/tokens";

interface OperationCalendarProps {
  operations: Operation[];
  onSelect: (op: Operation) => void;
  onNewOperation?: (date?: string) => void;
}

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS_FULL = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

/* ─── Operasyon Tipi İkonları ─── */
const TYPE_ICONS: Record<OperationType, string> = {
  lidar_el: "📡",
  lidar_arac: "🚗",
  drone_fotogrametri: "🛩️",
  oblik_cekim: "📐",
  panorama_360: "🌐",
};

/* ─── Yardımcı: tarih string ─── */
function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* ─── Çoklu gün operasyon bilgisi ─── */
interface MultiDayInfo {
  op: Operation;
  isStart: boolean;
  isEnd: boolean;
  isMid: boolean;
}

export function OperationCalendar({ operations, onSelect, onNewOperation }: OperationCalendarProps) {
  const [today] = useState(() => new Date());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  /* Önceki ay günleri */
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  /* Sonraki ay günleri */
  const totalCells = startOffset + daysInMonth;
  const endOffset = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  /* Operasyonları tarihe göre grupla + çoklu gün bilgisi (tek döngü) */
  const { opsByDate, multiDayByDate } = useMemo(() => {
    const ops = new Map<string, Operation[]>();
    const multi = new Map<string, MultiDayInfo[]>();
    operations.forEach((op) => {
      if (!op.startDate) return;
      const start = op.startDate.slice(0, 10);
      const end = op.endDate?.slice(0, 10) ?? start;
      const isMultiDay = start !== end;
      const d = new Date(start);
      const endD = new Date(end);
      while (d <= endD) {
        const key = d.toISOString().slice(0, 10);
        const list = ops.get(key) ?? [];
        list.push(op);
        ops.set(key, list);
        if (isMultiDay) {
          const mdList = multi.get(key) ?? [];
          const isStart = key === start;
          const isEnd = key === end;
          mdList.push({ op, isStart, isEnd, isMid: !isStart && !isEnd });
          multi.set(key, mdList);
        }
        d.setDate(d.getDate() + 1);
      }
    });
    return { opsByDate: ops, multiDayByDate: multi };
  }, [operations]);

  /* Ay özet istatistikleri */
  const monthStats = useMemo(() => {
    const stats = { total: 0, saha: 0, teslim: 0, talep: 0, isleme: 0 };
    const monthStart = toDateStr(viewYear, viewMonth, 1);
    const monthEnd = toDateStr(viewYear, viewMonth, daysInMonth);
    operations.forEach((op) => {
      if (!op.startDate) return;
      const start = op.startDate.slice(0, 10);
      if (start >= monthStart && start <= monthEnd) {
        stats.total++;
        if (op.status === "saha") stats.saha++;
        if (op.status === "teslim") stats.teslim++;
        if (op.status === "talep") stats.talep++;
        if (op.status === "isleme") stats.isleme++;
      }
    });
    return stats;
  }, [operations, viewMonth, viewYear, daysInMonth]);

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };
  const goToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedOps = selectedDate ? opsByDate.get(selectedDate) ?? [] : [];

  /* Picker dışına tıklayınca kapat */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  /* Yıl listesi */
  const yearRange = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* ─── Ay Navigasyonu + Bugün butonu + Yıl/Ay seçici ─── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <button onClick={prev} className="p-2 -m-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)] rounded-lg transition-colors">
          ←
        </button>

        <div className="flex items-center gap-2 relative" ref={pickerRef}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
          >
            {MONTHS[viewMonth]} {viewYear}
            <span className="text-[10px] text-[var(--muted-foreground)]">▼</span>
          </button>

          {!isCurrentMonth && (
            <button
              onClick={goToday}
              className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors font-medium"
            >
              Bugün
            </button>
          )}

          {/* ─── Yıl/Ay Seçici Dropdown ─── */}
          {showPicker && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-3 min-w-[280px]">
              {/* Yıl seçimi */}
              <div className="mb-3">
                <div className="text-[10px] font-medium text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Yıl</div>
                <div className="grid grid-cols-4 gap-1">
                  {yearRange.map((y) => (
                    <button
                      key={y}
                      onClick={() => setViewYear(y)}
                      className={`text-xs py-1.5 rounded transition-colors ${
                        y === viewYear
                          ? "bg-[var(--accent)] text-white font-semibold"
                          : y === today.getFullYear()
                          ? "text-[var(--accent)] hover:bg-[var(--surface-hover)]"
                          : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              {/* Ay seçimi */}
              <div>
                <div className="text-[10px] font-medium text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Ay</div>
                <div className="grid grid-cols-4 gap-1">
                  {MONTHS.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => { setViewMonth(i); setShowPicker(false); }}
                      className={`text-xs py-1.5 rounded transition-colors ${
                        i === viewMonth && viewYear === today.getFullYear()
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
          )}
        </div>

        <button onClick={next} className="p-2 -m-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)] rounded-lg transition-colors">
          →
        </button>
      </div>

      {/* ─── Ay Özet Çubuğu ─── */}
      {monthStats.total > 0 && (
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center gap-3 flex-wrap text-[11px]">
          <span className="font-semibold text-[var(--foreground)]">Bu ay: {monthStats.total} operasyon</span>
          {monthStats.saha > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.saha }} />
              {monthStats.saha} saha
            </span>
          )}
          {monthStats.isleme > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.isleme }} />
              {monthStats.isleme} işleme
            </span>
          )}
          {monthStats.teslim > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.teslim }} />
              {monthStats.teslim} teslim
            </span>
          )}
          {monthStats.talep > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.talep }} />
              {monthStats.talep} talep
            </span>
          )}
        </div>
      )}

      {/* ─── Gün Başlıkları ─── */}
      <div className="grid grid-cols-7 text-center border-b border-[var(--border)]">
        {DAYS_SHORT.map((d, i) => {
          const isWeekend = i >= 5;
          return (
            <div key={d} className={`py-2 text-xs font-medium ${isWeekend ? "text-red-400/70" : "text-[var(--muted-foreground)]"}`}>
              <span className="sm:hidden">{d[0]}</span>
              <span className="hidden sm:inline md:hidden">{DAYS_SHORT[i]}</span>
              <span className="hidden md:inline">{DAYS_FULL[i]}</span>
            </div>
          );
        })}
      </div>

      {/* ─── Takvim Grid ─── */}
      <div className="grid grid-cols-7">
        {/* Önceki ay günleri */}
        {Array.from({ length: startOffset }).map((_, i) => {
          const day = prevMonthDays - startOffset + 1 + i;
          return (
            <div key={`prev-${i}`} className="min-h-[3rem] sm:min-h-[4.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border)] bg-[var(--background)]/30">
              <span className="text-xs text-[var(--muted-foreground)]/30">{day}</span>
            </div>
          );
        })}

        {/* Mevcut ay günleri */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(viewYear, viewMonth, day);
          const dayOps = opsByDate.get(dateStr) ?? [];
          const multiDays = multiDayByDate.get(dateStr) ?? [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasOps = dayOps.length > 0;
          const dayOfWeek = (startOffset + i) % 7;
          const isWeekend = dayOfWeek >= 5;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`min-h-[3rem] sm:min-h-[4.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border)] text-left transition-colors relative ${
                isSelected ? "bg-[var(--accent)]/10 ring-1 ring-inset ring-[var(--accent)]" :
                isToday ? "bg-[var(--accent)]/5" :
                isWeekend ? "bg-[var(--background)]/40" : ""
              } ${hasOps ? "hover:bg-[var(--surface-hover)]" : "hover:bg-[var(--surface-hover)]/50"}`}
            >
              {/* Gün numarası */}
              <span className={`text-xs sm:text-sm font-medium block ${
                isToday ? "text-[var(--accent)] font-bold" :
                isWeekend ? "text-red-400/60" : "text-[var(--muted-foreground)]"
              }`}>
                {day}
              </span>

              {/* Mobil: İkonlar + noktalar */}
              <div className="flex gap-0.5 mt-0.5 sm:hidden flex-wrap">
                {dayOps.slice(0, 3).map((op) => (
                  <span
                    key={op.id}
                    className="text-[10px] leading-none"
                    title={OPERATION_TYPE_LABELS[op.type]}
                  >
                    {TYPE_ICONS[op.type]}
                  </span>
                ))}
                {dayOps.length > 3 && <span className="text-[8px] text-[var(--muted-foreground)]">+{dayOps.length - 3}</span>}
              </div>

              {/* Masaüstü: Çoklu gün çizgileri + operasyon etiketleri */}
              <div className="hidden sm:block space-y-0.5 mt-0.5">
                {/* Çoklu gün çizgileri */}
                {multiDays.slice(0, 1).map((md) => (
                  <div
                    key={`md-${md.op.id}`}
                    className={`h-[18px] flex items-center text-[10px] leading-tight truncate ${
                      md.isStart ? "rounded-l pl-1 -mr-1" :
                      md.isEnd ? "rounded-r pr-1 -ml-1" :
                      "-mx-1 px-1"
                    }`}
                    style={{
                      backgroundColor: statusBgColors[md.op.status],
                      color: statusColors[md.op.status],
                      borderLeft: md.isStart ? `3px solid ${statusColors[md.op.status]}` : "none",
                    }}
                  >
                    {md.isStart && (
                      <span className="truncate">
                        {TYPE_ICONS[md.op.type]} {md.op.title}
                      </span>
                    )}
                  </div>
                ))}
                {/* Tek günlük operasyonlar */}
                {dayOps
                  .filter((op) => {
                    const start = op.startDate?.slice(0, 10);
                    const end = op.endDate?.slice(0, 10) ?? start;
                    return start === end;
                  })
                  .slice(0, multiDays.length > 0 ? 1 : 2)
                  .map((op) => (
                    <div
                      key={op.id}
                      className="rounded px-1 py-0.5 text-[11px] leading-tight truncate flex items-center gap-0.5"
                      style={{ backgroundColor: statusBgColors[op.status], color: statusColors[op.status] }}
                    >
                      <span className="text-[10px]">{TYPE_ICONS[op.type]}</span>
                      <span className="truncate">{op.title}</span>
                    </div>
                  ))}
                {dayOps.length > 2 && (
                  <span className="text-[10px] text-[var(--muted-foreground)] px-1">+{dayOps.length - 2}</span>
                )}
              </div>
            </button>
          );
        })}

        {/* Sonraki ay günleri */}
        {Array.from({ length: endOffset }).map((_, i) => (
          <div key={`next-${i}`} className="min-h-[3rem] sm:min-h-[4.5rem] p-1 sm:p-1.5 border-b border-r border-[var(--border)] bg-[var(--background)]/30">
            <span className="text-xs text-[var(--muted-foreground)]/30">{i + 1}</span>
          </div>
        ))}
      </div>

      {/* ─── Seçili Gün Detayı ─── */}
      {selectedDate && (
        <div className="border-t border-[var(--border)] p-3 space-y-2 bg-[var(--background)]">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[var(--muted-foreground)]">
              {new Date(selectedDate + "T00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })}
              {selectedOps.length > 0 && <span className="ml-1">({selectedOps.length} operasyon)</span>}
            </h4>
            {onNewOperation && (
              <button
                onClick={() => onNewOperation(selectedDate)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors font-medium"
              >
                + Operasyon Ekle
              </button>
            )}
          </div>

          {selectedOps.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-[var(--muted-foreground)]">Bu gün için operasyon yok</p>
              {onNewOperation && (
                <button
                  onClick={() => onNewOperation(selectedDate)}
                  className="mt-2 text-sm text-[var(--accent)] hover:underline"
                >
                  Yeni operasyon oluştur →
                </button>
              )}
            </div>
          ) : (
            selectedOps.map((op) => (
              <button
                key={op.id}
                onClick={() => onSelect(op)}
                className="w-full text-left rounded-lg p-3 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base" title={OPERATION_TYPE_LABELS[op.type]}>{TYPE_ICONS[op.type]}</span>
                    <span className="text-sm font-medium text-[var(--foreground)] truncate">{op.title}</span>
                  </div>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium"
                    style={{ backgroundColor: statusBgColors[op.status], color: statusColors[op.status] }}
                  >
                    {OPERATION_STATUS_LABELS[op.status]}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {op.requester && <p className="text-xs text-[var(--muted-foreground)]">{op.requester}</p>}
                  {op.startDate && op.startDate !== op.endDate && op.endDate && (
                    <span className="text-[10px] text-[var(--muted-foreground)] bg-[var(--surface-hover)] px-1.5 py-0.5 rounded">
                      {new Date(op.startDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} – {new Date(op.endDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* ─── Legend ─── */}
      <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-3 flex-wrap">
        {/* Durum renkleri */}
        {(["talep", "saha", "isleme", "teslim"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[s] }} />
            <span className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">{OPERATION_STATUS_LABELS[s]}</span>
          </div>
        ))}
        <span className="text-[var(--border)]">|</span>
        {/* Tip ikonları */}
        {(Object.entries(TYPE_ICONS) as [OperationType, string][]).slice(0, 3).map(([type, icon]) => (
          <div key={type} className="flex items-center gap-0.5">
            <span className="text-[11px]">{icon}</span>
            <span className="text-[10px] sm:text-xs text-[var(--muted-foreground)] hidden sm:inline">{OPERATION_TYPE_LABELS[type].split(" ")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
