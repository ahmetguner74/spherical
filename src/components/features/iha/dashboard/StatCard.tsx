"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

export function StatCard({ title, value, subtitle, accent }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
        {title}
      </p>
      <p
        className={`text-2xl font-bold mt-1 ${
          accent ? "text-[var(--accent)]" : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
