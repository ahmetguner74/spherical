"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useIhaStore } from "@/components/features/iha/shared/ihaStore";

// ─── Types ───

export type UserRole = "admin" | "kullanici";

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

// ─── Context ───

export const AuthContext = createContext<AuthContextValue | null>(null);

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // İlk yükleme: mevcut oturumu kontrol et
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        if (!cancelled) setProfile(p);
      }

      if (!cancelled) setLoading(false);
    }

    init();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          setProfile(p);
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const isAdmin = profile?.role === "admin";

  // Store'a userId senkronize et (audit log için)
  useEffect(() => {
    useIhaStore.getState().setCurrentUserId(user?.id ?? null);
  }, [user?.id]);

  // Yükleniyor
  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Oturum yoksa → LoginPage (lazy import)
  if (!user) {
    return (
      <AuthContext.Provider value={{ user, profile, isAdmin, loading, signOut }}>
        <LoginPageLoader />
      </AuthContext.Provider>
    );
  }

  // Oturum var → uygulama
  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]">
          <div className="h-8 w-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LazyLoginPage />
    </Suspense>
  );
}
