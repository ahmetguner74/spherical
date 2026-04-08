"use client";

import type { InfoEntry } from "@/types/iha";

interface InfoCardProps {
  entry: InfoEntry;
  onClick: () => void;
}

function copy(text: string, e: React.MouseEvent) {
  e.stopPropagation();
  navigator.clipboard.writeText(text);
}

export function InfoCard({ entry, onClick }: InfoCardProps) {
  return (
    <div
      onClick={onClick}
      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--background)]">
        <span className="text-xs font-semibold text-[var(--foreground)]">{entry.title}</span>
      </div>
      <table className="w-full">
        <tbody>
          {entry.fields.map((field, idx) => (
            <tr key={idx} className="border-b border-[var(--border)] last:border-0">
              <td className="px-3 py-1 text-[11px] text-[var(--muted-foreground)] whitespace-nowrap w-[1%]">
                {field.key}
              </td>
              <td className="px-3 py-1 text-[11px] text-[var(--foreground)] font-mono">
                <button
                  onClick={(e) => copy(field.value, e)}
                  title="Tıkla kopyala"
                  className="hover:text-[var(--accent)] transition-colors select-all text-left"
                >
                  {field.value}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
