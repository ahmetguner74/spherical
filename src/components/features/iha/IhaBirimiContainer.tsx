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
const PermissionsTab = lazy(() =>
  import("./permissions/PermissionsPanel").then((m) => ({ default: m.PermissionsPanel }))
);
const FlightLogTab = lazy(() =>
  import("./flight-log/FlightLogTab").then((m) => ({ default: m.FlightLogTab }))
);
const MapTab = lazy(() =>
  import("./map/MapTab").then((m) => ({ default: m.MapTab }))
);
const InventoryTab = lazy(() =>
  import("./inventory/InventoryTab").then((m) => ({ default: m.InventoryTab }))
);
const PersonnelTab = lazy(() =>
  import("./personnel/PersonnelTab").then((m) => ({ default: m.PersonnelTab }))
);
const StorageTab = lazy(() =>
  import("./storage/StorageTab").then((m) => ({ default: m.StorageTab }))
);
const ReportsTab = lazy(() =>
  import("./reports/ReportsTab").then((m) => ({ default: m.ReportsTab }))
);

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
      Yükleniyor...
    </div>
  );
}

export function IhaBirimiContainer() {
  const { activeTab, setActiveTab } = useIhaData();

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          CBS İHA Birimi
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Operasyon Yönetim Paneli
        </p>
      </div>

      <IhaTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <Suspense fallback={<TabLoading />}>
        {activeTab === "dashboard" && <IhaDashboard />}
        {activeTab === "operations" && <OperationsTab />}
        {activeTab === "permissions" && <PermissionsTab />}
        {activeTab === "flightLog" && <FlightLogTab />}
        {activeTab === "map" && <MapTab />}
        {activeTab === "inventory" && <InventoryTab />}
        {activeTab === "personnel" && <PersonnelTab />}
        {activeTab === "storage" && <StorageTab />}
        {activeTab === "reports" && <ReportsTab />}
      </Suspense>
    </div>
  );
}
