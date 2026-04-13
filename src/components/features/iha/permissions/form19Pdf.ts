/**
 * Form-19 PDF oluşturucu
 * SHGM İHA-Uçuş İzni Talep Formu (SHGM.HSD.86170537.FR.19)
 * jspdf ile birebir resmi form formatında PDF oluşturur
 */
import { decimalToDms } from "@/lib/coordinates";
import { metersToNm } from "@/lib/coordinates";
import { IHA_CLASS_LABELS } from "@/types/iha";
import type { FlightPermission, TeamMember, Equipment } from "@/types/iha";

// jspdf dynamic import — SSR'da çalışmaz, sadece client'ta yüklenir
type JsPDF = import("jspdf").jsPDF;

interface Form19PdfOptions {
  permission: FlightPermission;
  pilot?: TeamMember;
  drone?: Equipment;
}

const DOC_NO = "SHGM.HSD.86170537.FR.19";
const REV = "02– 05/09/2019";
const EFFECTIVE = "20/05/2016";

export async function generateForm19Pdf({ permission, pilot, drone }: Form19PdfOptions): Promise<JsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const p = permission;
  const W = 210;
  const M = 15; // margin
  const CW = W - 2 * M; // content width

  // ─── SAYFA 1 ───
  drawPage1(doc, p, pilot, drone, M, CW);

  // ─── SAYFA 2 ───
  doc.addPage();
  drawPage2(doc, p, pilot, M, CW);

  return doc;
}

/** Form-19 PDF'i indir */
export async function downloadForm19Pdf(opts: Form19PdfOptions) {
  const doc = await generateForm19Pdf(opts);
  const name = opts.permission.hsdNumber || "Form-19";
  doc.save(`${name}.pdf`);
}

