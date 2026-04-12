"use client";

import { IHA_TAB_LABELS } from "@/types/iha";
import type { IhaTab } from "@/types/iha";
import type { LucideIcon } from "lucide-react";
import {
  IconDashboard, IconMap, IconOperations, IconPermissions,
  IconInventory, IconPersonnel, IconInfoBank, IconReports, IconSettings,
} from "@/config/icons";

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

interface IhaTabNavProps {
  activeTab: IhaTab;
  onTabChange: (tab: IhaTab) => void;
}

export function IhaTabNav({ activeTab, onTabChange }: IhaTabNavProps) {
  return (
    <>
      {/* Masaüstü: yatay sekmeler (üstte) */}
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

      {/* Mobil: alt sabit tab bar — tüm sekmeler yatay scroll */}
      <MobileBottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </>
  );
}

/* ─── Mobil Alt Tab Bar (floating pill stili) ─── */
function MobileBottomNav({ activeTab, onTabChange }: IhaTabNavProps) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <nav className="mx-3 mb-1 rounded-2xl bg-[var(--surface)]/80 backdrop-blur-xl border border-[var(--border)]/40 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="flex overflow-x-auto no-scrollbar p-1.5 gap-0.5">
          {TABS.map((tab) => (
            <BottomNavButton
              key={tab}
              label={IHA_TAB_LABELS[tab]}
              Icon={TAB_ICONS[tab]}
              active={activeTab === tab}
              onClick={() => onTabChange(tab)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

function BottomNavButton({ label, Icon, active, onClick }: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex flex-col items-center justify-center py-2 px-3 min-w-[64px] rounded-xl transition-all duration-200 ${
        active
          ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm"
          : "text-[var(--muted-foreground)] active:scale-90"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
      <span className={`text-[10px] mt-1 whitespace-nowrap ${
        active ? "font-semibold" : "font-medium"
      }`}>{label}</span>
    </button>
  );
}

const TAB_ICONS: Record<IhaTab, LucideIcon> = {
  dashboard: IconDashboard,
  map: IconMap,
  operations: IconOperations,
  permissions: IconPermissions,
  inventory: IconInventory,
  personnel: IconPersonnel,
  infoBank: IconInfoBank,
  reports: IconReports,
  settings: IconSettings,
};
