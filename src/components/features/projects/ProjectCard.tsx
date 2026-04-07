import type { Project } from "./projectsData";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-hover)]">
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
  );
}
