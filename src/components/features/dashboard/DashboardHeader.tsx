"use client";

import Link from "next/link";

import { SunIcon, MoonIcon, MenuIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { useTheme } from "@/hooks/useTheme";
import { useState, useCallback } from "react";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function DashboardHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="flex h-12 items-center justify-between px-4">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[var(--foreground)]"
          >
            {siteConfig.name.toLowerCase()}
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Tema değiştir"
              className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
            >
              {resolvedTheme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Menüyü aç"
              className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--surface)] md:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <nav className="ml-4 hidden items-center gap-1 md:flex">
              <Link href="/" className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]">İHA Birimi</Link>
              <Link href="/projects" className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]">Projeler</Link>
              <Link href="/about" className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]">Hakkımda</Link>
            </nav>
          </div>
        </div>
      </header>

      {menuOpen && <MobileMenu onClose={closeMenu} />}
    </>
  );
}
