"use client";

import { usePathname } from "next/navigation";
import { Container } from "@/components/ui";
import { IconGitHub as GitHubIcon } from "@/config/icons";
import { siteConfig } from "@/config/site";
import { VersionBadge } from "./VersionBadge";

export function Footer() {
  const pathname = usePathname();
  // İHA paneli (/) mobilinde alt sabit tab bar var → Footer ile çakışıyor ve alt
  // kısımda boşluk gibi görünüyor. Mobilde `/` sayfasında Footer'ı gizliyoruz;
  // mobil kullanıcı versiyon+changelog'a hamburger menüsündeki VersionBadge
  // kartı üzerinden erişir. Masaüstünde alt tab bar yok, Footer normal kalır.
  const isDashboard = pathname === "/";
  return (
    <footer
      className={`${isDashboard ? "hidden md:block" : ""} border-t border-[var(--border)] bg-[var(--background)] py-6`}
    >
      <Container>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-[var(--muted-foreground)]">
              &copy; {new Date().getFullYear()} {siteConfig.author.name}
            </p>
            <VersionBadge />
          </div>

          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <GitHubIcon className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
