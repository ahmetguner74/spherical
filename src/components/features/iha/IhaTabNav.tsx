"use client";

import { useState } from "react";
import { IHA_TAB_LABELS } from "@/types/iha";
import type { IhaTab } from "@/types/iha";
import { Modal } from "@/components/ui/Modal";

const TABS: IhaTab[] = [
  "dashboard",
  "map",
  "operations",
  "permissions",
  "inventory",
  "personnel",
  "infoBank",
  "reports",
  "settings",
];

// Mobilde alt bar'da gösterilecek ana sekmeler
const MOBILE_PRIMARY: IhaTab[] = ["dashboard", "map", "operations", "permissions"];

interface IhaTabNavProps {
  activeTab: IhaTab;
  onTabChange: (tab: IhaTab) => void;
}

export function IhaTabNav({ activeTab, onTabChange }: IhaTabNavProps) {
  return (
    <>
      {/* Masaüstü: yatay sekmeler */}
      <div className="hidden md:flex gap-1 border-b border-[var(--border)] pb-0 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors rounded-t-lg border-b-2 ${
              activeTab === tab
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
            }`}
          >
            {IHA_TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Mobil: sadece aktif sekmenin adı başlık olarak görünür */}
      <div className="md:hidden border-b border-[var(--border)] pb-2">
        <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
          {IHA_TAB_LABELS[activeTab]}
        </p>
      </div>

      {/* Mobil: alt sabit tab bar */}
      <MobileBottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </>
  );
}

/* ─── Mobil Alt Tab Bar ─── */
function MobileBottomNav({ activeTab, onTabChange }: IhaTabNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const otherTabs = TABS.filter((t) => !MOBILE_PRIMARY.includes(t));
  const isInMore = otherTabs.includes(activeTab);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
          {MOBILE_PRIMARY.map((tab) => (
            <BottomNavButton
              key={tab}
              label={IHA_TAB_LABELS[tab]}
              icon={TAB_ICONS[tab]}
              active={activeTab === tab}
              onClick={() => onTabChange(tab)}
            />
          ))}
          <BottomNavButton
            label="Daha"
            icon="⋯"
            active={isInMore}
            onClick={() => setMoreOpen(true)}
          />
        </div>
      </nav>

      {/* Daha fazla sekme için bottom sheet */}
      <Modal open={moreOpen} onClose={() => setMoreOpen(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Diğer Sekmeler</h2>
        <div className="grid grid-cols-2 gap-2">
          {otherTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { onTabChange(tab); setMoreOpen(false); }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border min-h-[56px] text-left transition-colors ${
                activeTab === tab
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <span className="text-xl">{TAB_ICONS[tab]}</span>
              <span className="text-sm font-medium">{IHA_TAB_LABELS[tab]}</span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}

function BottomNavButton({ label, icon, active, onClick }: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors ${
        active
          ? "text-[var(--accent)]"
          : "text-[var(--muted-foreground)]"
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[10px] mt-0.5 font-medium truncate max-w-full px-1">{label}</span>
    </button>
  );
}

const TAB_ICONS: Record<IhaTab, string> = {
  dashboard: "🏠",
  map: "🗺️",
  operations: "📋",
  permissions: "📄",
  inventory: "📦",
  personnel: "👥",
  infoBank: "📚",
  reports: "📊",
  settings: "⚙️",
};
