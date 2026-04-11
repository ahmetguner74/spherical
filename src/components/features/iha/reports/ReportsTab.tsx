"use client";

import { useState, useMemo, useCallback } from "react";
import { useIhaStore } from "../shared/ihaStore";
import type { ReportType, Operation, FlightLog, Equipment, TeamMember, OperationStatusGroup } from "@/types/iha";
import {
  REPORT_TYPE_LABELS, OPERATION_TYPE_LABELS, EQUIPMENT_CATEGORY_LABELS,
  OPERATION_STATUS_LABELS, OPERATION_STATUS_GROUP_LABELS, getStatusGroup,
} from "@/types/iha";
import { inputClass } from "../shared/styles";
import { EmptyState } from "../shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { IHA_CONFIG, getReportYears } from "@/config/iha";
import { IconDownload } from "@/config/icons";

const REPORT_TYPES: ReportType[] = ["ozet", "ekipman", "personel", "talep"];

export function ReportsTab() {
  const { operations, equipment, flightLogs, team } = useIhaStore();
  const [activeReport, setActiveReport] = useState<ReportType>("ozet");

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [showAllTime, setShowAllTime] = useState(false);

  const filterByDate = useCallback((dateStr?: string) => {
    if (showAllTime || !dateStr) return true;
    const d = new Date(dateStr);
    return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
  }, [showAllTime, filterMonth, filterYear]);

  const filteredOps = useMemo(
    () => showAllTime ? operations : operations.filter((op) => filterByDate(op.startDate || op.createdAt)),
    [operations, filterByDate, showAllTime]
  );

  const filteredLogs = useMemo(
    () => showAllTime ? flightLogs : flightLogs.filter((fl) => filterByDate(fl.date)),
    [flightLogs, filterByDate, showAllTime]
  );

  const periodLabel = showAllTime ? "Tüm Zamanlar" : `${IHA_CONFIG.monthNames[filterMonth]} ${filterYear}`;

  const handleExcelExport = async () => {
    const { exportReportToExcel } = await import("./excelExport");
    exportReportToExcel(filteredOps, filteredLogs, periodLabel);
  };

  return (
    <div className="space-y-6">
      {/* Üst bar: Rapor tipi + tarih filtresi */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {REPORT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveReport(type)}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                activeReport === type
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
              }`}
            >
              {REPORT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterMonth}
            onChange={(e) => { setFilterMonth(Number(e.target.value)); setShowAllTime(false); }}
            className={inputClass}
            disabled={showAllTime}
          >
            {IHA_CONFIG.monthNames.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => { setFilterYear(Number(e.target.value)); setShowAllTime(false); }}
            className={inputClass}
            disabled={showAllTime}
          >
            {getReportYears().map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAllTime(!showAllTime)}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
              showAllTime
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted-foreground)]"
            }`}
          >
            Tümü
          </button>
          <Button size="sm" variant="outline" onClick={handleExcelExport} disabled={filteredOps.length === 0}>
            <IconDownload size={14} className="mr-1" /> Excel İndir
          </Button>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Dönem: <span className="font-medium text-[var(--foreground)]">{periodLabel}</span>
        {" · "}{filteredOps.length} operasyon · {filteredLogs.length} uçuş kaydı
      </p>

      {filteredOps.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Bu dönemde veri yok"
          description="Tarih aralığını değiştirin veya daha sonra tekrar deneyin"
        />
      ) : (
        <>
          {activeReport === "ozet" && <SummaryReport operations={filteredOps} flightLogs={filteredLogs} />}
          {activeReport === "ekipman" && <EquipmentReport equipment={equipment} flightLogs={filteredLogs} />}
          {activeReport === "personel" && <PersonnelReport team={team} operations={filteredOps} flightLogs={filteredLogs} />}
          {activeReport === "talep" && <RequestReport operations={filteredOps} />}
        </>
      )}
    </div>
  );
}

function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">{title}</h3>
      {children}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
      <span className="text-sm font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}

const GROUP_COLORS: Record<OperationStatusGroup, { dot: string; bg: string }> = {
  yapilacak: { dot: "#f97316", bg: "rgba(249, 115, 22, 0.08)" },
  yapiliyor: { dot: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)" },
  yapildi: { dot: "#22c55e", bg: "rgba(34, 197, 94, 0.08)" },
};

