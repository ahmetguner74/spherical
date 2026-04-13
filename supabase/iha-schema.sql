-- ============================================
-- CBS İHA Birimi — Supabase Veritabanı Şeması v2
-- ============================================
-- Bu SQL'i Supabase SQL Editor'de çalıştırın.
-- Mevcut works tablolarına DOKUNULMAZ.
-- Tüm İHA tabloları "iha_" prefix'i ile başlar.
--
-- GELİŞTİRİLEBİLİRLİK:
-- - Her tabloda metadata JSONB alanı → gelecekte yeni alan eklemeye gerek kalmadan genişler
-- - Geometri desteği: poligon, daire, çizgi → JSONB formatında
-- - Dosya ekleri: ayrı tablo (iha_attachments) → herhangi kayda dosya bağlanabilir
-- - Supabase Storage: iha-files bucket'ı → PDF, fotoğraf, belge yükleme

-- ============================================
-- 0. Supabase Storage Bucket (dosya yükleme için)
-- ============================================
-- NOT: Bu komutu SQL Editor'de çalıştıramazsınız.
-- Supabase Dashboard → Storage → New Bucket → "iha-files" (public) oluşturun.

-- ============================================
-- 1. Dosya Ekleri (tüm tablolar için ortak)
-- ============================================
-- Herhangi bir tablodaki kayda dosya bağlamak için kullanılır.
-- Örnek: HSD belgesi PDF'i, operasyon fotoğrafı, bakım raporu

CREATE TABLE IF NOT EXISTS iha_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_table TEXT NOT NULL,                    -- 'operations', 'flight_permissions', 'equipment' vs.
  parent_id UUID NOT NULL,                       -- Bağlı olduğu kaydın ID'si
  file_name TEXT NOT NULL,                       -- Orijinal dosya adı
  file_url TEXT NOT NULL,                        -- Supabase Storage URL'i
  file_type TEXT,                                -- 'pdf', 'jpg', 'png', 'doc' vs.
  file_size INTEGER,                             -- Byte cinsinden boyut
  description TEXT,                              -- Açıklama (ör: "HSD Belgesi", "Saha Fotoğrafı")
  metadata JSONB DEFAULT '{}',                   -- Ek bilgiler (sayfa sayısı, çözünürlük vs.)
  uploaded_by TEXT DEFAULT 'kullanici',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_attachments_all" ON iha_attachments FOR ALL USING (true) WITH CHECK (true);

-- Index: parent_table + parent_id ile hızlı sorgulama
CREATE INDEX IF NOT EXISTS idx_attachments_parent ON iha_attachments(parent_table, parent_id);

