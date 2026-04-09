-- Saha Hazırlığı Checklist tablosu
-- localStorage yerine Supabase'de saklanır
CREATE TABLE IF NOT EXISTS iha_field_prep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL REFERENCES iha_operations(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  checked_by TEXT DEFAULT 'kullanici',
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(operation_id, item_key)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_field_prep_operation ON iha_field_prep(operation_id);

-- RLS
ALTER TABLE iha_field_prep ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iha_field_prep_all" ON iha_field_prep FOR ALL USING (true) WITH CHECK (true);
