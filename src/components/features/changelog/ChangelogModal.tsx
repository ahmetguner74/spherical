"use client";

import { CloseIcon } from "@/components/ui/Icons";
import { changelog } from "@/config/changelog";

interface ChangelogModalProps {
  onClose: () => void;
}

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Kapat"
      />

      <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--background)] p-4 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Changelog
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {changelog.map((entry) => (
            <ChangelogEntry key={entry.version} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChangelogEntry({ entry }: { entry: (typeof changelog)[number] }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-md bg-[var(--accent)]/10 px-2 py-0.5 text-sm font-semibold text-[var(--accent)]">
          v{entry.version}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {entry.date}
        </span>
      </div>
      <ul className="space-y-1 pl-1">
        {entry.changes.map((change) => (
          <li
            key={change}
            className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            {change}
          </li>
        ))}
      </ul>
    </div>
  );
}
