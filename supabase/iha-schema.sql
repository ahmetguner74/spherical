-- ============================================
-- CBS İHA Birimi — Supabase Veritabanı Şeması
-- ============================================
-- Bu SQL'i Supabase SQL Editor'de çalıştırın.
-- Tüm tablolar public erişimli (RLS açık, herkes okur/yazar).

-- 1. Operasyonlar
CREATE TABLE IF NOT EXISTS iha_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'drone_fotogrametri',
  requester TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'talep',
  priority TEXT NOT NULL DEFAULT 'normal',
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
  assigned_team TEXT[] DEFAULT '{}',
  assigned_equipment TEXT[] DEFAULT '{}',
  permission_id TEXT,
  data_storage_path TEXT,
  data_size DOUBLE PRECISION,
  output_description TEXT,
  completion_percent INTEGER DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_operations_all" ON iha_operations FOR ALL USING (true) WITH CHECK (true);

-- 2. Çıktılar / Teslimatlar
CREATE TABLE IF NOT EXISTS iha_deliverables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES iha_operations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  delivery_method TEXT NOT NULL DEFAULT 'sunucu',
  delivered_to TEXT,
  delivered_at TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_deliverables_all" ON iha_deliverables FOR ALL USING (true) WITH CHECK (true);

-- 3. Uçuş İzinleri (SHGM / HSD)
CREATE TABLE IF NOT EXISTS iha_flight_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id UUID REFERENCES iha_operations(id) ON DELETE SET NULL,
  hsd_number TEXT,
  status TEXT NOT NULL DEFAULT 'beklemede',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  max_altitude INTEGER,
  polygon_coordinates JSONB DEFAULT '[]',
  conditions TEXT,
  coordination_contacts TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_flight_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_flight_permissions_all" ON iha_flight_permissions FOR ALL USING (true) WITH CHECK (true);

-- 4. Uçuş / Tarama Seyir Defteri
CREATE TABLE IF NOT EXISTS iha_flight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id UUID REFERENCES iha_operations(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'drone_fotogrametri',
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  duration INTEGER,
  pilot_id TEXT,
  pilot_name TEXT,
  equipment_id TEXT,
  equipment_name TEXT,
  altitude DOUBLE PRECISION,
  gsd DOUBLE PRECISION,
  overlap_forward INTEGER,
  overlap_side INTEGER,
  photo_count INTEGER,
  scan_count INTEGER,
  scan_duration INTEGER,
  battery_used INTEGER,
  total_flight_time INTEGER,
  landing_count INTEGER,
  gps_base_station TEXT,
  static_duration INTEGER,
  cors_connection TEXT,
  ppk_status TEXT DEFAULT 'beklemede',
  weather TEXT,
  wind_speed DOUBLE PRECISION,
  temperature DOUBLE PRECISION,
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
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_flight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_flight_logs_all" ON iha_flight_logs FOR ALL USING (true) WITH CHECK (true);

-- 5. Ekipman
CREATE TABLE IF NOT EXISTS iha_equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  serial_number TEXT,
  category TEXT NOT NULL DEFAULT 'drone',
  status TEXT NOT NULL DEFAULT 'musait',
  ownership TEXT NOT NULL DEFAULT 'sahip',
  condition TEXT,
  current_holder TEXT,
  purchase_date TEXT,
  insurance_expiry TEXT,
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
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_equipment_all" ON iha_equipment FOR ALL USING (true) WITH CHECK (true);

-- 6. Ekipman Zimmet Kaydı
CREATE TABLE IF NOT EXISTS iha_checkout_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES iha_equipment(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL,
  person_name TEXT NOT NULL,
  checkout_date TEXT NOT NULL,
  return_date TEXT,
  operation_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_checkout_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_checkout_log_all" ON iha_checkout_log FOR ALL USING (true) WITH CHECK (true);

-- 7. Yazılım
CREATE TABLE IF NOT EXISTS iha_software (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT,
  license_type TEXT NOT NULL DEFAULT 'perpetual',
  license_expiry TEXT,
  installed_on TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_software ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_software_all" ON iha_software FOR ALL USING (true) WITH CHECK (true);

-- 8. Personel
CREATE TABLE IF NOT EXISTS iha_team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_team_all" ON iha_team FOR ALL USING (true) WITH CHECK (true);

-- 9. Depolama Birimleri
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
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_storage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_storage_all" ON iha_storage FOR ALL USING (true) WITH CHECK (true);

-- 10. Depolama Klasörleri
CREATE TABLE IF NOT EXISTS iha_storage_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_id UUID NOT NULL REFERENCES iha_storage(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  size_gb DOUBLE PRECISION,
  operation_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_storage_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_storage_folders_all" ON iha_storage_folders FOR ALL USING (true) WITH CHECK (true);

-- 11. Bakım Kayıtları
CREATE TABLE IF NOT EXISTS iha_maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES iha_equipment(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'bakim',
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  cost DOUBLE PRECISION,
  performed_by TEXT,
  next_due_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_maintenance_all" ON iha_maintenance FOR ALL USING (true) WITH CHECK (true);

-- 12. Audit Log
CREATE TABLE IF NOT EXISTS iha_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  target_id TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by TEXT NOT NULL DEFAULT 'kullanici',
  performed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE iha_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_audit_log_all" ON iha_audit_log FOR ALL USING (true) WITH CHECK (true);
