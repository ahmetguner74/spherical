import { SkillCard } from "./SkillCard";

const SKILLS = [
  "TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS",
  "Three.js", "CesiumJS", "PostgreSQL", "Supabase", "Docker",
  "Git", "REST API", "GraphQL", "Rust",
];

interface ExperienceItem {
  title: string;
  period: string;
  description: string;
}

const EXPERIENCE: ExperienceItem[] = [
  {
    title: "Full-Stack Geliştirici",
    period: "Freelance · 2023 - Devam Ediyor",
    description: "Modern web uygulamaları ve 3D deneyimler.",
  },
];

export function AboutContainer() {
  return (
    <div className="space-y-10">
      <section>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
          Yazılım geliştirici. Modern web teknolojileri, 3D görselleştirme ve
          GIS uygulamaları üzerine çalışıyorum. Temiz kod, iyi tasarım ve
          kullanıcı deneyimine önem veriyorum.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Teknolojiler
        </h2>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <SkillCard key={skill} label={skill} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Deneyim
        </h2>
        <div className="flex flex-col gap-4">
          {EXPERIENCE.map((exp) => (
            <div key={exp.title} className="border-l-2 border-[var(--accent)] pl-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                {exp.title}
              </h3>
              <p className="text-xs text-[var(--accent)]">{exp.period}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
