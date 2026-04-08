export interface Project {
  title: string;
  description: string;
  tags: string[];
  status: string;
}

export const PROJECTS: Project[] = [
  {
    title: "CBS İHA BİRİMİ",
    description: "Kişisel platform. Next.js, Tailwind CSS ve TypeScript.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "Aktif",
  },
  {
    title: "3D Digital Lab",
    description: "React tabanlı 3D görselleştirme platformu.",
    tags: ["React", "Three.js", "WebGL"],
    status: "Geliştiriliyor",
  },
  {
    title: "CBS 3D Şehir Modeli",
    description: "CesiumJS ile 3D şehir modeli ve GIS uygulaması.",
    tags: ["CesiumJS", "GIS", "3D"],
    status: "Aktif",
  },
  {
    title: "GIS-360",
    description: "Küre fotoğrafların harita üzerinde görüntülenmesi.",
    tags: ["Pannellum", "Harita", "360°"],
    status: "Tamamlandı",
  },
];
