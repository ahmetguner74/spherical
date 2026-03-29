"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, siteConfig } from "@/config/site";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link href="/" style={styles.logo}>
          <span style={{ fontSize: 22 }}>\u26cf\ufe0f</span>
          <span style={styles.logoText}>{siteConfig.name}</span>
        </Link>

        <nav style={styles.nav}>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...styles.navLink,
                color: pathname === item.href ? "#7CFC00" : "#ccc",
                borderBottom:
                  pathname === item.href
                    ? "2px solid #7CFC00"
                    : "2px solid transparent",
              }}
            >
              <span>{item.ikon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={styles.hamburger}
          aria-label="Men\u00fc"
        >
          {menuOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                ...styles.mobileLink,
                color: pathname === item.href ? "#7CFC00" : "#E8F5E9",
              }}
            >
              <span style={{ fontSize: 24 }}>{item.ikon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { position: "sticky", top: 0, zIndex: 40, background: "rgba(26,26,46,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  inner: { maxWidth: 960, margin: "0 auto", padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  logoText: { fontFamily: "'Silkscreen', monospace", fontSize: 14, color: "#7CFC00", letterSpacing: 1 },
  nav: { display: "flex", gap: 8, alignItems: "center" },
  navLink: { display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "all 0.2s", borderRadius: 6 },
  hamburger: { display: "none", fontSize: 24, background: "none", border: "none", color: "#E8F5E9", cursor: "pointer" },
  mobileMenu: { display: "flex", flexDirection: "column", gap: 4, padding: "12px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  mobileLink: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", fontSize: 16, fontWeight: 700, textDecoration: "none", borderRadius: 10, background: "rgba(255,255,255,0.04)" },
};
