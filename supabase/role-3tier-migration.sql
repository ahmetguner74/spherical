-- ═══════════════════════════════════════════════════════════════════════
-- 3 KATMANLI ROL SİSTEMİ MİGRASYONU
-- ═══════════════════════════════════════════════════════════════════════
-- ÖNEMLİ: Bu dosyayı rls-admin-roles.sql SONRASINDA çalıştırın.
-- Supabase Dashboard → SQL Editor'de çalıştırın.
--
-- Ne yapar:
--   1. profiles.role CHECK kısıtlamasını günceller (3 rol)
--   2. Mevcut 'kullanici' rollerini 'viewer' olarak günceller
--   3. is_admin() fonksiyonunu günceller (super_admin + admin)
--   4. is_super_admin() fonksiyonunu oluşturur
--   5. profiles UPDATE politikasını günceller (rol değişikliği → super_admin)
--   6. viewer için INSERT/UPDATE/DELETE kısıtlamaları ekler
--
-- ROLLER:
--   super_admin  → Her şeyi yapabilir (kullanıcı yönetimi dahil)
--   admin        → Tam CRUD (kullanıcı yönetimi hariç)
--   viewer       → Sadece görüntüleme (yazma yok)
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. CHECK Kısıtlamasını Güncelle ───

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'viewer'));

-- ─── 2. Mevcut 'kullanici' Rollerini Dönüştür ───
-- Varsayılan olarak 'viewer' yapılır.
-- Dönüşüm sonrası ihtiyaca göre Dashboard'dan admin atanabilir.

UPDATE public.profiles SET role = 'viewer' WHERE role = 'kullanici';

-- ─── 3. DEFAULT Değerini Güncelle ───

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'viewer';

-- ─── 4. is_admin() Fonksiyonunu Güncelle ───
-- Artık hem super_admin hem admin "admin" sayılır.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── 5. is_super_admin() Fonksiyonu ───

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── 6. profiles UPDATE Politikasını Güncelle ───
-- Rol değişikliği artık sadece super_admin yapabilir (eskiden admin).

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id
  )
  WITH CHECK (
    -- Eğer role değişiyorsa, sadece super_admin yapabilir
    (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()))
    OR public.is_super_admin()
  );

-- ─── 7. Viewer Kısıtlamaları ───
-- Viewer rolündeki kullanıcılar INSERT/UPDATE/DELETE yapamamalı.
-- Mevcut RLS politikaları "authenticated" kullanıcılara izin veriyor.
-- Viewer'ı engellemek için politikaları güncelliyoruz.
--
-- NOT: is_admin() artık super_admin + admin kapsıyor.
-- Viewer sadece SELECT yapabilir — INSERT/UPDATE de engellenir.

DO $$
DECLARE
  tbl TEXT;
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
    -- INSERT: sadece admin+ (viewer yazamaz)
    EXECUTE format('DROP POLICY IF EXISTS "auth_insert" ON public.%I', tbl);
    EXECUTE format(
      'CREATE POLICY "admin_insert" ON public.%I FOR INSERT WITH CHECK (public.is_admin())', tbl
    );

    -- UPDATE: sadece admin+ (viewer düzenleyemez)
    EXECUTE format('DROP POLICY IF EXISTS "auth_update" ON public.%I', tbl);
    EXECUTE format(
      'CREATE POLICY "admin_update" ON public.%I FOR UPDATE USING (public.is_admin())', tbl
    );
  END LOOP;
END $$;

-- iha_audit_log INSERT hala herkese açık (viewer dahil log yazabilmeli)
-- Bu tablo yukarıdaki döngüye dahil oldu, viewer'ı da engelledik.
-- Audit log INSERT'i geri açalım — log yazmak güvenlik açığı değil.
DROP POLICY IF EXISTS "admin_insert" ON public.iha_audit_log;
CREATE POLICY "auth_insert" ON public.iha_audit_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════
-- ÖZET (GÜNCELLENMİŞ):
-- ═══════════════════════════════════════════════════════════════════════
--
-- | Tablo            | SELECT    | INSERT      | UPDATE      | DELETE       |
-- |------------------|-----------|-------------|-------------|--------------|
-- | 14 iha_* tablo   | auth      | admin+      | admin+      | admin+       |
-- | iha_team         | auth      | admin+      | admin+      | admin+       |
-- | iha_audit_log    | auth      | auth        | YASAK       | YASAK        |
-- | profiles         | herkese   | -           | kendi*      | -            |
--
-- auth   = giriş yapmış kullanıcı (authenticated) — viewer dahil
-- admin+ = super_admin VEYA admin (viewer hariç)
-- kendi* = kendi profilini güncelleyebilir, role sadece super_admin değiştirir
-- YASAK  = kimse yapamaz (super_admin dahil)
--
-- ═══════════════════════════════════════════════════════════════════════
-- BU DOSYAYI ÇALIŞTIRDIKTAN SONRA:
--
-- 1. Kendi rolünüzü super_admin yapın:
--    UPDATE profiles SET role = 'super_admin' WHERE email = 'sizin@email.com';
--
-- 2. Test edin:
--    - Viewer ile ekleme/silme deneyin → hata almalısınız
--    - Admin ile silme deneyin → çalışmalı
--    - Admin ile rol değiştirme deneyin → hata almalısınız
--    - Super admin ile rol değiştirme deneyin → çalışmalı
-- ═══════════════════════════════════════════════════════════════════════
