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

      {/* Mobil: aktif sekme başlık olarak gösterilir */}
      <div className="md:hidden border-b border-[var(--border)] pb-2">
        <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
          {IHA_TAB_LABELS[activeTab]}
        </p>
      </div>

      {/* Mobil: alt sabit tab bar — tüm sekmeler yatay scroll */}
      <MobileBottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </>
  );
}

/* ─── Mobil Alt Tab Bar (yatay kaydırılabilir) ─── */
function MobileBottomNav({ activeTab, onTabChange }: IhaTabNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] shadow-lg"
    >
      <div className="flex overflow-x-auto no-scrollbar">
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
      className={`shrink-0 flex flex-col items-center justify-center py-2 px-3 min-w-[68px] min-h-[56px] transition-colors ${
        active
          ? "text-[var(--accent)] border-t-2 border-[var(--accent)] bg-[var(--accent)]/5"
          : "text-[var(--muted-foreground)] border-t-2 border-transparent"
      }`}
    >
      <Icon size={18} />
      <span className="text-[10px] mt-0.5 font-medium whitespace-nowrap">{label}</span>
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
