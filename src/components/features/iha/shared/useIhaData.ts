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

  // NOT: v0.8.186'daki pageshow (bfcache) hard reload handler'ı kaldırıldı.
  // Hard reload, bfcache'den dönen kullanıcıyı login ekranına düşürüyordu.
  // Artık zombi session sorunu v0.8.199 (localStorage temizliği) ve v0.8.200
  // (safeSignOut timeout korumaları) ile kökten çözüldüğünden hard reload'a
  // gerek kalmadı — Safari geri/ileri tuşundan dönüşte uygulama state'i
  // olduğu gibi korunuyor.

  const setActiveTab = useCallback(
    (tab: Parameters<typeof store.setActiveTab>[0]) => {
      store.setActiveTab(tab);
    },
    [store]
  );

  return { ...store, setActiveTab };
}
