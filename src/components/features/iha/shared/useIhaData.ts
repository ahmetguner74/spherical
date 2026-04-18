"use client";

import { useEffect } from "react";
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

  // Sayfa görünür olduğunda veriyi yenile (tab/uygulama değişikliği)
  // NOT: Auth/session kontrolü AuthProvider tarafından yapılıyor (token yenileme
  // dahil). Burada sadece veri tarafı tazeleniyor — değişen kayıtları çekmek için.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && store.initialized) {
        store.reload();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [store.initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  return store;
}