-- ============================================
-- 2. Operasyonlar
-- ============================================
CREATE TABLE IF NOT EXISTS iha_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'iha',
  sub_types TEXT[] DEFAULT '{}',
  requester TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'talep',
  priority TEXT NOT NULL DEFAULT 'normal',       -- ⚠ KULLANILMIYOR — gelecekte kaldırılabilir

  -- Konum
  location_il TEXT DEFAULT '',
  location_ilce TEXT DEFAULT '',
  location_mahalle TEXT,
  location_pafta TEXT,
  location_ada TEXT,
  location_parsel TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_alan DOUBLE PRECISION,
  location_alan_birimi TEXT DEFAULT 'm2',

  -- Geometri (eski — polygon_coordinates/line_coordinates kullanılıyor, bunlar ölü)
  geometry_type TEXT,                            -- ⚠ KULLANILMIYOR — polygon_coordinates ile değiştirildi
  geometry_data JSONB,                           -- ⚠ KULLANILMIYOR — polygon_coordinates ile değiştirildi

  -- Atamalar
  assigned_team TEXT[] DEFAULT '{}',
  assigned_equipment TEXT[] DEFAULT '{}',
  permission_id TEXT,

  -- Veri
  data_storage_path TEXT,
  data_size DOUBLE PRECISION,
  output_description TEXT,
  completion_percent INTEGER DEFAULT 0,

  -- Tarihler
  start_date TEXT,
  end_date TEXT,
  notes TEXT,
  created_by TEXT,

  -- Genişletilebilirlik
  metadata JSONB DEFAULT '{}',                   -- Gelecekte yeni alanlar buraya

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_operations_all" ON iha_operations FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 3. Çıktılar / Teslimatlar
-- ============================================
CREATE TABLE IF NOT EXISTS iha_deliverables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES iha_operations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  delivery_method TEXT NOT NULL DEFAULT 'sunucu',
  delivered_to TEXT,
  delivered_at TEXT,
  file_path TEXT,
  file_size DOUBLE PRECISION,                    -- GB cinsinden
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_deliverables_all" ON iha_deliverables FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 4. Uçuş İzinleri (SHGM / HSD)
-- ============================================
CREATE TABLE IF NOT EXISTS iha_flight_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'taslak',
  hsd_number TEXT,                               -- Onay sonrası SHGM HSD belge numarası

  -- Başvuru Sahibi
  applicant_org TEXT,                            -- Kurum adı
  applicant_department TEXT,                     -- Birim/Şube
  applicant_address TEXT,                        -- Adres
  applicant_phone TEXT,                          -- Telefon
  applicant_email TEXT,                          -- E-posta

  -- Sigorta
  insurance_policy_no TEXT,                      -- Sigorta poliçe numarası

  -- İHA Bilgileri
  equipment_id UUID REFERENCES iha_equipment(id) ON DELETE SET NULL,
  iha_registration_no TEXT,                      -- İHA Kayıt No / Tescil İşareti (TR-IHA1-000560)
  iha_class TEXT,                                -- 0-499gr, iha0, iha1, iha2, iha3

  -- Pilot Bilgileri
  pilot_id UUID REFERENCES iha_team(id) ON DELETE SET NULL,
  pilot_license_no TEXT,                         -- Pilot lisans numarası

  -- Uçuş Bilgileri
  flight_purpose TEXT,                           -- ticari, arge
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  start_time_utc TEXT,                           -- HH:mm formatında
  end_time_utc TEXT,                             -- HH:mm formatında
  altitude_feet INTEGER,                         -- feet MSL
  altitude_meters INTEGER,                       -- metre MSL

  -- Bölge Bilgileri
  region_city TEXT,                              -- İl
  region_district TEXT,                          -- İlçe
  region_area TEXT,                              -- Bölge adı
  zone_type TEXT DEFAULT 'polygon',              -- polygon, circle, route
  polygon_coordinates JSONB DEFAULT '[]',        -- [{lat, lng}, ...] poligon köşeleri
  circle_center JSONB,                           -- {lat, lng} daire merkezi
  circle_radius DOUBLE PRECISION,                -- metre cinsinden yarıçap
  route_coordinates JSONB DEFAULT '[]',          -- [{lat, lng}, ...] rota noktaları
  route_width DOUBLE PRECISION,                  -- metre cinsinden rota genişliği

  -- Kalkış / İniş (birden fazla olabilir)
  takeoff_points JSONB DEFAULT '[]',             -- [{address, coordinate: {lat, lng}}]
  landing_points JSONB DEFAULT '[]',             -- [{address, coordinate: {lat, lng}}]

  -- Açıklamalar (Sayfa 2)
  description TEXT,                              -- Açıklama metni
  applicant_person_id UUID REFERENCES iha_team(id) ON DELETE SET NULL,
  applicant_person_title TEXT,                   -- İşletme Temsilcisi / Pilot unvanı
  application_date TEXT,                         -- Başvuru tarihi

  -- Ek bilgiler
  conditions TEXT,
  coordination_contacts TEXT,
  notes TEXT,

  -- Dosya ekleri iha_attachments tablosundan gelir (parent_table='flight_permissions')
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_flight_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_flight_permissions_all" ON iha_flight_permissions FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. Uçuş / Tarama Seyir Defteri
-- ============================================
CREATE TABLE IF NOT EXISTS iha_flight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id UUID REFERENCES iha_operations(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'drone_fotogrametri',
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  duration INTEGER,                              -- dakika

  -- Personel & Ekipman
  pilot_id TEXT,
  pilot_name TEXT,
  equipment_id TEXT,
  equipment_name TEXT,

  -- Uçuş/Tarama Parametreleri
  altitude DOUBLE PRECISION,
  gsd DOUBLE PRECISION,
  overlap_forward INTEGER,
  overlap_side INTEGER,
  photo_count INTEGER,
  scan_count INTEGER,
  scan_duration INTEGER,

  -- Batarya
  battery_used INTEGER,
  total_flight_time INTEGER,
  landing_count INTEGER,

  -- GPS/CORS
  gps_base_station TEXT,
  static_duration INTEGER,
  cors_connection TEXT,
  ppk_status TEXT DEFAULT 'beklemede',

  -- Hava
  weather TEXT,
  wind_speed DOUBLE PRECISION,
  temperature DOUBLE PRECISION,
  visibility TEXT,                               -- Görüş mesafesi (ileride)

  -- Konum
  location_il TEXT DEFAULT '',
  location_ilce TEXT DEFAULT '',
  location_mahalle TEXT,
  location_pafta TEXT,
  location_ada TEXT,
  location_parsel TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_alan DOUBLE PRECISION,
  location_alan_birimi TEXT DEFAULT 'm2',

  -- Uçuş alanı geometrisi (ileride: gerçek uçuş rotası)
  flight_geometry JSONB,                         -- ⚠ KULLANILMIYOR — gelecek özellik için ayrılmış

  -- Genişletilebilirlik
  custom_fields JSONB DEFAULT '{}',              -- Kullanıcı tanımlı alanlar
  metadata JSONB DEFAULT '{}',                   -- Sistem ek bilgileri
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_flight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_flight_logs_all" ON iha_flight_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 6. Ekipman
-- ============================================
CREATE TABLE IF NOT EXISTS iha_equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  serial_number TEXT,
  registration_no TEXT,                            -- SHGM İHA Kayıt No (TR-IHA1-000560)
  category TEXT NOT NULL DEFAULT 'drone',
  status TEXT NOT NULL DEFAULT 'musait',
  ownership TEXT NOT NULL DEFAULT 'sahip',
  condition TEXT,
  current_holder TEXT,
  purchase_date TEXT,
  insurance_expiry TEXT,
  insurance_policy_no TEXT,                        -- Sigorta poliçe numarası
  last_maintenance_date TEXT,
  next_maintenance_date TEXT,
  firmware_version TEXT,
  last_calibration TEXT,
  next_calibration TEXT,
  notes TEXT,
  accessories TEXT[] DEFAULT '{}',
  flight_hours DOUBLE PRECISION DEFAULT 0,
  battery_count INTEGER DEFAULT 0,
  total_battery_cycles INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',                   -- Cihaza özel ek bilgiler
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_equipment_all" ON iha_equipment FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 7. Ekipman Zimmet Kaydı
-- ============================================
CREATE TABLE IF NOT EXISTS iha_checkout_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES iha_equipment(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL,
  person_name TEXT NOT NULL,
  checkout_date TEXT NOT NULL,
  return_date TEXT,
  operation_id TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_checkout_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_checkout_log_all" ON iha_checkout_log FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 8. Yazılım
-- ============================================
CREATE TABLE IF NOT EXISTS iha_software (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  license_type TEXT NOT NULL DEFAULT 'perpetual',
  license_expiry TEXT,
  installed_on TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_software ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_software_all" ON iha_software FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 9. Personel
-- ============================================
CREATE TABLE IF NOT EXISTS iha_team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  tc_kimlik TEXT,
  birth_date TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'aktif',
  leave_start TEXT,
  leave_end TEXT,
  skills TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  shgm_pilot_license JSONB,                       -- {licenseClass, licenseNumber, expiryDate, documentUrl}
  profile_photo_url TEXT,
  current_operation_id UUID,
  deleted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_team_all" ON iha_team FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 10. Depolama Birimleri
-- ============================================
CREATE TABLE IF NOT EXISTS iha_storage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'sunucu',
  total_capacity_tb DOUBLE PRECISION NOT NULL DEFAULT 0,
  used_capacity_tb DOUBLE PRECISION NOT NULL DEFAULT 0,
  ip TEXT,
  mount_path TEXT,
  path TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_storage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_storage_all" ON iha_storage FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 11. Depolama Klasörleri
-- ============================================
CREATE TABLE IF NOT EXISTS iha_storage_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_id UUID NOT NULL REFERENCES iha_storage(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  size_gb DOUBLE PRECISION,
  operation_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_storage_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_storage_folders_all" ON iha_storage_folders FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 12. Bakım Kayıtları
-- ============================================
CREATE TABLE IF NOT EXISTS iha_maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES iha_equipment(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'bakim',
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  cost DOUBLE PRECISION,
  performed_by TEXT,
  next_due_date TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_maintenance_all" ON iha_maintenance FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 13. Audit Log
-- ============================================
CREATE TABLE IF NOT EXISTS iha_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  target_id TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by TEXT NOT NULL DEFAULT 'kullanici',
  metadata JSONB DEFAULT '{}',
  performed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_audit_log_all" ON iha_audit_log FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 14. Araç Etkinlikleri (Vehicle Events)
-- ============================================
CREATE TABLE IF NOT EXISTS iha_vehicle_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID,
  equipment_name TEXT,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_vehicle_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_vehicle_events_all" ON iha_vehicle_events FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 15. Bilgi Bankası (Info Bank)
-- ============================================
CREATE TABLE IF NOT EXISTS iha_info_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  fields JSONB DEFAULT '[]',
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_info_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_info_bank_all" ON iha_info_bank FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 16. Operasyon Zaman Alanları (opsiyonel)
-- ============================================
-- start_time ve end_time sütunları iha_operations tablosuna eklenebilir:
-- ALTER TABLE iha_operations ADD COLUMN IF NOT EXISTS start_time TEXT;
-- ALTER TABLE iha_operations ADD COLUMN IF NOT EXISTS end_time TEXT;

-- Index: Hızlı sorgulama
CREATE INDEX IF NOT EXISTS idx_audit_target ON iha_audit_log(target, target_id);
CREATE INDEX IF NOT EXISTS idx_operations_status ON iha_operations(status);
CREATE INDEX IF NOT EXISTS idx_flight_logs_date ON iha_flight_logs(date);
CREATE INDEX IF NOT EXISTS idx_flight_logs_operation ON iha_flight_logs(operation_id);
CREATE INDEX IF NOT EXISTS idx_permissions_status ON iha_flight_permissions(status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON iha_equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON iha_equipment(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_events_date ON iha_vehicle_events(event_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_events_equipment ON iha_vehicle_events(equipment_id);
