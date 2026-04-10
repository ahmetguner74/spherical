"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Operation } from "@/types/iha";
import { formatOperationType } from "@/types/iha";
import { useIhaStore } from "../shared/ihaStore";
import { fetchFieldPrepBatch, toggleFieldPrepItem } from "../shared/ihaStorage";
import { TYPE_ICONS } from "./calendarConstants";

interface FieldPrepPanelProps {
  selectedDate: string;
  operations: Operation[];
}

export function FieldPrepPanel({ selectedDate, operations }: FieldPrepPanelProps) {
  const { equipment, team, updateOperation } = useIhaStore();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const opIds = useMemo(() => operations.map((o) => o.id), [operations]);

  // Supabase'den checklist verisi çek (fallback: localStorage)
  useEffect(() => {
    if (opIds.length === 0) { setChecked(new Set()); return; }
    setLoading(true);
    fetchFieldPrepBatch(opIds)
      .then((map) => {
        const all = new Set<string>();
        for (const s of map.values()) for (const k of s) all.add(k);
        setChecked(all);
      })
      .catch(() => {
        // Tablo henüz yoksa localStorage'dan oku (fallback)
        const saved = localStorage.getItem(`field-prep-${selectedDate}`);
        setChecked(saved ? new Set(JSON.parse(saved)) : new Set());
      })
      .finally(() => setLoading(false));
  }, [opIds, selectedDate]);

  const toggle = useCallback((key: string, operationId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      const willCheck = !next.has(key);
      if (willCheck) next.add(key); else next.delete(key);
      // Supabase'e kaydet (arka planda)
      toggleFieldPrepItem(operationId, key, willCheck).catch(() => {
        // Fallback: localStorage
        localStorage.setItem(`field-prep-${selectedDate}`, JSON.stringify([...next]));
      });
      return next;
    });
  }, [selectedDate]);

  const prepData = useMemo(() => buildPrepData(operations, equipment, team), [operations, equipment, team]);

  const dateLabel = new Date(selectedDate + "T00:00").toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", weekday: "long",
  });

  if (operations.length === 0) {
    return (
      <div className="border-t md:border-t-0 md:border-l border-[var(--border)] p-4 bg-[var(--background)]">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Saha Hazırlığı
        </h4>
        <p className="text-sm text-[var(--muted-foreground)]">{dateLabel}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-2">Bu tarihte planlanmış operasyon yok.</p>
      </div>
    );
  }

  const totalItems = prepData.reduce((sum, g) => sum + g.items.length, 0);
  const checkedCount = [...checked].filter((k) => prepData.some((g) => g.items.some((i) => i.key === k))).length;
  const allDone = totalItems > 0 && checkedCount === totalItems;

  // Sahaya Hazırız → durumu "saha"ya çevir
  const handleReady = () => {
    for (const op of operations) {
      if (op.status === "talep" || op.status === "planlama") {
        updateOperation(op.id, { status: "saha" });
      }
    }
  };

  return (
    <div className="border-t md:border-t-0 md:border-l border-[var(--border)] p-3 space-y-3 bg-[var(--background)]">
      <PrepHeader dateLabel={dateLabel} totalItems={totalItems} checkedCount={checkedCount} />
      {loading ? (
        <p className="text-xs text-[var(--muted-foreground)] text-center py-4">Yükleniyor...</p>
      ) : (
        <>
          {prepData.map((group) => (
            <PrepGroup key={group.opId} group={group} checked={checked} onToggle={toggle} />
          ))}
          {allDone && (
            <button
              onClick={handleReady}
              className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity min-h-[48px]"
            >
              Sahaya Hazırız
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Header ─── */
function PrepHeader({ dateLabel, totalItems, checkedCount }: { dateLabel: string; totalItems: number; checkedCount: number }) {
  const percent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Saha Hazırlığı
        </h4>
        <span className="text-[10px] text-[var(--muted-foreground)]">{dateLabel}</span>
      </div>
      {totalItems > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${percent}%`,
                backgroundColor: percent === 100 ? "var(--status-teslim)" : "var(--accent)",
              }}
            />
          </div>
          <span className="text-[10px] text-[var(--muted-foreground)] font-medium">{checkedCount}/{totalItems}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Operasyon Grubu ─── */
function PrepGroup({ group, checked, onToggle }: {
  group: PrepGroupData;
  checked: Set<string>;
  onToggle: (key: string, operationId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{group.typeIcon}</span>
        <span className="text-sm font-medium text-[var(--foreground)] truncate">{group.title}</span>
      </div>

      {group.items.length > 0 ? (
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const isDone = checked.has(item.key);
            return (
              <button
                key={item.key}
                onClick={() => onToggle(item.key, group.opId)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors hover:bg-[var(--surface-hover)] min-h-[40px]"
              >
                <span className={`shrink-0 w-4 h-4 rounded flex items-center justify-center text-[10px] border transition-colors ${
                  isDone
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                    : "border-[var(--muted-foreground)]/50"
                }`}>
                  {isDone ? "✓" : ""}
                </span>
                <span className={`text-sm ${isDone ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}>
                  {item.label}
                </span>
                {item.detail && (
                  <span className="text-[10px] text-[var(--muted-foreground)] ml-auto shrink-0">{item.detail}</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[var(--muted-foreground)]">Ekipman/ekip atanmamış</p>
      )}
    </div>
  );
}

/* ─── Veri Yapıları ─── */
interface PrepItem {
  key: string;
  label: string;
  detail?: string;
}

interface PrepGroupData {
  opId: string;
  title: string;
  typeIcon: string;
  items: PrepItem[];
}

function buildPrepData(
  operations: Operation[],
  equipment: { id: string; name: string; model: string; category: string }[],
  teamMembers: { id: string; name: string; profession?: string }[],
): PrepGroupData[] {
  const eqMap = new Map(equipment.map((e) => [e.id, e]));
  const tmMap = new Map(teamMembers.map((m) => [m.id, m]));

  return operations.map((op) => {
    const items: PrepItem[] = [];

    // Sadece envanterden gelen ekipmanlar — alt madde/detay yok
    for (const eqId of op.assignedEquipment ?? []) {
      const eq = eqMap.get(eqId);
      if (!eq) continue;
      items.push({ key: `${op.id}-eq-${eqId}`, label: eq.name, detail: eq.model });
    }

    // Ekip üyeleri
    for (const mId of op.assignedTeam ?? []) {
      const m = tmMap.get(mId);
      if (!m) continue;
      items.push({ key: `${op.id}-tm-${mId}`, label: m.name, detail: m.profession });
    }

    return {
      opId: op.id,
      title: op.title || formatOperationType(op),
      typeIcon: TYPE_ICONS[op.type] ?? "📋",
      items,
    };
  });
}
