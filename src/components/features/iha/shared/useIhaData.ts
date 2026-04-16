"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIhaStore } from "./ihaStore";
import { useRealtimeSync } from "./useRealtimeSync";

export function useIhaData() {
  const store = useIhaStore();
  const { user } = useAuth();

  // İlk yükleme — auth hazır olduğunda
  useEffect(() => {
    if (user) {
      store.initialize();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Başarısız yükleme sonrası otomatik yeniden deneme (max 3)
  // degraded === true ise overlay gösteriliyor, retry durdurulur
  useEffect(() => {
    if (user && !store.initialized && !store.loading && !store.degraded) {
      const timer = setTimeout(() => store.initialize(), 2000);
      return () => clearTimeout(timer);
    }
  }, [store.initialized, store.loading, store.degraded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime — Supabase değişikliklerini otomatik dinle
  useRealtimeSync();

  // Sayfa görünür olduğunda yenile (tab/uygulama değişikliği)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && store.initialized) {
        store.reload();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [store.initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Back/forward cache (bfcache) — tarayıcı geri/ileri tuşundan döndüğünde
  // sayfa donmuş state'den gelir: zombi Supabase bağlantısı, eski token vb.
  // Çözüm: hard reload → tertemiz fresh start.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const setActiveTab = useCallback(
    (tab: Parameters<typeof store.setActiveTab>[0]) => {
      store.setActiveTab(tab);
    },
    [store]
  );

  return { ...store, setActiveTab };
}
