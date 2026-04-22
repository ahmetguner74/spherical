"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconClose as CloseIcon } from "@/config/icons";
import { mainNav, siteConfig } from "@/config/site";
import { VERSION } from "@/config/version";
import { changelog, normalizeChange } from "@/config/changelog";
import { ChangelogModal } from "@/components/features/changelog/ChangelogModal";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/config/permissions";

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const [showChangelog, setShowChangelog] = useState(false);
  const { profile } = useAuth();

  const latestEntry = changelog[0];
  const totalChanges = changelog.reduce((sum, e) => sum + e.changes.length, 0);
  const canSeeChangelog = profile && hasPermission(profile.role, "system.changelog");

  if (showChangelog) {
    return <ChangelogModal onClose={() => setShowChangelog(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col">
      <div className="flex h-14 items-center justify-between px-4">
        <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
          {siteConfig.name}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Menüyü kapat"
          className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-4 pt-8 flex-1">
        {mainNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "rounded-lg px-4 py-3 text-lg font-medium transition-colors",
                isActive
                  ? "bg-[var(--surface)] text-[var(--accent)]"
                  : "text-[var(--foreground)] hover:bg-[var(--surface)]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Versiyon & Changelog */}
      <div className="px-4 pb-6 pt-4 border-t border-[var(--border)]">
        {canSeeChangelog ? (
          <button
            onClick={() => setShowChangelog(true)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)] transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[var(--accent)]">{VERSION.display}</span>
              <span className="text-[10px] sm:text-xs text-[var(--muted-foreground)] opacity-80">
                {changelog.length} sürüm · {totalChanges} değişiklik
              </span>
            </div>
            {latestEntry && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] opacity-40" />
                  Güncelleme: {VERSION.buildDate}
                </p>
                <p className="text-xs text-[var(--foreground)] line-clamp-2 leading-relaxed">
                  {normalizeChange(latestEntry.changes[0]).text}
                </p>
              </div>
            )}
            <span className="text-xs font-semibold text-[var(--accent)] mt-3 block group-hover:translate-x-1 transition-transform">
              Tüm değişiklikleri gör →
            </span>
          </button>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--accent)]">{VERSION.display}</span>
              <span className="text-[10px] text-[var(--muted-foreground)] opacity-70">Sürüm Bilgisi</span>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-2 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)]/30" />
              Tarih: {VERSION.buildDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
