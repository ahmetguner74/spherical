"use client";

import { IHA_TAB_LABELS } from "@/types/iha";
import type { IhaTab } from "@/types/iha";

const TABS: IhaTab[] = [
  "dashboard",
  "operations",
  "inventory",
  "personnel",
  "storage",
];

interface IhaTabNavProps {
  activeTab: IhaTab;
  onTabChange: (tab: IhaTab) => void;
}

export function IhaTabNav({ activeTab, onTabChange }: IhaTabNavProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] pb-0">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg border-b-2 ${
            activeTab === tab
              ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
          }`}
        >
          {IHA_TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
