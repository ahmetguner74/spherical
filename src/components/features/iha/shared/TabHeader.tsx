"use client";

interface TabHeaderProps {
  count: number;
  label: string;
  onAdd: () => void;
  addLabel?: string;
}

export function TabHeader({ count, label, onAdd, addLabel }: TabHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-medium text-[var(--muted-foreground)]">
        {count} {label}
      </h2>
      <button
        onClick={onAdd}
        className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
      >
        + {addLabel ?? `Yeni ${label}`}
      </button>
    </div>
  );
}
