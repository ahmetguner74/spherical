"use client";

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { useIhaStore } from "@/components/features/iha/shared/ihaStore";
import type { UserRole } from "@/config/permissions";

// ─── Types ───

export type { UserRole };

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// ─── Context ───

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Profile cache (anında yükleme için) ───

const PROFILE_CACHE_KEY = "spherical-auth-profile";

function getCachedProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cacheProfile(p: Profile | null) {
  try {
    if (p) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
    /* localStorage erişim hatası — sessizce geç */
  }
}

// ─── Helpers ───

/** Promise'ı süre sonunda timeout hatası ile reject et */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${label}`)), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", userId)
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    role: data.role as UserRole,
  };
}

// ─── Provider ───

/** Maksimum loading süresi (ms) — bu süre sonunda loading durumu bırakılır */
const AUTH_TIMEOUT_MS = 4000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedRef = useRef(false);

  // Loading'i bitir (sadece bir kez)
  const resolve = useCallback(() => {
    if (!resolvedRef.current) {
      resolvedRef.current = true;
      setLoading(false);
    }
  }, []);

  // İlk yükleme: mevcut oturumu kontrol et
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Önce cache'ten profili oku (anında, ağ çağrısı yok)
      const cached = getCachedProfile();

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (cancelled) return;
        if (error) console.error("[Auth] getSession error:", error.message);

        if (!session?.user) {
          // Oturum yok → cache'i temizle, login'e düş
          cacheProfile(null);
          if (!cancelled) resolve();
          return;
        }

        // KRİTİK: getUser() çağrısı YOK. v0.8.188-v0.8.196 arası burada
        // supabase.auth.getUser() vardı ve ağ takıldığında Supabase auth
        // istemcisinin internal lock'unu (navigator.locks) tutuyordu. Bu lock
        // serbest kalmadığı için sonraki signInWithPassword çağrısı da
        // bekliyor → kullanıcı login butonunda takılı kalıyordu.
        // Token geçerliliğini fetchProfile implicit olarak doğrular: token
        // geçersizse RLS satırı vermez ve null döner → signOut zinciri çalışır.
        const userId = session.user.id;

        // Cache hızlı yolu: eşleşen cache varsa anında göster
        if (cached && cached.id === userId) {
          setUser(session.user);
          setProfile(cached);
          resolve();
          // Arka planda taze profili getir — başarısız olursa cache'e güven
          fetchProfile(userId)
            .then((fresh) => {
              if (!cancelled && fresh) {
                setProfile(fresh);
                cacheProfile(fresh);
              }
            })
            .catch(() => {});
          return;
        }

        // Cache yok → profili timeout ile getir. Başarısızsa zombi.
        try {
          const fresh = await withTimeout(fetchProfile(userId), 6000, "fetchProfile");
          if (cancelled) return;
          if (!fresh) {
            // Token geçersiz veya profile satırı yok — login'e düş
            logger.error("[Auth] Profile alınamadı — signOut");
            await supabase.auth.signOut().catch(() => {});
            cacheProfile(null);
            setUser(null);
            setProfile(null);
            resolve();
            return;
          }
          setUser(session.user);
          setProfile(fresh);
          cacheProfile(fresh);
          resolve();
          return;
        } catch (err) {
          // Timeout veya network → DB ulaşılmıyor. Zombi muamelesi: signOut.
          logger.error("[Auth] Profile getirilemedi (timeout/network) — signOut", err);
          await supabase.auth.signOut().catch(() => {});
          cacheProfile(null);
          setUser(null);
          setProfile(null);
          resolve();
          return;
        }
      } catch (err) {
        console.error("[Auth] init exception:", err);
      }

      if (!cancelled) resolve();
    }

    init();

    // Güvenlik zamanaşımı — hiçbir koşulda sonsuza kadar loading gösterme
    const timeout = setTimeout(() => {
      if (!cancelled) resolve();
    }, AUTH_TIMEOUT_MS);

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        // Profil gelmezse login yarım kalır → zombi muamelesi
        try {
          const p = await withTimeout(fetchProfile(session.user.id), 6000, "fetchProfile(signIn)");
          if (!p) {
            logger.error("[Auth] Login sonrası profile yok — signOut");
            await supabase.auth.signOut().catch(() => {});
            setUser(null);
            setProfile(null);
            cacheProfile(null);
          } else {
            setProfile(p);
            cacheProfile(p);
          }
        } catch (err) {
          logger.error("[Auth] Login sonrası profile timeout — signOut", err);
          await supabase.auth.signOut().catch(() => {});
          setUser(null);
          setProfile(null);
          cacheProfile(null);
        }
        resolve();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        cacheProfile(null);
        resolve();
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [resolve]);

  const signOut = useCallback(async () => {
    cacheProfile(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      logger.error("signOut error", err);
    }
    setUser(null);
    setProfile(null);
  }, []);

  // Store'a userId senkronize et (audit log için)
  useEffect(() => {
    useIhaStore.getState().setCurrentUserId(user?.id ?? null);
  }, [user?.id]);

  // Yükleniyor — uygulama hissi veren splash ekranı
  if (loading) {
    return <AuthSplash />;
  }

  // Oturum yoksa VEYA profile yüklenemediyse → LoginPage.
  // Profile = DB'ye ulaşılabildiğinin kanıtı. Yoksa panel açmıyoruz
  // (aksi halde boş panel ile login arasında kafa karıştırıcı orta bir durum)
  if (!user || !profile) {
    return (
      <AuthContext.Provider value={{ user, profile, loading, signOut }}>
        <LoginPageLoader />
      </AuthContext.Provider>
    );
  }

  // Oturum var + profile var → uygulama
  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Splash Screen (loading) ───

function AuthSplash() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-4">
        <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
          CBS İHA BİRİMİ
        </h1>
        <div className="h-8 w-8 mx-auto border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

// ─── Lazy LoginPage ───

import { lazy, Suspense } from "react";

const LazyLoginPage = lazy(() =>
  import("@/components/features/auth/LoginPage").then((m) => ({
    default: m.LoginPage,
  }))
);

function LoginPageLoader() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--background)]">
          <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
            CBS İHA BİRİMİ
          </h1>
        </div>
      }
    >
      <LazyLoginPage />
    </Suspense>
  );
}
