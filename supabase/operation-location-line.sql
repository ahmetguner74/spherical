-- v0.8.78 — Operasyon konumuna çizgi (polyline) desteği
--
-- Neden:
--   Kullanıcı bir operasyonu nokta, alan (poligon) VEYA çizgi olarak
--   tanımlayabiliyor artık. Çoklu çizgi bazlı işler (yol kenarı tarama,
--   kanal hattı, yağmur suyu hattı vb.) için polyline desteği eklendi.
--
-- line_coordinates: [{"lat":..., "lng":...}, ...] — çoklu segment polyline
-- line_length: toplam uzunluk (metre)
--
-- Çalıştırma: Supabase Dashboard → SQL Editor → yapıştır → RUN
-- Geri alma: ALTER TABLE iha_operations DROP COLUMN line_coordinates, DROP COLUMN line_length;

ALTER TABLE iha_operations
  ADD COLUMN IF NOT EXISTS line_coordinates jsonb,
  ADD COLUMN IF NOT EXISTS line_length double precision;

CREATE INDEX IF NOT EXISTS idx_operations_line_coordinates
  ON iha_operations USING GIN (line_coordinates);
