"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[var(--border)] pt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider hover:text-[var(--foreground)] transition-colors"
      >
        {title}
        <span className="text-sm">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pt-2 space-y-3">{children}</div>}
    </div>
  );
}
