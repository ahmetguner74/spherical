"use client";

import { useState } from "react";
import type { InfoEntry } from "@/types/iha";
import { IconCopy, IconCheck } from "@/config/icons";

interface InfoCardProps {
  entry: InfoEntry;
  onClick: () => void;
}

export function InfoCard({ entry, onClick }: InfoCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copy = (text: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

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
                <div className="flex items-center gap-1">
                  <span className="flex-1 truncate select-all">{field.value}</span>
                  <button
                    onClick={(e) => copy(field.value, idx, e)}
                    title="Kopyala"
                    aria-label={`${field.key} değerini kopyala`}
                    className="shrink-0 p-1 rounded hover:bg-[var(--surface-hover)] transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                  >
                    {copiedIdx === idx
                      ? <IconCheck className="w-3.5 h-3.5 text-[var(--feedback-success)]" />
                      : <IconCopy className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                    }
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
