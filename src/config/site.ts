import type { NavItem } from "@/types";

export const siteConfig = {
  name: "CBS İHA BİRİMİ",
  title: "CBS İHA BİRİMİ",
  description:
    "CBS İHA Birimi operasyon yönetim sistemi ve 3D görselleştirme platformu.",
  url: "https://ahmetguner74.github.io/spherical",
  basePath: "/spherical",
  author: {
    name: "Ahmet Guner",
    github: "https://github.com/ahmetguner74",
  },
  locale: "tr-TR",
} as const;

export const mainNav: NavItem[] = [
  { label: "İHA Birimi", href: "/" },
  { label: "Akademi", href: "/akademi" },
  { label: "Projeler", href: "/projects" },
  { label: "Hakkımızda", href: "/about" },
  { label: "Tasarım", href: "/design" },
];

export const features = {
  commandPalette: false,
  search: false,
  auth: true,
  projects: true,
  viewer3d: false,
  gis: false,
  admin: false,
  ihaBirimi: true,
  akademi: true,
} as const;

export type FeatureKey = keyof typeof features;
