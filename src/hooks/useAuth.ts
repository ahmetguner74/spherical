"use client";

import { useSyncExternalStore } from "react";
import { authConfig } from "@/config/auth";

function getIsAdmin(): boolean {
  if (!authConfig.enabled) return true;
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(authConfig.storageKey);
  if (!stored) return false;
  return Date.now() < parseInt(stored, 10);
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return getIsAdmin();
}

function getServerSnapshot() {
  return false;
}

export function useAuth() {
  const isAdmin = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { isAdmin };
}