// ─────────────────────────────────────────────────
// SAYFA 1
// ─────────────────────────────────────────────────
function drawPage1(doc: JsPDF, p: FlightPermission, pilot: TeamMember | undefined, drone: Equipment | undefined, M: number, CW: number) {
  let y = M;

  // Başlık
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("İHA-UÇUŞ İZNİ TALEP FORMU", M + CW / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  // ─── Başvuru Sahibi Tablosu ───
  const rows1 = [
    ["Başvuru Sahibi", p.applicantOrg ?? ""],
    ["", p.applicantDepartment ?? ""],
    ["Adresi", p.applicantAddress ?? ""],
    ["Telefon/E-posta", `Tel: ${p.applicantPhone ?? ""}\nE-posta: ${p.applicantEmail ?? ""}`],
    ["Uçuş Amacı", p.flightPurpose === "ticari" ? "☑ Ticari  ☐ Ar-Ge" : p.flightPurpose === "arge" ? "☐ Ticari  ☑ Ar-Ge" : "☐ Ticari  ☐ Ar-Ge"],
    ["Sigorta Poliçe No", p.insurancePolicyNo ?? ""],
  ];
  y = drawTable(doc, rows1, M, y, CW, 50);

  y += 2;

  // ─── İHA + Pilot Tablosu ───
  const ihaClassLabel = p.ihaClass ? (IHA_CLASS_LABELS[p.ihaClass] ?? p.ihaClass) : "";
  const rows2 = [
    ["İHA Kayıt No / Tescil İşareti", p.ihaRegistrationNo ?? ""],
    ["Pilot Lisans No / İHA Pilot Kayıt No", p.pilotLicenseNo ?? ""],
    ["İHA Tipi", ihaClassLabel],
  ];
  y = drawTable(doc, rows2, M, y, CW, 50);

  y += 2;

  // ─── Uçuş Bilgileri ───
  const rows3 = [
    ["Uçuş Tarihleri", `Başlangıç: ${p.startDate}  Bitiş: ${p.endDate}`],
    ["Uçuş Saati (UTC)", `Başlangıç: ${p.startTimeUtc ?? ""}  Bitiş: ${p.endTimeUtc ?? ""}`],
    ["Uçuş İrtifası (Feet/MSL)", `${p.altitudeFeet ?? ""}/${p.altitudeMeters ?? ""} feet/metre`],
  ];
  y = drawTable(doc, rows3, M, y, CW, 50);

  y += 2;

  // ─── Bölge Bilgileri ───
  const centerCoord = getMainCoordinate(p);
  const latDms = centerCoord ? decimalToDms(centerCoord.lat, true) : null;
  const lngDms = centerCoord ? decimalToDms(centerCoord.lng, false) : null;

  const zoneLabel = p.zoneType === "circle" ? "☑ Daire  ☐ Rota  ☐ Çokgen"
    : p.zoneType === "route" ? "☐ Daire  ☑ Rota  ☐ Çokgen"
    : "☐ Daire  ☐ Rota  ☑ Çokgen";

  const radiusNm = p.circleRadius ? metersToNm(p.circleRadius) : "";

  const rows4 = [
    ["Uçuş Yapılacak Bölge", `İl: ${p.regionCity ?? ""}\nİlçe: ${p.regionDistrict ?? ""}\nBölge: ${p.regionArea ?? ""}`],
    ["Koordinat (Enlem)", latDms ? `${latDms.degrees}° ${latDms.minutes}' ${latDms.seconds}"${latDms.direction}` : ""],
    ["Koordinat (Boylam)", lngDms ? `${lngDms.degrees}° ${lngDms.minutes}' ${lngDms.seconds}"${lngDms.direction}` : ""],
    ["Bölge Tipi", zoneLabel],
    ["Yarıçap (NM)", `${radiusNm}`],
  ];
  y = drawTable(doc, rows4, M, y, CW, 50);

  y += 2;

  // ─── Kalkış / İniş ───
  const takeoff = p.takeoffPoints?.[0];
  const landing = p.landingPoints?.[0];
  const takeoffText = takeoff ? `${takeoff.address}\n${formatCoord(takeoff.coordinate.lat, takeoff.coordinate.lng)}` : "";
  const landingText = landing ? `${landing.address}\n${formatCoord(landing.coordinate.lat, landing.coordinate.lng)}` : "";

  const rows5 = [
    ["İHA Kalkış Adresi", takeoffText],
    ["İHA İniş Adresi", landingText],
  ];
  y = drawTable(doc, rows5, M, y, CW, 50);

  // Footer
  drawFooter(doc, M, CW);
}

// ─────────────────────────────────────────────────
// SAYFA 2
// ─────────────────────────────────────────────────
function drawPage2(doc: JsPDF, p: FlightPermission, pilot: TeamMember | undefined, M: number, CW: number) {
  let y = M;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("İHA-UÇUŞ İZNİ TALEP FORMU", M + CW / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Açıklamalar", M, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const descLines = doc.splitTextToSize(p.description ?? "", CW);
  doc.text(descLines, M, y);
  y += descLines.length * 4 + 6;

  doc.text("Arz/rica ederim.", M, y);
  y += 10;

  // İmza tablosu
  const pilotName = pilot?.name ?? "";
  const pilotTitle = p.applicantPersonTitle ?? pilot?.profession ?? "";

  const rows = [
    ["Adı Soyadı", pilotName],
    ["Unvanı", pilotTitle],
    ["Tarih", p.applicationDate ?? ""],
    ["İmza", ""],
  ];

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("İşletme Temsilcisi / Pilot", M, y);
  y += 5;

  y = drawTable(doc, rows, M, y, CW / 2, 40);

  drawFooter(doc, M, CW);
}

// ─────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────

function drawTable(doc: JsPDF, rows: string[][], x: number, startY: number, width: number, labelW: number): number {
  let y = startY;
  const rowH = 7;

  doc.setFontSize(7);
  for (const [label, value] of rows) {
    const lines = doc.splitTextToSize(value, width - labelW - 4);
    const h = Math.max(rowH, lines.length * 3.5 + 3);

    doc.setDrawColor(180);
    doc.rect(x, y, labelW, h);
    doc.rect(x + labelW, y, width - labelW, h);

    doc.setFont("helvetica", "bold");
    doc.text(label, x + 2, y + 3.5);
    doc.setFont("helvetica", "normal");
    doc.text(lines, x + labelW + 2, y + 3.5);

    y += h;
  }
  return y;
}

function drawFooter(doc: JsPDF, M: number, CW: number) {
  const y = 282;
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setDrawColor(180);
  doc.line(M, y, M + CW, y);
  doc.text(`Doküman No: ${DOC_NO}`, M, y + 3);
  doc.text(`Yürürlük Tarihi: ${EFFECTIVE}`, M + 60, y + 3);
  doc.text(`Revizyon No - Tarihi: ${REV}`, M + 120, y + 3);

  const pageNum = doc.getNumberOfPages();
  const current = (doc as unknown as { internal: { getCurrentPageInfo: () => { pageNumber: number } } }).internal.getCurrentPageInfo().pageNumber;
  doc.text(`${current}/${pageNum}`, M + CW - 5, y + 3, { align: "right" });
}

function getMainCoordinate(p: FlightPermission) {
  if (p.circleCenter) return p.circleCenter;
  if (p.polygonCoordinates.length > 0) return p.polygonCoordinates[0];
  if (p.routeCoordinates && p.routeCoordinates.length > 0) return p.routeCoordinates[0];
  if (p.takeoffPoints?.[0]) return p.takeoffPoints[0].coordinate;
  return null;
}

function formatCoord(lat: number, lng: number): string {
  const latD = decimalToDms(lat, true);
  const lngD = decimalToDms(lng, false);
  return `${latD.degrees}°${latD.minutes}'${latD.seconds}"${latD.direction} / ${lngD.degrees}°${lngD.minutes}'${lngD.seconds}"${lngD.direction}`;
}
