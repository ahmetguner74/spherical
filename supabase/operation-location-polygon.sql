-- v0.8.77 — Operasyon konumuna poligon + sokak + tam adres alanları
--
-- Neden:
--   Konum Seçici modal ile kullanıcı haritadan nokta VEYA poligon
--   seçebiliyor; Nominatim reverse geocoding ile sokak ve tam adres
--   otomatik dolduruluyor. Bu alanları DB'de kalıcı tutmak için.
--
-- Çalıştırma: Supabase Dashboard → SQL Editor → yapıştır → RUN
-- Geri alma: ALTER TABLE iha_operations DROP COLUMN polygon_coordinates, DROP COLUMN sokak, DROP COLUMN display_address;

ALTER TABLE iha_operations
  ADD COLUMN IF NOT EXISTS polygon_coordinates jsonb,
  ADD COLUMN IF NOT EXISTS sokak text,
  ADD COLUMN IF NOT EXISTS display_address text;

-- polygon_coordinates formatı: [{"lat": 40.1885, "lng": 29.0610}, ...]
-- GIN index (poligon içinde arama gerekirse ileride):
CREATE INDEX IF NOT EXISTS idx_operations_polygon_coordinates
  ON iha_operations USING GIN (polygon_coordinates);
