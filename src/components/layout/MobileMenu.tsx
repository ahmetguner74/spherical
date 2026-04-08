"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CloseIcon } from "@/components/ui/Icons";
import { mainNav, siteConfig } from "@/config/site";
import { VERSION } from "@/config/version";
import { changelog, normalizeChange } from "@/config/changelog";
import { ChangelogModal } from "@/components/features/changelog/ChangelogModal";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const [showChangelog, setShowChangelog] = useState(false);

  const latestEntry = changelog[0];
  const totalChanges = changelog.reduce((sum, e) => sum + e.changes.length, 0);

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
        <button
          onClick={() => setShowChangelog(true)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[var(--accent)]">{VERSION.display}</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {changelog.length} sürüm · {totalChanges} değişiklik
            </span>
          </div>
          {latestEntry && (
            <div className="space-y-1">
              <p className="text-xs text-[var(--muted-foreground)]">
                Son güncelleme: {latestEntry.date}
              </p>
              <p className="text-xs text-[var(--foreground)] line-clamp-2">
                {normalizeChange(latestEntry.changes[0]).text}
              </p>
            </div>
          )}
          <span className="text-xs text-[var(--accent)] mt-2 block">
            Tüm değişiklikleri gör →
          </span>
        </button>
      </div>
    </div>
  );
}
