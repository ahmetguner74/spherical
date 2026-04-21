"use client";

import { useRef, useState, useEffect } from "react";
import { usePresence } from "@/hooks/usePresence";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/config/permissions";
import { cn } from "@/lib/utils";

/**
 * Header'da kimin online olduğunu gösteren rozet.
 * Tık → açılan panel: tüm online kullanıcıların listesi (kendisi "(Siz)" etiketiyle).
 */
export function OnlineIndicator() {
  const { user } = useAuth();
  const { onlineUsers, onlineCount } = usePresence();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (onlineCount === 0) {
    return (
      <div className="relative" aria-hidden="true">
        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs opacity-0 pointer-events-none">
          <span className="relative inline-flex h-2 w-2 shrink-0" />
          <span className="hidden sm:inline font-medium tabular-nums w-4" />
        </div>
      </div>
    );
  }
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label={`${onlineCount} kişi online`}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
      >
        <span
          className="relative inline-flex h-2 w-2 shrink-0"
          aria-hidden
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--feedback-success)] opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--feedback-success)]" />
        </span>
        <span className="hidden sm:inline font-medium tabular-nums">
          {onlineCount}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg z-50">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--foreground)]">
              Aktif kullanıcılar ({onlineCount})
            </p>
          </div>
          <ul className="max-h-80 overflow-auto p-1">
            {onlineUsers.map((u) => {
              const isSelf = u.userId === user?.id;
              return (
                <li
                  key={u.userId}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
                    isSelf && "bg-[var(--surface)]"
                  )}
                >
                  <span
                    className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[var(--feedback-success)]"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {u.displayName || u.email.split("@")[0]}
                      {isSelf && (
                        <span className="ml-1 text-xs text-[var(--muted-foreground)] font-normal">
                          (Siz)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {ROLE_LABELS[u.role] ?? u.role}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
