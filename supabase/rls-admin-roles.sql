-- ═══════════════════════════════════════════════════════════════════════
-- RLS GÜNCELLEME: Admin Rolü ile Silme Kısıtlaması
-- ═══════════════════════════════════════════════════════════════════════
-- ÖNEMLİ: Bu dosyayı auth-profiles-rls.sql SONRASINDA çalıştırın.
-- Supabase Dashboard → SQL Editor'de çalıştırın.
--
-- Ne yapar:
--   1. is_admin() fonksiyonu oluşturur
--   2. 16 iha_* tablosunda DELETE → sadece admin
--   3. iha_team tablosunda INSERT/UPDATE/DELETE → sadece admin
--   4. iha_audit_log tablosunda DELETE → tamamen yasak (admin dahil)
--   5. profiles tablosunda role güncellemesi → sadece admin
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. is_admin() Fonksiyonu ───
-- Mevcut kullanıcının profiles tablosundaki rolünü kontrol eder.
-- SECURITY DEFINER: Fonksiyon sahibinin yetkileriyle çalışır (RLS bypass).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── 2. Genel iha_* Tabloları: DELETE → Admin Only ───
-- SELECT/INSERT/UPDATE herkes için açık kalır (authenticated).
-- DELETE sadece admin yapabilir.

DO $$
DECLARE
  tbl TEXT;
  -- iha_team ve iha_audit_log ayrı ele alınacak
  tbls TEXT[] := ARRAY[
    'iha_operations',
    'iha_flight_permissions',
    'iha_flight_logs',
    'iha_equipment',
    'iha_software',
    'iha_storage',
    'iha_storage_folders',
    'iha_deliverables',
    'iha_attachments',
    'iha_checkout_log',
    'iha_maintenance',
    'iha_info_bank',
    'iha_vehicle_events',
    'iha_field_prep'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    -- Mevcut DELETE politikasını kaldır
    EXECUTE format('DROP POLICY IF EXISTS "auth_delete" ON public.%I', tbl);

    -- Yeni DELETE politikası: sadece admin
    EXECUTE format(
      'CREATE POLICY "admin_delete" ON public.%I FOR DELETE USING (public.is_admin())', tbl
    );
  END LOOP;
END $$;

-- ─── 3. iha_team: INSERT/UPDATE/DELETE → Admin Only ───
-- Personel ekleme, düzenleme ve silme sadece admin yapabilir.
-- SELECT herkes için açık kalır.

DROP POLICY IF EXISTS "auth_insert" ON public.iha_team;
CREATE POLICY "admin_insert" ON public.iha_team
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "auth_update" ON public.iha_team;
CREATE POLICY "admin_update" ON public.iha_team
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "auth_delete" ON public.iha_team;
CREATE POLICY "admin_delete" ON public.iha_team
  FOR DELETE USING (public.is_admin());

-- ─── 4. iha_audit_log: DELETE → Tamamen Yasak ───
-- Denetim günlüğü SİLİNEMEZ — admin dahil kimse silemez.
-- SELECT/INSERT herkes için açık (log yazabilmeli).
-- UPDATE de yasak (kayıtlar değiştirilemez).

DROP POLICY IF EXISTS "auth_delete" ON public.iha_audit_log;
CREATE POLICY "no_delete" ON public.iha_audit_log
  FOR DELETE USING (false);

DROP POLICY IF EXISTS "auth_update" ON public.iha_audit_log;
CREATE POLICY "no_update" ON public.iha_audit_log
  FOR UPDATE USING (false);

-- ─── 5. profiles: Role Güncellemesi → Admin Only ───
-- Kullanıcı kendi profilini güncelleyebilir (display_name vb.)
-- AMA role alanını sadece admin değiştirebilir.
-- Bunu mevcut UPDATE politikasını güncelleyerek yapıyoruz.

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Kullanıcı kendi profilini güncelleyebilir (role HARİÇ)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id
  )
  WITH CHECK (
    -- Eğer role değişiyorsa, sadece admin yapabilir
    (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
    OR public.is_admin()
  );

-- ═══════════════════════════════════════════════════════════════════════
-- ÖZET:
-- ═══════════════════════════════════════════════════════════════════════
--
-- | Tablo            | SELECT | INSERT | UPDATE | DELETE |
-- |------------------|--------|--------|--------|--------|
-- | 14 iha_* tablo   | auth   | auth   | auth   | admin  |
-- | iha_team         | auth   | admin  | admin  | admin  |
-- | iha_audit_log    | auth   | auth   | YASAK  | YASAK  |
-- | profiles         | herkese| -      | kendi* | -      |
--
-- auth  = giriş yapmış kullanıcı (authenticated)
-- admin = profiles.role = 'admin' olan kullanıcı
-- kendi*= kendi profilini güncelleyebilir, role sadece admin değiştirir
-- YASAK = kimse yapamaz (admin dahil)
--
-- ═══════════════════════════════════════════════════════════════════════
-- BU DOSYAYI ÇALIŞTIRDIKTAN SONRA:
-- Test edin: Normal kullanıcı ile silme deneyin → "new row violates
-- row-level security policy" hatası almalısınız.
-- ═══════════════════════════════════════════════════════════════════════
