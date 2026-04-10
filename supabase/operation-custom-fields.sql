-- Custom fields migration — Excel import wizard için
-- Kullanıcı Excel'de olup sistemde olmayan sütunları bu alanda saklayabilir
ALTER TABLE iha_operations ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';

-- jsonb üzerinde arama için GIN index (opsiyonel, performans için)
CREATE INDEX IF NOT EXISTS idx_operations_custom_fields ON iha_operations USING GIN (custom_fields);
