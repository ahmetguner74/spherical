/**
 * Form-19 PDF oluşturucu (HTML print yaklaşımı)
 * SHGM İHA-Uçuş İzni Talep Formu (SHGM.HSD.86170537.FR.19)
 *
 * Yeni pencerede HTML form oluşturup tarayıcının yazdır (PDF'e kaydet) özelliği kullanılır.
 * Bu yöntemle Türkçe karakterler sorunsuz çalışır.
 */
import { decimalToDms } from "@/lib/coordinates";
import { metersToNm } from "@/lib/coordinates";
import { IHA_CLASS_LABELS } from "@/types/iha";
import type { FlightPermission, TeamMember, Equipment, IhaClass } from "@/types/iha";

interface Form19PdfOptions {
  permission: FlightPermission;
  pilot?: TeamMember;
  drone?: Equipment;
}

const DOC_NO = "SHGM.HSD.86170537.FR.19";
const REV = "02– 05/09/2019";
const EFFECTIVE = "20/05/2016";

/** Form-19 PDF'i yeni pencerede aç + yazdır */
export function downloadForm19Pdf({ permission, pilot }: Form19PdfOptions) {
  const html = buildForm19Html(permission, pilot);
  const w = window.open("", "_blank", "width=800,height=1100");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.onload = () => setTimeout(() => w.print(), 300);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmtCoord(lat: number, lng: number): string {
  const la = decimalToDms(lat, true);
  const lo = decimalToDms(lng, false);
  return `${la.degrees}°${la.minutes}'${la.seconds}"${la.direction} / ${lo.degrees}°${lo.minutes}'${lo.seconds}"${lo.direction}`;
}

function checkbox(checked: boolean): string {
  return checked ? "☑" : "☐";
}

function buildForm19Html(p: FlightPermission, pilot?: TeamMember): string {
  const latDms = getMainCoordinate(p) ? decimalToDms(getMainCoordinate(p)!.lat, true) : null;
  const lngDms = getMainCoordinate(p) ? decimalToDms(getMainCoordinate(p)!.lng, false) : null;
  const radiusNm = p.circleRadius ? metersToNm(p.circleRadius) : "";
  const routeWidthNm = p.routeWidth ? metersToNm(p.routeWidth) : "";
  const takeoff = p.takeoffPoints?.[0];
  const landing = p.landingPoints?.[0];
  const ihaClassLabel = p.ihaClass ? (IHA_CLASS_LABELS[p.ihaClass as IhaClass] ?? "") : "";

  const pilotName = pilot?.name ?? "";
  const pilotTitle = p.applicantPersonTitle ?? pilot?.profession ?? "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>Form-19 — ${esc(p.hsdNumber || "İHA Uçuş İzni")}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Times New Roman", serif; font-size: 9pt; color: #000; }
  .page { width: 180mm; margin: 0 auto; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h1 { text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 6mm; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; }
  td, th { border: 0.5pt solid #333; padding: 2mm 3mm; vertical-align: top; font-size: 8pt; }
  .label { width: 38%; font-weight: bold; background: #f8f8f8; }
  .value { width: 62%; }
  .half { width: 50%; }
  .no-border td { border: none; }
  .checkbox-row td { font-size: 8pt; }
  .footer { position: fixed; bottom: 5mm; left: 15mm; right: 15mm; border-top: 0.5pt solid #999; padding-top: 1mm; font-size: 6pt; color: #666; display: flex; justify-content: space-between; }
  .coord-table td { font-size: 7.5pt; text-align: center; }
  .coord-table .header { font-weight: bold; background: #f0f0f0; }
  .notes-box { border: 0.5pt solid #333; padding: 3mm; margin-top: 4mm; font-size: 7pt; line-height: 1.4; }
  .notes-box h3 { font-size: 7.5pt; margin-bottom: 2mm; }
  .sig-table { width: 60%; }
  .sig-table td { height: 7mm; }
  .desc-text { line-height: 1.6; margin-bottom: 4mm; font-size: 9pt; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
  .print-btn { position: fixed; top: 10px; right: 10px; padding: 12px 24px; background: #16a34a; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; z-index: 100; font-family: system-ui; }
  .print-btn:hover { background: #15803d; }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">📄 PDF Olarak Kaydet</button>

<!-- ═══════ SAYFA 1 ═══════ -->
<div class="page">
<h1>İHA-UÇUŞ İZNİ TALEP FORMU</h1>

<table>
  <tr>
    <td class="label" rowspan="2">Başvuru Sahibi</td>
    <td class="value">${esc(p.applicantOrg ?? "")}</td>
    <td class="label">Uçuş Amacı</td>
    <td class="value">${checkbox(p.flightPurpose === "ticari")} Ticari<br>${checkbox(p.flightPurpose === "arge")} Ar-Ge</td>
  </tr>
  <tr>
    <td class="value">${esc(p.applicantDepartment ?? "")}</td>
    <td class="label">Sigorta Poliçe Numarası<br><span style="font-weight:normal;font-size:6.5pt">(Ticari ve Ar-Ge Amaçlı Uçuşlar İçin)</span></td>
    <td class="value">${esc(p.insurancePolicyNo ?? "")}</td>
  </tr>
  <tr>
    <td class="label">Adresi</td>
    <td class="value">${esc(p.applicantAddress ?? "")}</td>
    <td class="label" rowspan="2">Telefon/E-posta</td>
    <td class="value" rowspan="2">Tel: ${esc(p.applicantPhone ?? "")}<br>E-posta:<br>${esc(p.applicantEmail ?? "")}</td>
  </tr>
  <tr>
    <td class="label" colspan="2" style="border:none"></td>
  </tr>
</table>

<table>
  <tr>
    <td class="label">İHA Kayıt No<br>(İHA0-İHA1 Sınıfı İçin)/<br>Tescil İşareti<br>(İHA2-İHA3 Sınıfı İçin)</td>
    <td class="value">${esc(p.ihaRegistrationNo ?? "")}</td>
    <td class="label">İHA Tipi</td>
    <td class="value" style="font-size:7pt">
      ${checkbox(p.ihaClass === "0-499gr")} 0-499gr. arasında<br>
      ${checkbox(p.ihaClass === "iha0")} İHA0 [500gr(dahil)-4kg]<br>
      ${checkbox(p.ihaClass === "iha1")} İHA1 [4kg(dahil)-25kg]<br>
      ${checkbox(p.ihaClass === "iha2")} İHA2 [25(dahil)-150kg]<br>
      ${checkbox(p.ihaClass === "iha3")} İHA3 [150kg(dahil)'den büyük
    </td>
  </tr>
  <tr>
    <td class="label">Pilot Lisans Numarası/<br>İHA Pilot Kayıt No</td>
    <td class="value">${esc(p.pilotLicenseNo ?? "")}</td>
    <td class="label">Uçuş İrtifası (Feet/MSL)</td>
    <td class="value">${p.altitudeFeet ?? ""}/${p.altitudeMeters ?? ""} feet/metre</td>
  </tr>
</table>

<table>
  <tr>
    <td class="label">Uçuş Tarihleri</td>
    <td class="half">Başlangıç : ${esc(p.startDate ?? "")}</td>
    <td class="label">Uçuş Saati (UTC)</td>
    <td class="half">Başlangıç: ${esc(p.startTimeUtc ?? "")}</td>
  </tr>
  <tr>
    <td class="label"></td>
    <td>Bitiş : ${esc(p.endDate ?? "")}</td>
    <td class="label"></td>
    <td>Bitiş : ${esc(p.endTimeUtc ?? "")}</td>
  </tr>
</table>

<!-- Koordinat tablosu -->
<table class="coord-table">
  <tr>
    <td colspan="4" style="text-align:left;font-weight:bold">Uçuş Yapılacak Bölgenin Koordinatları</td>
    <td colspan="2" rowspan="5" style="text-align:left;vertical-align:top;font-size:8pt">
      <b>Uçuş Yapılacak Bölge</b><br>
      İl &nbsp;&nbsp;&nbsp;: ${esc(p.regionCity ?? "")}<br>
      İlçe : ${esc(p.regionDistrict ?? "")}<br>
      Bölge: ${esc(p.regionArea ?? "")}
    </td>
  </tr>
  <tr>
    <td class="header" colspan="2">Enlem</td>
    <td class="header" colspan="2">Boylam</td>
  </tr>
  <tr>
    <td class="header">Derece&nbsp;&nbsp;Dakika&nbsp;&nbsp;Saniye</td>
    <td class="header">KUZEY</td>
    <td class="header">Derece&nbsp;&nbsp;Dakika&nbsp;&nbsp;Saniye</td>
    <td class="header">DOĞU</td>
  </tr>
  <tr>
    <td>${latDms ? `${latDms.degrees}&nbsp;&nbsp;&nbsp;${latDms.minutes}&nbsp;&nbsp;&nbsp;${latDms.seconds}` : ""}</td>
    <td>${latDms ? latDms.direction : ""}</td>
    <td>${lngDms ? `${lngDms.degrees}&nbsp;&nbsp;&nbsp;${lngDms.minutes}&nbsp;&nbsp;&nbsp;${lngDms.seconds}` : ""}</td>
    <td>${lngDms ? lngDms.direction : ""}</td>
  </tr>
</table>

<table>
  <tr>
    <td class="label">Uçuş Yapılacak Bölgeye İlişkin<br>Koordinatların Tanımlanması</td>
    <td>${checkbox(p.zoneType === "circle")} Daire&nbsp;&nbsp;&nbsp;&nbsp;${checkbox(p.zoneType === "route")} Rota&nbsp;&nbsp;&nbsp;&nbsp;${checkbox(p.zoneType === "polygon")} Çokgen</td>
    <td class="label">Yarıçap(NM):</td>
    <td>${radiusNm} NM</td>
    <td class="label">Rotanın Sağı-Solu(NM):</td>
    <td>${routeWidthNm}</td>
  </tr>
</table>

<table>
  <tr>
    <td class="label">İHA Kalkış Adresi<br>(Açık Adres ve Koordinat)</td>
    <td class="value">${takeoff ? `${esc(takeoff.address)}<br>${fmtCoord(takeoff.coordinate.lat, takeoff.coordinate.lng)}` : ""}</td>
    <td class="label">İHA İniş Adresi<br>(Açık Adres ve Koordinat)</td>
    <td class="value">${landing ? `${esc(landing.address)}<br>${fmtCoord(landing.coordinate.lat, landing.coordinate.lng)}` : ""}</td>
  </tr>
</table>

${renderNotesBox()}
${renderFooter(1)}
</div>

<!-- ═══════ SAYFA 2 ═══════ -->
<div class="page">
<h1>İHA-UÇUŞ İZNİ TALEP FORMU</h1>

<table class="no-border">
  <tr><td style="font-weight:bold;font-size:10pt;padding-bottom:3mm">Açıklamalar</td></tr>
  <tr><td class="desc-text">${esc(p.description ?? "").replace(/\n/g, "<br>")}</td></tr>
  <tr><td style="padding-top:3mm">Arz/rica ederim.</td></tr>
</table>

<br><br>

<table class="sig-table" style="margin-top:6mm">
  <tr><td colspan="2" style="border:none;font-weight:bold;font-size:8pt;padding-bottom:2mm">İşletme Temsilcisi / Pilot</td></tr>
  <tr><td class="label">Adı Soyadı</td><td class="value">${esc(pilotName)}</td></tr>
  <tr><td class="label">Unvanı</td><td class="value">${esc(pilotTitle)}</td></tr>
  <tr><td class="label">Tarih</td><td class="value">${esc(p.applicationDate ?? "")}</td></tr>
  <tr><td class="label">İmza</td><td class="value" style="height:15mm"></td></tr>
</table>

${renderNotesBox()}
${renderFooter(2)}
</div>

</body></html>`;
}

function renderNotesBox(): string {
  return `<div class="notes-box">
<h3>DİKKATE ALINACAK HUSUSLAR</h3>
Uçuş izni müracaatları SHT-İHA Talimatında yer alan başvuru süreleri içerisinde yapılmalıdır.<br>
Yukarıdaki İHA Uçuş İzni Talep formu eksiksiz ve okunaklı doldurularak imza atmaya yetkili personel tarafından imzalanarak gönderilecektir.<br>
Ticari veya Ar-Ge amaçlı uçuşlarda 3.şahıs mali mesuliyet sigorta poliçesi ve pilot bilgilerinin suretleri eklenmelidir.<br>
Genel Müdürlüğe yapılan başvuruların eş zamanlı olarak "iha.shgm.gov.tr" web adresindeki koordinasyon noktalarına da gönderilmesi gerekmektedir.
</div>`;
}

function renderFooter(page: number): string {
  return `<div class="footer">
<span>Doküman No: ${DOC_NO}</span>
<span>Yürürlük Tarihi: ${EFFECTIVE}</span>
<span>Revizyon No - Tarihi: ${REV}</span>
<span>${page}/2</span>
</div>`;
}

function getMainCoordinate(p: FlightPermission) {
  if (p.circleCenter) return p.circleCenter;
  if (p.polygonCoordinates.length > 0) return p.polygonCoordinates[0];
  if (p.routeCoordinates && p.routeCoordinates.length > 0) return p.routeCoordinates[0];
  if (p.takeoffPoints?.[0]) return p.takeoffPoints[0].coordinate;
  return null;
}
