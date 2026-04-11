// Excel Import Wizard — yardımcı fonksiyonlar

import type { Operation } from "@/types/iha";

/** Sistem alan tanımı — eşleştirme dropdown'ı için */
export interface SystemField {
  key: SystemFieldKey;
  label: string;
  required: boolean;
  description?: string;
}

export type SystemFieldKey =
  | "title"
  | "ilce"
  | "mahalle"
  | "pafta"
  | "startDate"
  | "endDate"
  | "startTime"
  | "endTime"
  | "requester"
  | "description"
  | "notes"
  | "operators"
  | "alanKm2"
  | "lat"
  | "lng"
  | "__ignore"
  | "__custom";

export const SYSTEM_FIELDS: SystemField[] = [
  { key: "title", label: "Operasyon Adı", required: true, description: "Örn: H21C02C" },
  { key: "ilce", label: "İlçe", required: true, description: "Bursa ilçesi" },
  { key: "startDate", label: "Tarih", required: false, description: "YYYY-MM-DD veya DD.MM.YYYY" },
  { key: "endDate", label: "Bitiş Tarihi", required: false },
  { key: "startTime", label: "Başlangıç Saati", required: false },
  { key: "endTime", label: "Bitiş Saati", required: false },
  { key: "pafta", label: "Pafta", required: false },
  { key: "mahalle", label: "Mahalle", required: false },
  { key: "requester", label: "Talep Eden", required: false },
  { key: "description", label: "Açıklama", required: false },
  { key: "notes", label: "Notlar", required: false },
  { key: "operators", label: "Operatörler", required: false, description: "Virgülle ayrılmış" },
  { key: "alanKm2", label: "Alan (km²)", required: false },
  { key: "lat", label: "Enlem", required: false },
  { key: "lng", label: "Boylam", required: false },
];

/** Excel başlığını sistem alanıyla otomatik eşleştirir (benzerlik) */
export function autoMatchField(excelHeader: string): SystemFieldKey {
  const h = excelHeader.toLowerCase().trim().replace(/\s+/g, "");

  // Tarih
  if (h.includes("tarih") || h.includes("date")) {
    if (h.includes("biti") || h.includes("end")) return "endDate";
    return "startDate";
  }
  // Saat
  if (h.includes("saat") || h.includes("time") || h.includes("kalkı")) {
    if (h.includes("biti") || h.includes("end")) return "endTime";
    return "startTime";
  }
  // Ad / Pafta
  if (h === "pafta" || h.includes("pafta")) return "pafta";
  if (h.includes("ad") && !h.includes("adres") && !h.includes("kada")) return "title";
  if (h === "isim" || h === "başlık" || h === "baslik") return "title";
  // Konum
  if (h.includes("ilce") || h.includes("ilçe")) return "ilce";
  if (h.includes("mahalle")) return "mahalle";
  if (h.includes("enlem") || h === "lat") return "lat";
  if (h.includes("boylam") || h === "lng" || h === "lon") return "lng";
  // Diğer
  if (h.includes("talep") || h.includes("isteyen")) return "requester";
  if (h.includes("operat") || h.includes("pilot") || h.includes("ekip")) return "operators";
  if (h.includes("alan") || h.includes("area")) return "alanKm2";
  if (h.includes("açıkl") || h.includes("aciklama") || h.includes("desc")) return "description";
  if (h.includes("not")) return "notes";

  return "__custom"; // Otomatik eşleşmedi → custom field
}

/** Tek bir Excel satırını operasyona dönüştür */
export interface RowMappingResult {
  ok: boolean;
  operation?: Partial<Operation>;
  errors: string[];
  warnings: string[];
  sourceRow: Record<string, unknown>;
}

