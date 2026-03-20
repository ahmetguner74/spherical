import type { Metadata } from "next";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Hakkımda | Spherical",
  description: "Ahmet Guner - Yazılım geliştirici.",
};

const skills = [
  "TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS",
  "Three.js", "CesiumJS", "PostgreSQL", "Supabase", "Docker",
  "Git", "REST API", "GraphQL", "Rust",
];

export default function AboutPage() {
  return (
    <div className="py-12">
      <Container size="md">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Hakkımda</h1>
        </header>

        <section className="mb-10">
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            Yazılım geliştirici. Modern web teknolojileri, 3D görselleştirme ve
            GIS uygulamaları üzerine çalışıyorum. Temiz kod, iyi tasarım ve
            kullanıcı deneyimine önem veriyorum.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Teknolojiler
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Deneyim
          </h2>
          <div className="flex flex-col gap-4">
            <div className="border-l-2 border-[var(--accent)] pl-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Full-Stack Geliştirici
              </h3>
              <p className="text-xs text-[var(--accent)]">
                Freelance · 2023 - Devam Ediyor
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Modern web uygulamaları ve 3D deneyimler.
              </p>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
