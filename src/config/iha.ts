import type { OperationLocation } from "@/types/iha";

export const IHA_CONFIG = {
  defaultLocation: {
    il: "Bursa",
    ilce: "",
  } as OperationLocation,
  reportYearRange: 4,
  monthNames: [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ],
} as const;

export function getReportYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: IHA_CONFIG.reportYearRange + 1 },
    (_, i) => currentYear - 2 + i
  );
}
