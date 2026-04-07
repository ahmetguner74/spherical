"use client";

import { useEffect } from "react";
import { useIhaStore } from "./ihaStore";

export function useIhaData() {
  const store = useIhaStore();

  useEffect(() => {
    store.initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && store.initialized) {
        store.reload();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [store.initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  const setActiveTab = (tab: Parameters<typeof store.setActiveTab>[0]) => {
    store.setActiveTab(tab);
    if (store.initialized) store.reload();
  };

  return { ...store, setActiveTab };
}
