"use client";

import { lazy, Suspense } from "react";
import { useIhaData } from "./shared/useIhaData";
import { IhaTabNav } from "./IhaTabNav";

const IhaDashboard = lazy(() =>
  import("./dashboard/IhaDashboard").then((m) => ({ default: m.IhaDashboard }))
);
const OperationsTab = lazy(() =>
  import("./operations/OperationsTab").then((m) => ({ default: m.OperationsTab }))
);
const MapTab = lazy(() =>
  import("./map/MapTab").then((m) => ({ default: m.MapTab }))
);
const InventoryTab = lazy(() =>
  import("./inventory/InventoryTab").then((m) => ({ default: m.InventoryTab }))
);
const ReportsTab = lazy(() =>
  import("./reports/ReportsTab").then((m) => ({ default: m.ReportsTab }))
);
const SettingsTab = lazy(() =>
  import("./settings/SettingsTab").then((m) => ({ default: m.SettingsTab }))
);

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
      Yükleniyor...
    </div>
  );
}

export function IhaBirimiContainer() {
  const { activeTab, setActiveTab, loading, reload } = useIhaData();

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            CBS İHA Birimi
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Operasyon Yönetim Paneli
          </p>
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="px-3 py-2 text-xs rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "↻ Yenile"}
        </button>
      </div>

      <IhaTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <Suspense fallback={<TabLoading />}>
        {activeTab === "dashboard" && <IhaDashboard />}
        {activeTab === "operations" && <OperationsTab />}
        {activeTab === "map" && <MapTab />}
        {activeTab === "inventory" && <InventoryTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </Suspense>
    </div>
  );
}
