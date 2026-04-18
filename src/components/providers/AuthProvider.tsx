"use client";

import { createContext, lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { useIhaStore } from "@/components/features/iha/shared/ihaStore";
import type { UserRole } from "@/config/permissions";
import {
  IDLE_TIMEOUT_MS,
  IDLE_WARNING_MS,
  ACTIVITY_THROTTLE_MS,
  SILENT_REFRESH_INTERVAL_MS,
  SIGNED_OUT_GRACE_MS,
  TOKEN_REFRESH_THRESHOLD_MS,
  IDLE_CHECK_INTERVAL_MS,
  ACTIVITY_EVENTS,
} from "@/config/auth";

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
  /** Token yenileme fail olduğunda true. Kullanıcı ekranda kalır, üstünde relogin overlay belirir. */
  sessionExpired: boolean;
  /** Idle timeout'a 5dk kaldığında true. Aktivite olursa otomatik false. */
  idleWarning: boolean;
  /** Idle warning'i elle kapat (kullanıcı "Devam et" basınca) — aktivite timestamp'ini tazeler */
  extendSession: () => void;
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

/**
 * Güvenli signOut — Promise.race ile timeout. Default supabase.auth.signOut()
 * sunucuya istek atar (token revoke). Ağ takıldığında çağrı sonsuza kadar
 * hang ediyor ve client'ın internal navigator.locks kilidini tutuyor — sonraki
 * tüm auth çağrıları bekliyor (login butonu sonsuz döndü, hata bile gelmedi).
 *
 * scope:"local" → sunucuya istek yok, sadece client state sıfırlanır.
 * Promise.race(1500ms) → scope:"local" bile hang ederse devam et.
 */
async function safeSignOut(): Promise<void> {
  await Promise.race([
    supabase.auth.signOut({ scope: "local" }),
    new Promise<void>((resolve) => setTimeout(resolve, 1500)),
  ]).catch(() => {});
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

/** Profile fetch + 1 retry. Anlık ağ titremesinde (cold connection, mobil geçiş)
 * tek seferlik fail yüzünden kullanıcı dışarı atılmasın diye 1.5sn sonra 1 kez
 * tekrar dener. İkisi de fail ise null döner (caller signOut'a düşer). */
async function fetchProfileWithRetry(userId: string, timeoutMs: number): Promise<Profile | null> {
  try {
    return await withTimeout(fetchProfile(userId), timeoutMs, "fetchProfile");
  } catch (firstErr) {
    logger.warn("[Auth] profile fetch fail (1/2) — 1.5sn sonra retry", firstErr);
    await new Promise((r) => setTimeout(r, 1500));
    return await withTimeout(fetchProfile(userId), timeoutMs, "fetchProfile(retry)");
  }
}

// ─── Provider ───

/**
 * Maksimum loading süresi (ms) — bu süre sonunda loading durumu bırakılır.
 * 15sn: yavaş mobil ağlarda (3G, tünel, zayıf sinyal) ilk refresh'te profil
 * fetch'i tamamlansın diye tolere edilir. Cache varsa zaten 100ms içinde biter;
 * cache yoksa 4sn çok kısaydı ve kullanıcı hatalı şekilde login ekranına düşüyordu.
 */
const AUTH_TIMEOUT_MS = 15000;

/** Profil fetch timeout (ms) — yavaş mobil ağda ilk yüklemede tolerans */
const PROFILE_FETCH_TIMEOUT_MS = 15000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [idleWarning, setIdleWarning] = useState(false);
  const resolvedRef = useRef(false);
  const lastActivityRef = useRef<number>(0);
  const lastActivityUpdateRef = useRef<number>(0);

  // Loading'i bitir (sadece bir kez)
  const resolve = useCallback(() => {
    if (!resolvedRef.current) {
      resolvedRef.current = true;
      setLoading(false);
    }
  }, []);

  // Aktivite timestamp'ini tazele (throttle'lı)
  const touchActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityUpdateRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityUpdateRef.current = now;
    lastActivityRef.current = now;
    // Uyarı açıksa aktivite → uyarıyı kapat
    setIdleWarning((prev) => (prev ? false : prev));
  }, []);

  // Kullanıcı "Devam et" bastığında manuel tazelemek için
  const extendSession = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastActivityUpdateRef.current = now;
    setIdleWarning(false);
  }, []);

  useEffect(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastActivityUpdateRef.current = now;
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
          // Oturum yok. LIMP MODE: cached profile varsa kullanıcıyı login'e ATMA.
          // Cached profile + sessionExpired=true ile panel açık tutulur, üstte
          // ReloginOverlay basılır. Kullanıcı sayfayı yenilediğinde her seferinde
          // login ekranına düşmek zorunda kalmaz — Gmail/Supabase Studio gibi.
          // Cached state'le sadece "okuma" görünür; yazma istekleri RLS'den
          // geri döner (kullanıcı tekrar giriş yapana kadar).
          if (cached) {
            const fakeUser = { id: cached.id, email: cached.email } as User;
            setUser(fakeUser);
            setProfile(cached);
            setSessionExpired(true);
            if (!cancelled) resolve();
            return;
          }
          // Cache de yok → gerçekten login'e düş (ilk açılış / cache temizlendi)
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

        // Cache yok → profili timeout + retry ile getir. Başarısızsa zombi.
        try {
          const fresh = await fetchProfileWithRetry(userId, PROFILE_FETCH_TIMEOUT_MS);
          if (cancelled) return;
          if (!fresh) {
            // Token geçersiz veya profile satırı yok — login'e düş
            logger.error("[Auth] Profile alınamadı — signOut");
            await safeSignOut();
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
          await safeSignOut();
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
          const p = await fetchProfileWithRetry(session.user.id, PROFILE_FETCH_TIMEOUT_MS);
          if (!p) {
            logger.error("[Auth] Login sonrası profile yok — signOut");
            await safeSignOut();
            setUser(null);
            setProfile(null);
            cacheProfile(null);
          } else {
            setProfile(p);
            cacheProfile(p);
            // Login sonrası aktivite sayacını sıfırla
            lastActivityRef.current = Date.now();
          }
        } catch (err) {
          logger.error("[Auth] Login sonrası profile timeout — signOut", err);
          await safeSignOut();
          setUser(null);
          setProfile(null);
          cacheProfile(null);
        }
        resolve();
      } else if (event === "SIGNED_OUT") {
        // TOLERANSLI SIGNED_OUT: Supabase SDK geçici token refresh hatalarında
        // (mobil ağ geçişi, geçici 500'ler) SIGNED_OUT atıyor. Hemen login'e
        // atma — kullanıcı iş yaparken "hop" ekranda kaybolmasın.
        // Grace period: SIGNED_OUT_GRACE_MS sonra session hâlâ yoksa sessionExpired'ı aç.
        // Render'da user/profile KORUNUYOR → children görünür kalır, üstüne
        // overlay belirir. Kullanıcı "Tekrar Giriş" butonuna basarak relogin yapar.
        // (Login page'deyken gelen SIGNED_OUT için overlay zaten render edilmez,
        //  çünkü overlay sadece user+profile varken children ile render ediliyor.)
        resolve();
        setTimeout(async () => {
          try {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (s?.user) return; // Sahte alarm — Supabase kendi recover etti
          } catch { /* getSession fail → overlay'e geç */ }
          // LIMP MODE: cached profile'ı KORUYORUZ. Sonraki refresh'te user
          // limp mode'da panel açar, login ekranına atılmaz. Manuel signOut
          // (kullanıcı bilinçli çıkış) cache'i ayrıca temizler — buraya bağlı değil.
          setSessionExpired(true);
        }, SIGNED_OUT_GRACE_MS);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
        setSessionExpired(false);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [resolve]);

  // ─── Aktivite tracking + idle timeout + sessiz refresh ───
  // Sadece oturum açıkken çalışır (user varsa)
  useEffect(() => {
    if (!user) return;

    // Aktivite event'lerini dinle (throttle'lı)
    const handleActivity = () => touchActivity();
    ACTIVITY_EVENTS.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    // Sekme geri geldiğinde: aktiviteyi tazele + session kontrolü
    const handleVisibility = async () => {
      if (document.visibilityState !== "visible") return;
      touchActivity();

      // Session hâlâ canlı mı?
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return; // SIGNED_OUT zaten yayınlanmış olacak → grace period devreye girer

        // Token yakında expire olacaksa force refresh
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        if (expiresAt && expiresAt - Date.now() < TOKEN_REFRESH_THRESHOLD_MS) {
          await supabase.auth.refreshSession().catch((err) => {
            logger.error("[Auth] visibility refresh fail", err);
          });
        }
      } catch { /* sessiz geç */ }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // İdle check — 30sn'de bir
    const idleTimer = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= IDLE_TIMEOUT_MS) {
        // Zaman doldu → otomatik çıkış
        setIdleWarning(false);
        cacheProfile(null);
        void safeSignOut().then(() => {
          setUser(null);
          setProfile(null);
        });
      } else if (idleMs >= IDLE_TIMEOUT_MS - IDLE_WARNING_MS) {
        setIdleWarning(true);
      }
    }, IDLE_CHECK_INTERVAL_MS);

    // Sessiz token refresh — 15dk'da bir, son 5dk'da aktivite varsa
    const refreshTimer = setInterval(async () => {
      const activeRecently = Date.now() - lastActivityRef.current < SILENT_REFRESH_INTERVAL_MS;
      if (!activeRecently) return;
      try {
        await supabase.auth.refreshSession();
      } catch (err) {
        logger.error("[Auth] silent refresh fail", err);
      }
    }, SILENT_REFRESH_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(idleTimer);
      clearInterval(refreshTimer);
    };
  }, [user, touchActivity]);

  const signOut = useCallback(async () => {
    cacheProfile(null);
    await safeSignOut();
    setUser(null);
    setProfile(null);
    setSessionExpired(false);
    setIdleWarning(false);
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
      <AuthContext.Provider
        value={{ user, profile, loading, sessionExpired, idleWarning, extendSession, signOut }}
      >
        <LoginPageLoader />
      </AuthContext.Provider>
    );
  }

  // Oturum var + profile var → uygulama
  // sessionExpired true ise (token refresh fail) children görünür kalır, üstünde overlay
  // idleWarning true ise "5dk sonra çıkarılacaksınız" uyarısı
  return (
    <AuthContext.Provider
      value={{ user, profile, loading, sessionExpired, idleWarning, extendSession, signOut }}
    >
      {children}
      {sessionExpired && <SessionExpiredOverlay />}
      {idleWarning && !sessionExpired && <IdleWarningOverlayLazy />}
    </AuthContext.Provider>
  );
}

// ─── Session Expired Overlay (lazy) ───
// ReloginOverlay'i doğrudan import etmiyoruz — circular dep (ReloginOverlay useAuth kullanıyor).
// Lazy import ile çözüyoruz.
const LazyReloginOverlay = lazy(() =>
  import("@/components/ui/ReloginOverlay").then((m) => ({ default: m.ReloginOverlay }))
);

function SessionExpiredOverlay() {
  return (
    <Suspense fallback={null}>
      <LazyReloginOverlay
        title="Oturumunuz sona erdi"
        description="Güvenlik için yeniden giriş yapmanız gerekiyor. Açık işleminizi kaybetmeden devam edin."
      />
    </Suspense>
  );
}

// ─── Idle Warning Overlay (lazy) ───
const LazyIdleWarningOverlay = lazy(() =>
  import("@/components/ui/IdleWarningOverlay").then((m) => ({ default: m.IdleWarningOverlay }))
);

function IdleWarningOverlayLazy() {
  return (
    <Suspense fallback={null}>
      <LazyIdleWarningOverlay />
    </Suspense>
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
