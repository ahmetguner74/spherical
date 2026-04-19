/**
 * Türkçe metin yardımcıları.
 *
 * `toLocaleLowerCase("tr")` / `toLocaleUpperCase("tr")` Türkçe'nin I/İ/i/ı
 * eşlenmesini doğru yapar — bu dosya o locale'i sarmalayan küçük yardımcılar içerir.
 */

/**
 * Türkçe title case.
 * Her kelimenin ilk harfini TR locale ile büyüt, geri kalanını küçült.
 *
 *   titleCaseTr("NİLÜFER")          → "Nilüfer"
 *   titleCaseTr("MUSTAFAKEMALPAŞA") → "Mustafakemalpaşa"
 *   titleCaseTr("İNEGÖL")           → "İnegöl"
 */
export function titleCaseTr(s: string): string {
  const normalized = s.trim();

  if (normalized.length === 0) {
    return "";
  }

  return normalized
    .toLocaleLowerCase("tr")
    .split(/\s+/)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1))
    .join(" ");
}
