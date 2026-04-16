"use client";

import { createContext, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/config/permissions";
import { PRESENCE_HEARTBEAT_MS } from "@/config/auth";

// ─── Types ───

export interface OnlineUser {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  onlineAt: string; // ISO timestamp (bağlanma anı)
}

export interface PresenceContextValue {
  onlineUsers: OnlineUser[];
  onlineCount: number;
  /** Belirli bir e-posta online mı? (PersonnelCard yeşil nokta için) */
  isEmailOnline: (email: string | undefined | null) => boolean;
  /** Belirli bir user.id online mı? */
  isUserOnline: (userId: string | undefined | null) => boolean;
}

export const PresenceContext = createContext<PresenceContextValue | null>(null);

// ─── Provider ───

/**
 * Supabase Realtime Presence channel. Kullanıcı login'de kanala bağlanır,
 * logout'ta ayrılır. Diğer kullanıcıların bağlantısı anlık takip edilir.
 * Kanal: "spherical-presence"
 */
export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Auth yoksa kanala bağlanma
    if (!user || !profile) {
      setOnlineUsers([]);
      return;
    }

    const channel = supabase.channel("spherical-presence", {
      config: {
        presence: { key: user.id },
      },
    });

    // Tüm online kullanıcıları sync olduğunda al
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<OnlineUser>();
      // state: { [userId]: OnlineUser[] } — aynı userId birden fazla sekmede açıksa birleştir
      const users: OnlineUser[] = [];
      const seen = new Set<string>();
      for (const entries of Object.values(state)) {
        for (const entry of entries) {
          if (seen.has(entry.userId)) continue;
          seen.add(entry.userId);
          users.push(entry);
        }
      }
      setOnlineUsers(users);
    });

    // Kanal hazır olduğunda kendi presence'ını track et
    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return;
      await channel.track({
        userId: user.id,
        email: profile.email,
        displayName: profile.displayName,
        role: profile.role,
        onlineAt: new Date().toISOString(),
      } satisfies OnlineUser);
    });

    channelRef.current = channel;

    // Heartbeat: her 30sn'de presence'ı tazele (bağlantı kopuklukları için)
    const heartbeat = setInterval(() => {
      if (!channelRef.current) return;
      void channelRef.current.track({
        userId: user.id,
        email: profile.email,
        displayName: profile.displayName,
        role: profile.role,
        onlineAt: new Date().toISOString(),
      } satisfies OnlineUser);
    }, PRESENCE_HEARTBEAT_MS);

    return () => {
      clearInterval(heartbeat);
      void channel.untrack();
      void channel.unsubscribe();
      channelRef.current = null;
      setOnlineUsers([]);
    };
  }, [user?.id, profile?.email, profile?.displayName, profile?.role]);

  const isEmailOnline = (email: string | undefined | null) => {
    if (!email) return false;
    const needle = email.toLowerCase();
    return onlineUsers.some((u) => u.email.toLowerCase() === needle);
  };

  const isUserOnline = (userId: string | undefined | null) => {
    if (!userId) return false;
    return onlineUsers.some((u) => u.userId === userId);
  };

  return (
    <PresenceContext.Provider
      value={{
        onlineUsers,
        onlineCount: onlineUsers.length,
        isEmailOnline,
        isUserOnline,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
}
