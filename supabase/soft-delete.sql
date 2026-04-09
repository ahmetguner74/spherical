-- Soft Delete Migration
-- Tüm IHA tablolarına deleted_at kolonu ekler
-- Silme işlemlerinde DELETE yerine UPDATE deleted_at = now() kullanılır
-- Sorgularda .is("deleted_at", null) filtresi eklenir

-- ─── Kolon Ekleme ───
ALTER TABLE iha_operations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_flight_permissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_flight_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_equipment ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_software ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_team ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_storage ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_storage_folders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_deliverables ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_maintenance ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_checkout_log ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_vehicle_events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_attachments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE iha_info_bank ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- ─── Performans İndeksleri ───
CREATE INDEX IF NOT EXISTS idx_operations_deleted ON iha_operations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_flight_permissions_deleted ON iha_flight_permissions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_flight_logs_deleted ON iha_flight_logs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_equipment_deleted ON iha_equipment(deleted_at);
CREATE INDEX IF NOT EXISTS idx_software_deleted ON iha_software(deleted_at);
CREATE INDEX IF NOT EXISTS idx_team_deleted ON iha_team(deleted_at);
CREATE INDEX IF NOT EXISTS idx_storage_deleted ON iha_storage(deleted_at);
CREATE INDEX IF NOT EXISTS idx_storage_folders_deleted ON iha_storage_folders(deleted_at);
CREATE INDEX IF NOT EXISTS idx_deliverables_deleted ON iha_deliverables(deleted_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_deleted ON iha_maintenance(deleted_at);
CREATE INDEX IF NOT EXISTS idx_checkout_log_deleted ON iha_checkout_log(deleted_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_events_deleted ON iha_vehicle_events(deleted_at);
CREATE INDEX IF NOT EXISTS idx_attachments_deleted ON iha_attachments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_info_bank_deleted ON iha_info_bank(deleted_at);
