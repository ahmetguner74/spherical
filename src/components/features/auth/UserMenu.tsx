"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { IconLogOut, IconUserCircle } from "@/config/icons";
import { ROLE_LABELS, type UserRole } from "@/config/permissions";

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca kapat
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

  const handleSignOut = useCallback(async () => {
    setOpen(false);
    await signOut();
  }, [signOut]);

  if (!profile) return null;

  const initials = profile.displayName
    ? profile.displayName.slice(0, 2).toUpperCase()
    : profile.email.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Kullanıcı menüsü"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
      >
        <span className="hidden sm:inline truncate max-w-[120px]">
          {profile.displayName || profile.email.split("@")[0]}
        </span>
        <IconUserCircle className="h-5 w-5 sm:h-4 sm:w-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg z-50">
          <div className="p-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {profile.displayName || profile.email.split("@")[0]}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {profile.email}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <span
                className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  profile.role === "viewer"
                    ? "bg-[var(--surface)] text-[var(--muted-foreground)]"
                    : "bg-[var(--feedback-success)]/15 text-[var(--feedback-success)]"
                }`}
              >
                {ROLE_LABELS[(profile.role as UserRole) ?? "viewer"]}
              </span>
            </div>
          </div>

          <div className="p-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--feedback-error)] hover:bg-[var(--surface)] transition-colors"
            >
              <IconLogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
