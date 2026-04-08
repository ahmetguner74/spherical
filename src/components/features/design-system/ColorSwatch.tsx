"use client";

interface ColorSwatchProps {
  name: string;
  variable: string;
  hex?: string;
}

export function ColorSwatch({ name, variable, hex }: ColorSwatchProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg border border-[var(--border)] shrink-0"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">{name}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{variable}</p>
        {hex && <p className="text-xs text-[var(--muted-foreground)]">{hex}</p>}
      </div>
    </div>
  );
}
