"use client";

import { useState, useMemo } from "react";
import { useIhaStore } from "../shared/ihaStore";
import type { ReportType, Operation, FlightLog, Equipment, TeamMember } from "@/types/iha";
import { REPORT_TYPE_LABELS, OPERATION_TYPE_LABELS, EQUIPMENT_CATEGORY_LABELS } from "@/types/iha";

const REPORT_TYPES: ReportType[] = ["ozet", "ekipman", "personel", "talep"];

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const inputClass =
  "rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function ReportsTab() {
  const { operations, equipment, flightLogs, team } = useIhaStore();
  const [activeReport, setActiveReport] = useState<ReportType>("ozet");

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [showAllTime, setShowAllTime] = useState(false);

  // Tarih filtresi
  const filterByDate = (dateStr?: string) => {
    if (showAllTime || !dateStr) return true;
    const d = new Date(dateStr);
    return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
  };

  const filteredOps = useMemo(
    () => showAllTime ? operations : operations.filter((op) => filterByDate(op.startDate || op.createdAt)),
    [operations, filterMonth, filterYear, showAllTime]
  );

  const filteredLogs = useMemo(
    () => showAllTime ? flightLogs : flightLogs.filter((fl) => filterByDate(fl.date)),
    [flightLogs, filterMonth, filterYear, showAllTime]
  );

  const periodLabel = showAllTime ? "Tüm Zamanlar" : `${MONTH_NAMES[filterMonth]} ${filterYear}`;

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
            {MONTH_NAMES.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => { setFilterYear(Number(e.target.value)); setShowAllTime(false); }}
            className={inputClass}
            disabled={showAllTime}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
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
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Dönem: <span className="font-medium text-[var(--foreground)]">{periodLabel}</span>
        {" · "}{filteredOps.length} operasyon · {filteredLogs.length} uçuş kaydı
      </p>

      {activeReport === "ozet" && <SummaryReport operations={filteredOps} flightLogs={filteredLogs} />}
      {activeReport === "ekipman" && <EquipmentReport equipment={equipment} flightLogs={filteredLogs} operations={filteredOps} />}
      {activeReport === "personel" && <PersonnelReport team={team} operations={filteredOps} flightLogs={filteredLogs} />}
      {activeReport === "talep" && <RequestReport operations={filteredOps} />}
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

function SummaryReport({ operations, flightLogs }: { operations: Operation[]; flightLogs: FlightLog[] }) {
  const completed = operations.filter((op) => op.status === "teslim").length;
  const active = operations.filter((op) => op.status !== "teslim" && op.status !== "iptal").length;
  const totalArea = operations.reduce((sum, op) => sum + (op.location.alan ?? 0), 0);

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
        <StatRow label="Toplam Alan" value={totalArea > 0 ? `${totalArea.toLocaleString()} m²` : "-"} />
      </ReportCard>

      <ReportCard title="Operasyon Tiplerine Göre">
        {Object.entries(typeCounts).map(([type, count]) => (
          <StatRow key={type} label={OPERATION_TYPE_LABELS[type as keyof typeof OPERATION_TYPE_LABELS] ?? type} value={count} />
        ))}
        {Object.keys(typeCounts).length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">Bu dönemde veri yok</p>
        )}
      </ReportCard>
    </div>
  );
}

function EquipmentReport({ equipment, flightLogs, operations }: { equipment: Equipment[]; flightLogs: FlightLog[]; operations: Operation[] }) {
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
                <td className="py-2 text-[var(--muted-foreground)]">{m.role}</td>
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
