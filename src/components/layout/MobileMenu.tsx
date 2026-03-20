"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CloseIcon } from "@/components/ui/Icons";
import { mainNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-50 bg-[var(--background)]">
      <div className="flex h-14 items-center justify-between px-4">
        <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
          {siteConfig.name.toLowerCase()}
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

      <nav className="flex flex-col gap-1 px-4 pt-8">
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
    </div>
  );
}
