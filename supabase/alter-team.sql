-- iha_team tablosuna eksik sütunları ekle
ALTER TABLE iha_team ADD COLUMN IF NOT EXISTS tc_kimlik TEXT;
ALTER TABLE iha_team ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE iha_team ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE iha_team ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'aktif';
ALTER TABLE iha_team ADD COLUMN IF NOT EXISTS leave_start TEXT;
ALTER TABLE iha_team ADD COLUMN IF NOT EXISTS leave_end TEXT;
ALTER TABLE iha_team ADD COLUMN IF NOT EXISTS shgm_pilot_license JSONB;
ALTER TABLE iha_team ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
