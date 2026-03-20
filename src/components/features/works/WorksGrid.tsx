import type { Work } from "@/types";
import { WorkCard } from "./WorkCard";

interface WorksGridProps {
  works: Work[];
  onSelect: (work: Work) => void;
}

export function WorksGrid({ works, onSelect }: WorksGridProps) {
  if (works.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] p-12 text-center">
        <p className="text-[var(--muted-foreground)]">Henüz iş eklenmemiş</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} onClick={() => onSelect(work)} />
      ))}
    </div>
  );
}
