import type { OperationType, Operation, VehicleEvent } from "@/types/iha";

export const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export const DAYS_FULL = [
  "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar",
];

export const DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export const TYPE_ICONS: Record<OperationType, string> = {
  iha: "🛩️",
  lidar: "📡",
  lidar_el: "📡",
  lidar_arac: "🚗",
  drone_fotogrametri: "🛩️",
  oblik_cekim: "📐",
  panorama_360: "🌐",
};

export type CalendarViewMode = "monthly" | "weekly";

export function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function dateToStr(d: Date): string {
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface MultiDayInfo {
  op: Operation;
  isStart: boolean;
  isEnd: boolean;
  isMid: boolean;
}

/** Haftanın Pazartesi gününü bul */
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Hafta tarih aralığı metni */
export function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mDay = monday.getDate();
  const mMonth = MONTHS[monday.getMonth()];
  const sDay = sunday.getDate();
  const sMonth = MONTHS[sunday.getMonth()];
  if (monday.getMonth() === sunday.getMonth()) {
    return `${mDay}–${sDay} ${mMonth}`;
  }
  return `${mDay} ${mMonth} – ${sDay} ${sMonth}`;
}

/** Operasyonları tarihe göre grupla + çoklu gün bilgisi */
export function groupOperationsByDate(operations: Operation[]) {
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
        const isStartDay = key === start;
        const isEndDay = key === end;
        mdList.push({ op, isStart: isStartDay, isEnd: isEndDay, isMid: !isStartDay && !isEndDay });
        multi.set(key, mdList);
      }
      d.setDate(d.getDate() + 1);
    }
  });
  return { opsByDate: ops, multiDayByDate: multi };
}

/** Araç etkinliklerini tarihe göre grupla */
export function groupVehicleEventsByDate(events: VehicleEvent[]) {
  const map = new Map<string, VehicleEvent[]>();
  events.forEach((ev) => {
    if (!ev.eventDate) return;
    const key = ev.eventDate.slice(0, 10);
    const list = map.get(key) ?? [];
    list.push(ev);
    map.set(key, list);
  });
  return map;
}