function SummaryReport({ operations, flightLogs }: { operations: Operation[]; flightLogs: FlightLog[] }) {
  const completed = operations.filter((op) => op.status === "teslim").length;
  const active = operations.filter((op) => op.status !== "teslim" && op.status !== "iptal").length;

  // 3 gruba ayır
  const groups: Record<OperationStatusGroup, Operation[]> = { yapilacak: [], yapiliyor: [], yapildi: [] };
  for (const op of operations) {
    groups[getStatusGroup(op.status)].push(op);
  }

  // Toplam alan (tüm birimler m²'ye çevrilir, en uygun birime format edilir)
  const totalAreaM2 = operations.reduce((sum, op) => {
    const val = op.location.alan ?? 0;
    const unit = op.location.alanBirimi;
    if (unit === "km2") return sum + val * 1_000_000;
    if (unit === "hektar") return sum + val * 10_000;
    return sum + val; // m² varsayılan
  }, 0);

  // Toplam mesafe (çizgi uzunluğu) metre cinsinden
  const totalDistanceM = operations.reduce((sum, op) => sum + (op.location.lineLength ?? 0), 0);

  // Geometri sayıları
  const pointCount = operations.filter((op) => op.location.lat && op.location.lng && !op.location.polygonCoordinates && !op.location.lineCoordinates).length;
  const polygonCount = operations.filter((op) => op.location.polygonCoordinates && op.location.polygonCoordinates.length >= 3).length;
  const lineCount = operations.filter((op) => op.location.lineCoordinates && op.location.lineCoordinates.length >= 2).length;

  const typeCounts = operations.reduce((acc, op) => {
    acc[op.type] = (acc[op.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ReportCard title="Genel İstatistikler">
        <StatRow label="Toplam Operasyon" value={operations.length} />
        <StatRow label="Tamamlanan" value={completed} />
        <StatRow label="Aktif" value={active} />
        <StatRow label="Uçuş/Tarama Kaydı" value={flightLogs.length} />
      </ReportCard>

      <ReportCard title="Konum & Ölçüm">
        <StatRow label="Toplam Alan" value={totalAreaM2 > 0 ? formatTotalArea(totalAreaM2) : "-"} />
        <StatRow label="Toplam Mesafe" value={totalDistanceM > 0 ? formatTotalDistance(totalDistanceM) : "-"} />
        <StatRow label="Nokta Operasyonlar" value={pointCount} />
        <StatRow label="Alan (Poligon) Operasyonlar" value={polygonCount} />
        <StatRow label="Çizgi Operasyonlar" value={lineCount} />
      </ReportCard>

      <ReportCard title="Operasyon Tiplerine Göre">
        {Object.entries(typeCounts).map(([type, count]) => (
          <StatRow key={type} label={OPERATION_TYPE_LABELS[type as keyof typeof OPERATION_TYPE_LABELS] ?? type} value={count} />
        ))}
        {Object.keys(typeCounts).length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">Bu dönemde veri yok</p>
        )}
      </ReportCard>

      {/* Durum Grupları — 3 sütun, tam liste */}
      <div className="md:col-span-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Durum Grupları (Tüm Operasyonlar)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["yapilacak", "yapiliyor", "yapildi"] as OperationStatusGroup[]).map((group) => (
            <GroupColumn key={group} group={group} ops={groups[group]} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupColumn({ group, ops }: { group: OperationStatusGroup; ops: Operation[] }) {
  const colors = GROUP_COLORS[group];
  const [expanded, setExpanded] = useState(false);
  const MAX_VISIBLE = 10;
  const visible = expanded ? ops : ops.slice(0, MAX_VISIBLE);
  const hidden = ops.length - visible.length;

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: colors.dot + "40", backgroundColor: colors.bg }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.dot }} />
        <h4 className="text-sm font-semibold text-[var(--foreground)]">
          {OPERATION_STATUS_GROUP_LABELS[group]}
        </h4>
        <span className="text-xs text-[var(--muted-foreground)] ml-auto">{ops.length}</span>
      </div>
      {ops.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)] italic">Bu grupta operasyon yok</p>
      ) : (
        <ul className="space-y-1.5">
          {visible.map((op) => (
            <li key={op.id} className="text-xs text-[var(--foreground)] border-l-2 pl-2 py-0.5" style={{ borderColor: colors.dot + "80" }}>
              <div className="font-medium truncate">{op.title}</div>
              <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                {OPERATION_STATUS_LABELS[op.status]}
                {op.location.ilce && ` · ${op.location.ilce}`}
                {op.startDate && ` · ${op.startDate}`}
              </div>
            </li>
          ))}
          {hidden > 0 && (
            <li>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                +{hidden} daha göster…
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/** m² → en uygun birim */
function formatTotalArea(m2: number): string {
  if (m2 >= 1_000_000) return `${(m2 / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} km²`;
  if (m2 >= 10_000) return `${(m2 / 10_000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} hektar`;
  return `${Math.round(m2).toLocaleString("tr-TR")} m²`;
}

/** metre → en uygun birim */
function formatTotalDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} km`;
  return `${Math.round(m).toLocaleString("tr-TR")} m`;
}

function EquipmentReport({ equipment, flightLogs }: { equipment: Equipment[]; flightLogs: FlightLog[] }) {
  const usageMap = flightLogs.reduce((acc, fl) => {
    if (fl.equipmentId) {
      if (!acc[fl.equipmentId]) acc[fl.equipmentId] = { flights: 0, totalMinutes: 0 };
      acc[fl.equipmentId].flights++;
      acc[fl.equipmentId].totalMinutes += fl.duration ?? 0;
    }
    return acc;
  }, {} as Record<string, { flights: number; totalMinutes: number }>);

  const catCounts = equipment.reduce((acc, eq) => {
    acc[eq.category] = (acc[eq.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ReportCard title="Kategoriye Göre Ekipman">
        {Object.entries(catCounts).map(([cat, count]) => (
          <StatRow key={cat} label={EQUIPMENT_CATEGORY_LABELS[cat as keyof typeof EQUIPMENT_CATEGORY_LABELS] ?? cat} value={count} />
        ))}
      </ReportCard>

      <ReportCard title="Ekipman Kullanımı (Bu Dönem)">
        {Object.entries(usageMap).length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">Bu dönemde kullanım verisi yok</p>
        ) : (
          Object.entries(usageMap).map(([eqId, usage]) => {
            const eq = equipment.find((e) => e.id === eqId);
            return (
              <StatRow key={eqId} label={eq?.name ?? eqId} value={`${usage.flights} uçuş · ${usage.totalMinutes} dk`} />
            );
          })
        )}
      </ReportCard>
    </div>
  );
}

function PersonnelReport({ team, operations, flightLogs }: { team: TeamMember[]; operations: Operation[]; flightLogs: FlightLog[] }) {
  const memberStats = team.map((member) => ({
    ...member,
    operationCount: operations.filter((op) => op.assignedTeam.includes(member.id)).length,
    flightCount: flightLogs.filter((fl) => fl.pilotId === member.id).length,
  }));

  return (
    <ReportCard title="Personel Performansı (Bu Dönem)">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-2 text-xs text-[var(--muted-foreground)]">Kişi</th>
              <th className="text-left py-2 text-xs text-[var(--muted-foreground)]">Rol</th>
              <th className="text-right py-2 text-xs text-[var(--muted-foreground)]">Operasyon</th>
              <th className="text-right py-2 text-xs text-[var(--muted-foreground)]">Uçuş</th>
            </tr>
          </thead>
          <tbody>
            {memberStats.map((m) => (
              <tr key={m.id} className="border-b border-[var(--border)]">
                <td className="py-2 text-[var(--foreground)]">{m.name}</td>
                <td className="py-2 text-[var(--muted-foreground)]">{m.profession ?? "—"}</td>
                <td className="py-2 text-right text-[var(--foreground)]">{m.operationCount}</td>
                <td className="py-2 text-right text-[var(--foreground)]">{m.flightCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportCard>
  );
}

function RequestReport({ operations }: { operations: Operation[] }) {
  const requesterCounts = operations.reduce((acc, op) => {
    const req = op.requester || "Belirtilmemiş";
    acc[req] = (acc[req] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(requesterCounts).sort((a, b) => b[1] - a[1]);

  return (
    <ReportCard title="Talep Analizi (Birime Göre)">
      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">Bu dönemde veri yok</p>
      ) : (
        sorted.map(([requester, count]) => (
          <StatRow key={requester} label={requester} value={count} />
        ))
      )}
    </ReportCard>
  );
}

