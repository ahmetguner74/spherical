"use client";

import { useContext } from "react";
import {
  PresenceContext,
  type PresenceContextValue,
} from "@/components/providers/PresenceProvider";

/**
 * Realtime Presence verisine erişim. PresenceProvider içinde kullanılmalı.
 * PresenceProvider yoksa boş/güvenli default döner (test/storybook için).
 */
export function usePresence(): PresenceContextValue {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    return {
      onlineUsers: [],
      onlineCount: 0,
      isEmailOnline: () => false,
      isUserOnline: () => false,
    };
  }
  return ctx;
}
