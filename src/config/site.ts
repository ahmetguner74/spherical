import type { NavItem } from "@/types";

export const siteConfig = {
  name: "Spherical",
  title: "Ahmet Guner - Spherical Platform",
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

export const platformNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", requiresAuth: true },
  { label: "3D Viewer", href: "/viewer", requiresAuth: true },
];
