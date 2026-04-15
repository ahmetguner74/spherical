-- ═══════════════════════════════════════════════════════════════════════
-- AUTH: Profiles Tablosu + Trigger + RLS Politikaları
-- ═══════════════════════════════════════════════════════════════════════
-- Bu dosyayı Supabase Dashboard → SQL Editor'de çalıştırın.
-- Adım 1: profiles tablosunu oluşturur
-- Adım 2: Yeni kullanıcı trigger'ı oluşturur
-- Adım 3: Tüm iha_* tablolarına RLS ekler

-- ─── 1. Profiles Tablosu ───

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'kullanici' CHECK (role IN ('admin', 'kullanici')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. Trigger: Yeni Kullanıcı → Otomatik Profil ───

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 3. Profiles RLS ───

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ─── 4. iha_* Tabloları RLS ───
-- Giriş yapmış (authenticated) kullanıcılar tüm CRUD yapabilir.
-- Giriş yapmamış anonim erişim engellenir.

DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'iha_operations',
    'iha_flight_permissions',
    'iha_flight_logs',
    'iha_equipment',
    'iha_software',
    'iha_team',
    'iha_storage',
    'iha_storage_folders',
    'iha_deliverables',
    'iha_audit_log',
    'iha_attachments',
    'iha_checkout_log',
    'iha_maintenance',
    'iha_info_bank',
    'iha_vehicle_events',
    'iha_field_prep'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    -- RLS'yi etkinleştir
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    -- Mevcut politikaları temizle (varsa)
    EXECUTE format('DROP POLICY IF EXISTS "auth_select" ON public.%I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "auth_insert" ON public.%I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "auth_update" ON public.%I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "auth_delete" ON public.%I', tbl);

    -- Authenticated kullanıcılara tam erişim
    EXECUTE format(
      'CREATE POLICY "auth_select" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'')', tbl
    );
    EXECUTE format(
      'CREATE POLICY "auth_insert" ON public.%I FOR INSERT WITH CHECK (auth.role() = ''authenticated'')', tbl
    );
    EXECUTE format(
      'CREATE POLICY "auth_update" ON public.%I FOR UPDATE USING (auth.role() = ''authenticated'')', tbl
    );
    EXECUTE format(
      'CREATE POLICY "auth_delete" ON public.%I FOR DELETE USING (auth.role() = ''authenticated'')', tbl
    );
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- SONRAKI ADIMLAR (Supabase Dashboard'da):
-- 1. Auth → Users → Add user (email + şifre, Auto Confirm açık)
-- 2. SQL Editor'de: UPDATE profiles SET role = 'admin' WHERE email = 'xxx@xxx.com';
-- ═══════════════════════════════════════════════════════════════════════
