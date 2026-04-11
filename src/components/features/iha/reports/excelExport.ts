import * as XLSX from "xlsx";
import type { Operation, FlightLog, OperationStatusGroup } from "@/types/iha";
import {
  OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS,
  OPERATION_STATUS_GROUP_LABELS, getStatusGroup,
} from "@/types/iha";

/**
 * Dönem verisini 3 sayfalı Excel dosyası olarak indir.
 *   Sheet 1: Operasyonlar (tüm gruplar — Yapılacak/Yapılıyor/Yapıldı)
 *   Sheet 2: Uçuş / Tarama Kayıtları
 *   Sheet 3: Özet (KPI'lar)
 */
export function exportReportToExcel(operations: Operation[], flightLogs: FlightLog[], periodLabel: string): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Operasyonlar
  const opRows = operations.map((op) => ({
    "Başlık": op.title,
    "Durum": OPERATION_STATUS_LABELS[op.status] ?? op.status,
    "Grup": OPERATION_STATUS_GROUP_LABELS[getStatusGroup(op.status)],
    "Tip": OPERATION_TYPE_LABELS[op.type] ?? op.type,
    "Talep Eden": op.requester ?? "",
    "İl": op.location.il ?? "",
    "İlçe": op.location.ilce ?? "",
    "Mahalle": op.location.mahalle ?? "",
    "Sokak": op.location.sokak ?? "",
    "Pafta": op.location.pafta ?? "",
    "Alan (m²)": toM2(op.location.alan, op.location.alanBirimi),
    "Uzunluk (m)": op.location.lineLength ?? "",
    "Ekip Sayısı": op.assignedTeam.length,
    "Ekipman Sayısı": op.assignedEquipment.length,
    "Başlangıç": op.startDate ?? "",
    "Bitiş": op.endDate ?? "",
    "Tamamlanma %": op.completionPercent ?? 0,
    "Oluşturma Tarihi": op.createdAt?.slice(0, 10) ?? "",
  }));
  const ws1 = XLSX.utils.json_to_sheet(opRows);
  XLSX.utils.book_append_sheet(wb, ws1, "Operasyonlar");

  // Sheet 2: Uçuş / Tarama Kayıtları
  const logRows = flightLogs.map((fl) => ({
    "Tarih": fl.date ?? "",
    "Başlangıç Saati": fl.startTime ?? "",
    "Bitiş Saati": fl.endTime ?? "",
    "Süre (dk)": fl.duration ?? "",
    "Pilot": fl.pilotName ?? "",
    "Ekipman": fl.equipmentName ?? "",
    "Yükseklik (m)": fl.altitude ?? "",
    "GSD": fl.gsd ?? "",
    "Fotoğraf Sayısı": fl.photoCount ?? "",
    "Tarama Sayısı": fl.scanCount ?? "",
    "Batarya Kullanımı": fl.batteryUsed ?? "",
    "Toplam Uçuş Süresi (dk)": fl.totalFlightTime ?? "",
    "İniş Sayısı": fl.landingCount ?? "",
    "Hava Durumu": fl.weather ?? "",
    "Notlar": fl.notes ?? "",
  }));
  const ws2 = XLSX.utils.json_to_sheet(logRows);
  XLSX.utils.book_append_sheet(wb, ws2, "Uçuş Kayıtları");

  // Sheet 3: Özet
  const groups: Record<OperationStatusGroup, number> = { yapilacak: 0, yapiliyor: 0, yapildi: 0 };
  for (const op of operations) groups[getStatusGroup(op.status)]++;

  const totalAreaM2 = operations.reduce((sum, op) => sum + (toM2(op.location.alan, op.location.alanBirimi) || 0), 0);
  const totalLineM = operations.reduce((sum, op) => sum + (op.location.lineLength ?? 0), 0);
  const totalFlightMinutes = flightLogs.reduce((sum, fl) => sum + (fl.duration ?? 0), 0);

  const pointOps = operations.filter((op) => op.location.lat && !op.location.polygonCoordinates && !op.location.lineCoordinates).length;
  const polygonOps = operations.filter((op) => (op.location.polygonCoordinates?.length ?? 0) >= 3).length;
  const lineOps = operations.filter((op) => (op.location.lineCoordinates?.length ?? 0) >= 2).length;

  const summaryRows = [
    { "Metrik": "Dönem", "Değer": periodLabel },
    { "Metrik": "Toplam Operasyon", "Değer": operations.length },
    { "Metrik": "Yapılacak", "Değer": groups.yapilacak },
    { "Metrik": "Yapılıyor", "Değer": groups.yapiliyor },
    { "Metrik": "Yapıldı", "Değer": groups.yapildi },
    { "Metrik": "Toplam Alan (m²)", "Değer": Math.round(totalAreaM2) },
    { "Metrik": "Toplam Alan (km²)", "Değer": (totalAreaM2 / 1_000_000).toFixed(3) },
    { "Metrik": "Toplam Alan (hektar)", "Değer": (totalAreaM2 / 10_000).toFixed(1) },
    { "Metrik": "Toplam Mesafe (m)", "Değer": Math.round(totalLineM) },
    { "Metrik": "Toplam Mesafe (km)", "Değer": (totalLineM / 1000).toFixed(2) },
    { "Metrik": "Nokta Operasyonlar", "Değer": pointOps },
    { "Metrik": "Alan (Poligon) Operasyonlar", "Değer": polygonOps },
    { "Metrik": "Çizgi Operasyonlar", "Değer": lineOps },
    { "Metrik": "Toplam Uçuş Kaydı", "Değer": flightLogs.length },
    { "Metrik": "Toplam Uçuş Süresi (dk)", "Değer": totalFlightMinutes },
    { "Metrik": "Toplam Uçuş Süresi (saat)", "Değer": (totalFlightMinutes / 60).toFixed(1) },
  ];
  const ws3 = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, ws3, "Özet");

  const safePeriod = periodLabel.replace(/[^a-zA-Z0-9_\-ığüşöçİĞÜŞÖÇ ]/g, "").replace(/\s+/g, "-").toLowerCase();
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `iha-rapor-${safePeriod}-${today}.xlsx`);
}

/** Alan değerini m²'ye çevir */
function toM2(value: number | undefined, unit: "m2" | "km2" | "hektar" | undefined): number {
  if (value == null) return 0;
  if (unit === "km2") return value * 1_000_000;
  if (unit === "hektar") return value * 10_000;
  return value; // m² default
}
