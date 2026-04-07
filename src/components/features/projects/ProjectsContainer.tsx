"use client";

import { PROJECTS } from "./projectsData";
import { ProjectCard } from "./ProjectCard";

export function ProjectsContainer() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PROJECTS.map((project) => (
        <ProjectCard key={project.title} project={project} />
      ))}
    </div>
  );
}
