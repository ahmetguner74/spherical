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
  { label: "Hakkımda", href: "/about" },
];

export const features = {
  commandPalette: false,
  search: false,
  auth: true,
  blog: true,
  projects: true,
  viewer3d: false,
  gis: false,
  admin: false,
} as const;

export type FeatureKey = keyof typeof features;
