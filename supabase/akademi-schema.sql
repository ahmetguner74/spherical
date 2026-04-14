-- Akademi tabloları
-- Kurs → Adım → Görsel hiyerarşisi (CASCADE ile bağlı)

CREATE TABLE IF NOT EXISTS akademi_kurslar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  software TEXT NOT NULL DEFAULT '',
  icon TEXT,
  difficulty TEXT DEFAULT 'baslangic' CHECK (difficulty IN ('baslangic', 'orta', 'ileri')),
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'taslak' CHECK (status IN ('taslak', 'yayinda')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akademi_adimlar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kurs_id UUID NOT NULL REFERENCES akademi_kurslar(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  youtube_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS akademi_gorseller (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adim_id UUID NOT NULL REFERENCES akademi_adimlar(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  annotations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);
