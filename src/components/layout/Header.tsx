"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Container } from "@/components/ui";
import { IconSun as SunIcon, IconMoon as MoonIcon, IconMenu as MenuIcon } from "@/config/icons";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { mainNav, siteConfig } from "@/config/site";
import { useTheme } from "@/hooks/useTheme";
import { UserMenu } from "@/components/features/auth/UserMenu";
import { OnlineIndicator } from "@/components/layout/OnlineIndicator";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-colors duration-200",
          scrolled
            ? "border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md"
            : "border-transparent bg-[var(--background)]"
        )}
      >
        <Container>
          <div className="flex h-14 items-center justify-between">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
            >
              {siteConfig.name}
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {mainNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[var(--surface)] text-[var(--accent)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <OnlineIndicator />
              <UserMenu />

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Tema değiştir"
                className="ml-2 rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                {resolvedTheme === "dark" ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </button>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <OnlineIndicator />
              <UserMenu />

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Tema değiştir"
                className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              >
                {resolvedTheme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Menüyü aç"
                className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {mobileOpen && <MobileMenu onClose={closeMobile} />}
    </>
  );
}
