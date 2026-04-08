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
  { label: "Projeler", href: "/projects" },
  { label: "Hakkımızda", href: "/about" },
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
} as const;

export type FeatureKey = keyof typeof features;
