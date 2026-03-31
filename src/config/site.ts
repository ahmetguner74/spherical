import type { NavItem } from "@/types";

export const siteConfig = {
  name: "Spherical",
  title: "Spherical Platform",
  description:
    "Yazılım projeleri, 3D görselleştirme, proje yönetimi ve teknik blog.",
  url: "https://ahmetguner74.github.io/spherical",
  basePath: "/spherical",
  author: {
    name: "Ahmet Guner",
    github: "https://github.com/ahmetguner74",
  },
  locale: "tr-TR",
} as const;

export const mainNav: NavItem[] = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Projeler", href: "/projects" },
  { label: "İşlerim", href: "/works" },
  { label: "İHA Birimi", href: "/iha-birimi" },
  { label: "Selim", href: "/selim" },
  { label: "Hakkımda", href: "/about" },
  { label: "Kod Haritası", href: "/kod-haritasi" },
];

export const features = {
  commandPalette: false,
  search: false,
  auth: true,
  blog: true,
  projects: true,
  works: true,
  viewer3d: false,
  gis: false,
  admin: false,
  ihaBirimi: true,
  selim: true,
} as const;

export type FeatureKey = keyof typeof features;
