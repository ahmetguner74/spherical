interface SkillCardProps {
  label: string;
}

export function SkillCard({ label }: SkillCardProps) {
  return (
    <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]">
      {label}
    </span>
  );
}
