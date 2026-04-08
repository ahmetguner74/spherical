interface DesignSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DesignSection({ title, description, children }: DesignSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
        {description && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{description}</p>
        )}
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}
