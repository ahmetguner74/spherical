"use client";

import { useEffect } from "react";
import { useAkademiStore } from "./akademiStore";

export function useAkademiData() {
  const store = useAkademiStore();

  useEffect(() => {
    if (!store.initialized) store.initialize();
  }, [store.initialized, store.initialize]);

  return store;
}
