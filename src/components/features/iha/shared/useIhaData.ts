"use client";

import { useEffect } from "react";
import { useIhaStore } from "./ihaStore";

export function useIhaData() {
  const store = useIhaStore();

  useEffect(() => {
    store.initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return store;
}
