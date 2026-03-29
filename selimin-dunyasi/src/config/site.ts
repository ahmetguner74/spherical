export const siteConfig = {
  name: "Selim'in Dünyası",
  description: "5. sınıf eğitim platformu — Matematik, Türkçe, Fen Bilimleri",
  url: "https://ahmetguner74.github.io/selimin-dunyasi",
  basePath: "/selimin-dunyasi",
} as const;

export interface NavItem {
  label: string;
  href: string;
  ikon: string;
}

export const mainNav: NavItem[] = [
  { label: "Ana Sayfa", href: "/", ikon: "🏠" },
  { label: "Matematik", href: "/matematik", ikon: "🧮" },
  { label: "Profilim", href: "/profilim", ikon: "👤" },
];
