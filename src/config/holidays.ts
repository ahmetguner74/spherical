// ============================================
// Türkiye Resmi Tatilleri — 2020-2030
// Sabit tatiller fonksiyonla üretilir, dini bayramlar elle tanımlıdır (Diyanet verileri)
// ============================================

export type HolidayType = "resmi" | "dini" | "arefe";

export interface Holiday {
  date: string;       // YYYY-MM-DD
  name: string;       // "Cumhuriyet Bayramı"
  type: HolidayType;
  isHalfDay?: boolean; // true → yarım gün (öğleden sonra tatil)
}

/** "YYYY-MM-DD" formatında tarih üretir */
function d(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ─── Sabit Resmi Tatiller (her yıl aynı gün) ───
function getFixedHolidays(year: number): Holiday[] {
  return [
    { date: d(year, 1, 1),   name: "Yılbaşı",                                  type: "resmi" },
    { date: d(year, 4, 23),  name: "Ulusal Egemenlik ve Çocuk Bayramı",       type: "resmi" },
    { date: d(year, 5, 1),   name: "Emek ve Dayanışma Günü",                  type: "resmi" },
    { date: d(year, 5, 19),  name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", type: "resmi" },
    { date: d(year, 7, 15),  name: "Demokrasi ve Milli Birlik Günü",          type: "resmi" },
    { date: d(year, 8, 30),  name: "Zafer Bayramı",                           type: "resmi" },
    { date: d(year, 10, 28), name: "Cumhuriyet Bayramı Arefesi",              type: "arefe", isHalfDay: true },
    { date: d(year, 10, 29), name: "Cumhuriyet Bayramı",                      type: "resmi" },
  ];
}

// ─── Dini Bayramlar (2020-2030, Diyanet) ───
// Her yıl: arefe (1 yarım gün), Ramazan 3 tam gün / Kurban 4 tam gün
interface ReligiousDates {
  ramazanArefe: [number, number, number];   // [yıl, ay, gün]
  ramazan: [number, number, number];         // 1. gün (3 gün süren bayram başlangıcı)
  kurbanArefe: [number, number, number];
  kurban: [number, number, number];          // 1. gün (4 gün süren bayram başlangıcı)
}

const RELIGIOUS_DATES: Record<number, ReligiousDates> = {
  2020: { ramazanArefe: [2020, 5, 23], ramazan: [2020, 5, 24], kurbanArefe: [2020, 7, 30], kurban: [2020, 7, 31] },
  2021: { ramazanArefe: [2021, 5, 12], ramazan: [2021, 5, 13], kurbanArefe: [2021, 7, 19], kurban: [2021, 7, 20] },
  2022: { ramazanArefe: [2022, 5, 1],  ramazan: [2022, 5, 2],  kurbanArefe: [2022, 7, 8],  kurban: [2022, 7, 9]  },
  2023: { ramazanArefe: [2023, 4, 20], ramazan: [2023, 4, 21], kurbanArefe: [2023, 6, 27], kurban: [2023, 6, 28] },
  2024: { ramazanArefe: [2024, 4, 9],  ramazan: [2024, 4, 10], kurbanArefe: [2024, 6, 15], kurban: [2024, 6, 16] },
  2025: { ramazanArefe: [2025, 3, 29], ramazan: [2025, 3, 30], kurbanArefe: [2025, 6, 5],  kurban: [2025, 6, 6]  },
  2026: { ramazanArefe: [2026, 3, 19], ramazan: [2026, 3, 20], kurbanArefe: [2026, 5, 25], kurban: [2026, 5, 26] },
  2027: { ramazanArefe: [2027, 3, 8],  ramazan: [2027, 3, 9],  kurbanArefe: [2027, 5, 15], kurban: [2027, 5, 16] },
  2028: { ramazanArefe: [2028, 2, 25], ramazan: [2028, 2, 26], kurbanArefe: [2028, 5, 3],  kurban: [2028, 5, 4]  },
  2029: { ramazanArefe: [2029, 2, 13], ramazan: [2029, 2, 14], kurbanArefe: [2029, 4, 22], kurban: [2029, 4, 23] },
  2030: { ramazanArefe: [2030, 2, 3],  ramazan: [2030, 2, 4],  kurbanArefe: [2030, 4, 12], kurban: [2030, 4, 13] },
};

/** Bir tarihe N gün ekler */
function addDays(year: number, month: number, day: number, offset: number): [number, number, number] {
  const dt = new Date(year, month - 1, day);
  dt.setDate(dt.getDate() + offset);
  return [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()];
}

function getReligiousHolidays(year: number): Holiday[] {
  const rd = RELIGIOUS_DATES[year];
  if (!rd) return [];

  const holidays: Holiday[] = [];

  // Ramazan Bayramı: 1 arefe + 3 tam gün
  const [ray, ram, rad] = rd.ramazanArefe;
  holidays.push({ date: d(ray, ram, rad), name: "Ramazan Bayramı Arefesi", type: "arefe", isHalfDay: true });
  const [ry, rm, rdd] = rd.ramazan;
  for (let i = 0; i < 3; i++) {
    const [y, m, dd] = addDays(ry, rm, rdd, i);
    holidays.push({ date: d(y, m, dd), name: `Ramazan Bayramı ${i + 1}. Gün`, type: "dini" });
  }

  // Kurban Bayramı: 1 arefe + 4 tam gün
  const [kay, kam, kad] = rd.kurbanArefe;
  holidays.push({ date: d(kay, kam, kad), name: "Kurban Bayramı Arefesi", type: "arefe", isHalfDay: true });
  const [ky, km, kdd] = rd.kurban;
  for (let i = 0; i < 4; i++) {
    const [y, m, dd] = addDays(ky, km, kdd, i);
    holidays.push({ date: d(y, m, dd), name: `Kurban Bayramı ${i + 1}. Gün`, type: "dini" });
  }

  return holidays;
}

/** O yıla ait tüm tatilleri döner (sabit + dini) */
export function getHolidaysForYear(year: number): Holiday[] {
  return [...getFixedHolidays(year), ...getReligiousHolidays(year)];
}

// ─── Lookup cache (yıl bazlı) ───
const CACHE = new Map<number, Map<string, Holiday>>();

function getYearMap(year: number): Map<string, Holiday> {
  let map = CACHE.get(year);
  if (!map) {
    map = new Map();
    getHolidaysForYear(year).forEach((h) => map!.set(h.date, h));
    CACHE.set(year, map);
  }
  return map;
}

/** "YYYY-MM-DD" → Holiday | null (tatil ise döner) */
export function getHoliday(dateStr: string): Holiday | null {
  const year = Number(dateStr.slice(0, 4));
  if (!Number.isFinite(year)) return null;
  return getYearMap(year).get(dateStr) ?? null;
}

/** Takvim arka plan rengi için yardımcı — CSS değişkeni döner */
export function getHolidayBgColor(holiday: Holiday): string {
  return holiday.type === "arefe"
    ? "var(--feedback-warning-bg)"
    : "var(--feedback-error-bg)";
}

/** Takvim vurgu rengi (ince kenar, badge vb.) */
export function getHolidayAccentColor(holiday: Holiday): string {
  return holiday.type === "arefe"
    ? "var(--feedback-warning)"
    : "var(--feedback-error)";
}

// ─── Tarih Uyarısı (tatil + hafta sonu) ───

export type DateWarningType = "resmi" | "dini" | "arefe" | "weekend";

export interface DateWarning {
  type: DateWarningType;
  label: string;       // "Resmi Tatil" / "Dini Bayram" / "Arefe" / "Hafta Sonu"
  name: string;        // "Cumhuriyet Bayramı" / "Cumartesi"
  emoji: string;       // 🇹🇷 / 🕌 / 📅
  color: string;       // CSS var (metin/border)
  bg: string;          // CSS var (arka plan)
  isHalfDay?: boolean; // arefe için true
}

const WEEKEND_DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/**
 * Bir tarihin resmi tatil veya hafta sonu olup olmadığını kontrol eder.
 * Operasyon oluşturma/düzenleme formlarında kullanılır.
 */
export function getDateWarning(dateStr: string): DateWarning | null {
  if (!dateStr) return null;

  // Önce tatil kontrolü
  const holiday = getHoliday(dateStr);
  if (holiday) {
    const label = holiday.type === "arefe"
      ? "Arefe (Yarım Gün)"
      : holiday.type === "dini"
      ? "Dini Bayram"
      : "Resmi Tatil";
    return {
      type: holiday.type,
      label,
      name: holiday.name,
      emoji: holiday.type === "arefe" ? "🕌" : holiday.type === "dini" ? "🕌" : "🇹🇷",
      color: getHolidayAccentColor(holiday),
      bg: getHolidayBgColor(holiday),
      isHalfDay: holiday.isHalfDay,
    };
  }

  // Sonra hafta sonu kontrolü (Cumartesi=6, Pazar=0)
  const dt = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(dt.getTime())) return null;
  const dow = dt.getDay();
  if (dow === 0 || dow === 6) {
    return {
      type: "weekend",
      label: "Hafta Sonu",
      name: WEEKEND_DAYS[dow],
      emoji: "📅",
      color: "var(--feedback-info)",
      bg: "var(--feedback-info-bg)",
    };
  }

  return null;
}
