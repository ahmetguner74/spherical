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
  return s.replace(/\S+/g, (w) => {
    const lower = w.toLocaleLowerCase("tr");
    return lower.charAt(0).toLocaleUpperCase("tr") + lower.slice(1);
  });
}
