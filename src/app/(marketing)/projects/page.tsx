import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Projeler | Spherical",
  description: "Açık kaynak projeler ve kişisel çalışmalar.",
};

const projects = [
  {
    title: "Spherical",
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

export default function ProjectsPage() {
  return (
    <div className="py-12">
      <Container size="md">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Projeler</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Üzerinde çalıştığım projeler.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-hover)]"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  {project.title}
                </h2>
                <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                  {project.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
