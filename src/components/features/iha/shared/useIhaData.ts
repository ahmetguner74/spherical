"use client";

import { useEffect, useCallback } from "react";
import { useIhaStore } from "./ihaStore";
import { useRealtimeSync } from "./useRealtimeSync";

export function useIhaData() {
  const store = useIhaStore();

  // İlk yükleme
  useEffect(() => {
    store.initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const setActiveTab = useCallback(
    (tab: Parameters<typeof store.setActiveTab>[0]) => {
      store.setActiveTab(tab);
    },
    [store]
  );

  return { ...store, setActiveTab };
}
