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

        if (session?.user) {
          setUser(session.user);

          // Cache eşleşiyorsa → anında göster, ağı bekleme
          if (cached && cached.id === session.user.id) {
            setProfile(cached);
            resolve();
          }

          // Taze profili arka planda getir
          const fresh = await fetchProfile(session.user.id);
          if (!cancelled && fresh) {
            setProfile(fresh);
            cacheProfile(fresh);
          }
        } else {
          // Oturum yok → cache'i temizle
          cacheProfile(null);
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
        const p = await fetchProfile(session.user.id);
        setProfile(p);
        cacheProfile(p);
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

  // Oturum yoksa → LoginPage (lazy import)
  if (!user) {
    return (
      <AuthContext.Provider value={{ user, profile, loading, signOut }}>
        <LoginPageLoader />
      </AuthContext.Provider>
    );
  }

  // Oturum var → uygulama
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
