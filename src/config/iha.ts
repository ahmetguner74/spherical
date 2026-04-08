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

// Bursa ilçeleri — nüfusa göre büyükten küçüğe (2024)
export const BURSA_ILCELER = [
  "Osmangazi",
  "Nilüfer",
  "Yıldırım",
  "İnegöl",
  "Gemlik",
  "Mudanya",
  "Gürsu",
  "Kestel",
  "Mustafakemalpaşa",
  "Karacabey",
  "Orhangazi",
  "Yenişehir",
  "İznik",
  "Orhaneli",
  "Büyükorhan",
  "Keles",
  "Harmancık",
] as const;

export function getReportYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: IHA_CONFIG.reportYearRange + 1 },
    (_, i) => currentYear - 2 + i
  );
}
