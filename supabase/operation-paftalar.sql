-- Operasyonlara birden fazla pafta eklenebilsin
-- Bir operasyon 0, 1 veya daha fazla pafta ile etiketlenebilir
ALTER TABLE iha_operations ADD COLUMN IF NOT EXISTS paftalar text[] DEFAULT '{}';

-- Pafta bazlı aramalar için GIN index (hızlı "bu paftada hangi operasyonlar var" sorguları)
CREATE INDEX IF NOT EXISTS idx_operations_paftalar ON iha_operations USING GIN (paftalar);