export function mapRowToOperation(
  row: Record<string, unknown>,
  mapping: Record<string, SystemFieldKey>, // Excel header → system field
  customFieldsEnabled: boolean,
): RowMappingResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const op: Partial<Operation> = {
    type: "iha",
    subTypes: ["ortofoto"],
    status: "teslim",
    location: { il: "Bursa", ilce: "" },
    assignedTeam: [],
    assignedEquipment: [],
  };
  const customFields: Record<string, string> = {};

  for (const [excelHeader, value] of Object.entries(row)) {
    const systemKey = mapping[excelHeader];
    if (!systemKey || systemKey === "__ignore") continue;

    const strValue = value == null ? "" : String(value).trim();
    if (!strValue) continue;

    if (systemKey === "__custom") {
      if (customFieldsEnabled) customFields[excelHeader] = strValue;
      continue;
    }

    switch (systemKey) {
      case "title":
        op.title = strValue;
        break;
      case "ilce":
        op.location = { ...op.location!, ilce: strValue };
        break;
      case "mahalle":
        op.location = { ...op.location!, mahalle: strValue };
        break;
      case "pafta":
        op.location = { ...op.location!, pafta: strValue };
        op.paftalar = [strValue];
        break;
      case "startDate": {
        const parsed = parseDate(strValue);
        if (parsed) op.startDate = parsed;
        else warnings.push(`Tarih parse edilemedi: ${strValue}`);
        break;
      }
      case "endDate": {
        const parsed = parseDate(strValue);
        if (parsed) op.endDate = parsed;
        break;
      }
      case "startTime":
        op.startTime = strValue;
        break;
      case "endTime":
        op.endTime = strValue;
        break;
      case "requester":
        op.requester = strValue;
        break;
      case "description":
        op.description = strValue;
        break;
      case "notes":
        op.notes = strValue;
        break;
      case "alanKm2": {
        const num = parseFloat(strValue.replace(",", "."));
        if (!isNaN(num)) op.location = { ...op.location!, alan: num * 1_000_000, alanBirimi: "m2" };
        break;
      }
      case "lat": {
        const num = parseFloat(strValue.replace(",", "."));
        if (!isNaN(num)) op.location = { ...op.location!, lat: num };
        break;
      }
      case "lng": {
        const num = parseFloat(strValue.replace(",", "."));
        if (!isNaN(num)) op.location = { ...op.location!, lng: num };
        break;
      }
      case "operators":
        // Operatör isimleri virgülle ayrılıyor, string olarak notes'a yedekle
        if (!op.notes) op.notes = "";
        op.notes = (op.notes ? op.notes + " · " : "") + `Operatör: ${strValue}`;
        break;
    }
  }

  if (Object.keys(customFields).length > 0) {
    op.customFields = customFields;
  }

  // Zorunlu alan kontrolü
  if (!op.title?.trim()) errors.push("Operasyon adı yok");
  if (!op.location?.ilce?.trim()) errors.push("İlçe yok");

  if (!op.startDate) op.startDate = new Date().toISOString().slice(0, 10);
  if (!op.startTime) op.startTime = "08:00";
  if (!op.endTime) op.endTime = "09:00";

  return {
    ok: errors.length === 0,
    operation: errors.length === 0 ? op : undefined,
    errors,
    warnings,
    sourceRow: row,
  };
}

/** DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD formatlarını YYYY-MM-DD'ye çevir */
function parseDate(value: string): string | null {
  // Zaten ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  // DD.MM.YYYY veya DD/MM/YYYY
  const m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) {
    const day = m[1].padStart(2, "0");
    const month = m[2].padStart(2, "0");
    let year = m[3];
    if (year.length === 2) year = "20" + year;
    return `${year}-${month}-${day}`;
  }
  // Excel serial date (sayı)
  const num = Number(value);
  if (!isNaN(num) && num > 1000 && num < 100000) {
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch.getTime() + num * 86400000);
    return d.toISOString().slice(0, 10);
  }
  return null;
}

/** Mevcut operasyon başlıklarıyla karşılaştırıp mükerreri tespit et */
export function checkDuplicate(title: string, existingTitles: Set<string>): boolean {
  return existingTitles.has(title.toLowerCase().trim());
}
