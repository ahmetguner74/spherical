/**
 * Form-19 PDF oluşturucu (HTML print yaklaşımı)
 * SHGM İHA-Uçuş İzni Talep Formu (SHGM.HSD.86170537.FR.19)
 * Resmi belgenin birebir kopyası — Word 2016 ile oluşturulan orijinal PDF baz alınarak
 */
import { decimalToDms } from "@/lib/coordinates";
import { metersToNm } from "@/lib/coordinates";
import type { FlightPermission, TeamMember, Equipment, IhaClass } from "@/types/iha";

interface Form19PdfOptions {
  permission: FlightPermission;
  pilot?: TeamMember;
  drone?: Equipment;
}

/** Form-19 PDF'i yeni pencerede aç + yazdır */
export function downloadForm19Pdf({ permission, pilot }: Form19PdfOptions) {
  const html = buildForm19Html(permission, pilot);
  const w = window.open("", "_blank", "width=800,height=1100");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.onload = () => setTimeout(() => w.print(), 400);
}

function e(s: string | undefined | null): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cb(checked: boolean): string {
  return checked ? "☑" : "☐";
}

function buildForm19Html(p: FlightPermission, pilot?: TeamMember): string {
  const lat = getMainCoordinate(p) ? decimalToDms(getMainCoordinate(p)!.lat, true) : null;
  const lng = getMainCoordinate(p) ? decimalToDms(getMainCoordinate(p)!.lng, false) : null;
  const rNm = p.circleRadius ? metersToNm(p.circleRadius) : "";
  const rwNm = p.routeWidth ? metersToNm(p.routeWidth) : "";
  const tk = p.takeoffPoints?.[0];
  const ln = p.landingPoints?.[0];
  const pn = pilot?.name ?? "";
  const pt = p.applicantPersonTitle ?? pilot?.profession ?? "";

  return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
<title>Form-19 — ${e(p.hsdNumber || "İHA Uçuş İzni")}</title>
<style>
@page{size:A4;margin:12mm 15mm 18mm 15mm}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Times New Roman",Times,serif;font-size:8pt;color:#000;line-height:1.3}
.page{width:180mm;margin:0 auto;position:relative;min-height:267mm;page-break-after:always}
.page:last-child{page-break-after:auto}
h1{text-align:center;font-size:12pt;font-weight:bold;margin-bottom:4mm;letter-spacing:0.5px}
table{width:100%;border-collapse:collapse}
td,th{border:0.5pt solid #000;padding:1.5mm 2mm;vertical-align:top;font-size:7.5pt}
.lbl{font-weight:bold;background:#f5f5f5}
.nb{border:none}
.footer-row{position:absolute;bottom:0;left:0;right:0}
.footer-row td{border-top:1pt solid #666;border-left:none;border-right:none;border-bottom:none;font-size:6pt;color:#444;padding:1mm 0}
.hususlar{font-size:6.5pt;line-height:1.35;margin-top:3mm;border:0.5pt solid #000;padding:2mm 3mm}
.hususlar b{font-size:7pt;display:block;margin-bottom:1mm}
.aciklamalar{font-size:6.5pt;line-height:1.35;margin-top:1mm;padding:0 3mm}
.aciklamalar b{font-size:7pt;display:block;margin-bottom:1mm}
.kargo{font-size:7pt;font-weight:bold;text-align:center;margin-top:2mm;margin-bottom:1mm}
.print-btn{position:fixed;top:10px;right:10px;padding:12px 24px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;z-index:100;font-family:system-ui}
.print-btn:hover{background:#15803d}
@media print{.no-print{display:none !important}}
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">PDF Olarak Kaydet</button>

<!-- ══════════════════ SAYFA 1 ══════════════════ -->
<div class="page">
<h1>İHA-UÇUŞ İZNİ TALEP FORMU</h1>

<!-- Bölüm 1: Başvuru Sahibi — 4 kolon -->
<table>
<tr>
  <td class="lbl" style="width:25%">Başvuru Sahibi</td>
  <td class="lbl" style="width:25%">Adresi</td>
  <td class="lbl" style="width:25%">Telefon/E-posta</td>
  <td class="lbl" style="width:25%">Uçuş Amacı</td>
</tr>
<tr>
  <td rowspan="2">${e(p.applicantOrg)}<br>${e(p.applicantDepartment)}</td>
  <td rowspan="2">${e(p.applicantAddress)}</td>
  <td rowspan="2">Tel: ${e(p.applicantPhone)}<br><br>E-posta:<br>${e(p.applicantEmail)}</td>
  <td rowspan="2"><br>${cb(p.flightPurpose === "ticari")} Ticari<br><br>${cb(p.flightPurpose === "arge")} Ar-Ge</td>
</tr>
<tr></tr>
</table>

<!-- Bölüm 2: Sigorta / İHA / Tipi / Pilot — 4 kolon -->
<table>
<tr>
  <td class="lbl" style="width:25%">Sigorta Poliçe<br>Numarası(Ticari ve Ar-Ge<br>Amaçlı Uçuşlar İçin)</td>
  <td class="lbl" style="width:25%">İHA Kayıt No<br>(İHA0-İHA1 Sınıfı İçin)/<br>Tescil İşareti<br>(İHA2-İHA3 Sınıfı İçin)</td>
  <td class="lbl" style="width:25%">İHA Tipi</td>
  <td class="lbl" style="width:25%">Pilot Lisans Numarası/<br>İHA Pilot Kayıt No</td>
</tr>
<tr>
  <td>${e(p.insurancePolicyNo)}</td>
  <td>${e(p.ihaRegistrationNo)}</td>
  <td style="font-size:7pt">
    ${cb(p.ihaClass === "0-499gr")} 0-499gr. arasında<br>
    ${cb(p.ihaClass === "iha0")} İHA0 [500gr(dâhil)-4kg]<br>
    ${cb(p.ihaClass === "iha1")} İHA1 [4kg(dâhil)-25kg]<br>
    ${cb(p.ihaClass === "iha2")} İHA2 [25(dâhil)-150kg]<br>
    ${cb(p.ihaClass === "iha3")} İHA3 [150kg(dâhil)'den<br>büyük
  </td>
  <td>${e(p.pilotLicenseNo)}</td>
</tr>
</table>

<!-- Bölüm 3: Uçuş Tarihleri / Saat / İrtifa / Bölge — 4 kolon -->
<table>
<tr>
  <td class="lbl" style="width:25%">Uçuş Tarihleri</td>
  <td class="lbl" style="width:25%">Uçuş Saati (UTC)</td>
  <td class="lbl" style="width:25%">Uçuş İrtifası (Feet/MSL)</td>
  <td class="lbl" style="width:25%">Uçuş Yapılacak Bölge</td>
</tr>
<tr>
  <td>Başlangıç : ${e(p.startDate)}<br><br>Bitiş&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${e(p.endDate)}</td>
  <td>Başlangıç: ${e(p.startTimeUtc)}<br><br>Bitiş&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${e(p.endTimeUtc)}</td>
  <td><br>${p.altitudeFeet ?? ""}/${p.altitudeMeters ?? ""} feet/metre</td>
  <td>İl&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${e(p.regionCity)}<br>İlçe&nbsp;: ${e(p.regionDistrict)}<br>Bölge: ${e(p.regionArea)}</td>
</tr>
</table>

<!-- Bölüm 4: Koordinatlar — DMS ayrı hücrelerde -->
<table style="margin-top:0">
<tr>
  <td colspan="8" class="lbl" style="text-align:center">Uçuş Yapılacak Bölgenin Koordinatları</td>
</tr>
<tr>
  <td class="lbl" style="text-align:center">Enlem</td>
  <td class="lbl" style="text-align:center">Derece</td>
  <td class="lbl" style="text-align:center">Dakika</td>
  <td class="lbl" style="text-align:center">Saniye</td>
  <td class="lbl" style="text-align:center">Boylam</td>
  <td class="lbl" style="text-align:center">Derece</td>
  <td class="lbl" style="text-align:center">Dakika</td>
  <td class="lbl" style="text-align:center">Saniye</td>
</tr>
<tr style="text-align:center">
  <td><b>KUZEY</b></td>
  <td>${lat ? lat.degrees : ""}</td>
  <td>${lat ? lat.minutes : ""}</td>
  <td>${lat ? lat.seconds.toString().replace(".", ",") : ""}</td>
  <td><b>DOĞU</b></td>
  <td>${lng ? lng.degrees : ""}</td>
  <td>${lng ? lng.minutes : ""}</td>
  <td>${lng ? lng.seconds.toString().replace(".", ",") : ""}</td>
</tr>
</table>

<!-- Bölüm 5: Bölge Tanımı + Kalkış/İniş — 3 kolon -->
<table>
<tr>
  <td class="lbl" style="width:30%">Uçuş Yapılacak Bölgeye İlişkin<br>Koordinatların Tanımlanması</td>
  <td class="lbl" style="width:35%">İHA Kalkış Adresi<br>(Açık Adres ve Koordinat)</td>
  <td class="lbl" style="width:35%">İHA İniş Adresi<br>(Açık Adres ve Koordinat)</td>
</tr>
<tr>
  <td style="height:28mm">
    <br>${cb(p.zoneType === "circle")} Daire&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Yarıçap(NM): ${rNm} NM<br>
    <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rotanın Sağı-Solu(NM): ${rwNm}<br>
    ${cb(p.zoneType === "route")} Rota<br>
    <br>${cb(p.zoneType === "polygon")} Çokgen
  </td>
  <td>${tk ? `${fmtDms(tk.coordinate.lat, tk.coordinate.lng)}<br>${e(tk.address)}` : ""}</td>
  <td>${ln ? `${fmtDms(ln.coordinate.lat, ln.coordinate.lng)}<br>${e(ln.address)}` : ""}</td>
</tr>
</table>

<!-- Bölüm 6: DİKKATE ALINACAK HUSUSLAR + AÇIKLAMALAR -->
${renderHususlarAciklamalar()}

<!-- Footer -->
<table class="footer-row"><tr>
  <td style="width:35%">Doküman No: &nbsp;&nbsp;&nbsp;SHGM.HSD.86170537.FR.19</td>
  <td style="width:25%">Yürürlük Tarihi: &nbsp;&nbsp;20/05/2016</td>
  <td style="width:30%">Revizyon No - Tarihi &nbsp;&nbsp;02– 05/09/2019</td>
  <td style="width:10%;text-align:right">1/2</td>
</tr></table>
</div>

<!-- ══════════════════ SAYFA 2 ══════════════════ -->
<div class="page">
<h1>İHA-UÇUŞ İZNİ TALEP FORMU</h1>

<table style="border:none;margin-bottom:3mm"><tr><td class="nb" style="text-align:center;font-weight:bold;font-size:10pt;padding:4mm 0">Açıklamalar</td></tr></table>

<div style="padding:0 5mm;font-size:9pt;line-height:1.7;min-height:40mm">
${e(p.description).replace(/\n/g, "<br>")}
<br><br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Arz/rica ederim.
</div>

<br>

<!-- İmza tablosu — 4 kolon yan yana -->
<div style="padding:0 5mm">
<table style="border:none;margin-bottom:2mm"><tr><td class="nb" style="text-align:center;font-weight:bold;font-size:9pt">İşletme Temsilcisi / Pilot</td></tr></table>
<table>
<tr>
  <td class="lbl" style="width:25%;text-align:center">Adı Soyadı</td>
  <td class="lbl" style="width:25%;text-align:center">Unvanı</td>
  <td class="lbl" style="width:25%;text-align:center">Tarih</td>
  <td class="lbl" style="width:25%;text-align:center">İmza</td>
</tr>
<tr style="height:12mm;text-align:center;vertical-align:middle">
  <td>${e(pn)}</td>
  <td>${e(pt)}</td>
  <td>${e(p.applicationDate)}</td>
  <td></td>
</tr>
</table>
</div>

<br>

<!-- Aynı HUSUSLAR + AÇIKLAMALAR -->
${renderHususlarAciklamalar()}

<!-- Footer -->
<table class="footer-row"><tr>
  <td style="width:35%">Doküman No: &nbsp;&nbsp;&nbsp;SHGM.HSD.86170537.FR.19</td>
  <td style="width:25%">Yürürlük Tarihi: &nbsp;&nbsp;20/05/2016</td>
  <td style="width:30%">Revizyon No - Tarihi &nbsp;&nbsp;02– 05/09/2019</td>
  <td style="width:10%;text-align:right">2/2</td>
</tr></table>
</div>

</body></html>`;
}

function renderHususlarAciklamalar(): string {
  return `<div class="hususlar">
<b>DİKKATE ALINACAK HUSUSLAR</b>
Uçuş izni müracaatları SHT-İHA Talimatında yer alan başvuru süreleri içerisinde yapılmalıdır. Bahse konu tarihler içerisinde yapılmayan müracaatlar Genel Müdürlüğümüzce değerlendirmeye alınmayacaktır.<br>
Yukarıdaki İHA Uçuş İzni Talep formu aşağıda belirtilen açıklamalar doğrultusunda eksiksiz ve okunaklı doldurularak imza atmaya yetkili personel tarafından imzalanarak gönderilecektir.<br>
Yukarıda belirtilen İHA- Uçuş İzni Talep formu eksik veya hatalı doldurulduğu takdirde Genel Müdürlüğümüzce değerlendirmeye alınmayacaktır. Ticari veya Ar-Ge amaçlı gerçekleştirilecek uçuşlara ait başvurularda forma 3.şahıs mali mesuliyet sigorta poliçesi ve ilgili kategoriye uygun pilot bilgilerinin suretlerinin eklenmesi gerekmektedir. Uçuş yapılacak İHA, İHA2 veya İHA3 sınıfında ise bunlara ilave olarak Genel Müdürlüğümüzden alınan Özel Uçuş İzin Belgesi başvuruya eklenmelidir.<br>
Genel Müdürlüğümüze yapılan başvuruların eş zamanlı olarak "iha.shgm.gov.tr" web adresinde yer alan DHMİ Genel Müdürlüğü uçuş izni koordinasyon noktalarına da gönderilmesi gerekmektedir.
</div>
<div class="aciklamalar">
<b>AÇIKLAMALAR</b>
Uçuş yüksekliği belirtilirken koordinatlı bölgenin dikkate alınması ve bölgedeki diğer askeri ve sivil aktiviteler göz önüne alınarak belirtilecektir.<br>
Uçuşun yapılacağı bölge ismi kesinlikle belirtilecektir (Bölge, İl, İlçe vs isimleri).<br>
Uçuşun yapılacağı koordinatlar enlem ve boylam olarak Saat, Dakika, Saniye cinsinden (WGS-84 formatında) kesinlikle doğru tespit edilecektir. Uçuş için belirlenen saha mutlaka bir alanı tarif etmelidir.(En az 3 nokta koordinatı veya saha daire ise, merkez koordinatı verilecek ve yarıçapı Nautical Mile (NM) olarak belirtilecektir.)<br>
İHA iniş/kalkış adresinin; tanımlı alan olması durumunda ilgili bilgilerinin (havaalanlarında ICAO dörtlü kodu, heliport ismi vb.) tanımsız alan olması durumunda ise koordinatların ilgili kısımlara yazılması gerekmektedir.
</div>
<div class="kargo">Bu form doldurulduktan sonra ekli belgelerle aşağıdaki adrese kargo ile gönderilmelidir.<br>
Sivil Havacılık Genel Müdürlüğü Evrak Birimi GMK Bulvarı No:128 Maltepe ANKARA</div>`;
}

function fmtDms(lat: number, lng: number): string {
  const la = decimalToDms(lat, true);
  const lo = decimalToDms(lng, false);
  return `${la.degrees}°${la.minutes}'${la.seconds}"${la.direction}<br>${lo.degrees}°${lo.minutes}'${lo.seconds}"${lo.direction}`;
}

function getMainCoordinate(p: FlightPermission) {
  if (p.circleCenter) return p.circleCenter;
  if (p.polygonCoordinates.length > 0) return p.polygonCoordinates[0];
  if (p.routeCoordinates && p.routeCoordinates.length > 0) return p.routeCoordinates[0];
  if (p.takeoffPoints?.[0]) return p.takeoffPoints[0].coordinate;
  return null;
}
