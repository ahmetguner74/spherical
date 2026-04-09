"use client";

import { useState, useEffect, useMemo } from "react";
import type { Operation } from "@/types/iha";
import { formatOperationType } from "@/types/iha";
import { useIhaStore } from "../shared/ihaStore";
import { TYPE_ICONS } from "./calendarConstants";

interface FieldPrepPanelProps {
  selectedDate: string;
  operations: Operation[];
}

export function FieldPrepPanel({ selectedDate, operations }: FieldPrepPanelProps) {
  const { equipment, team } = useIhaStore();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const storageKey = `field-prep-${selectedDate}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setChecked(saved ? new Set(JSON.parse(saved)) : new Set());
  }, [storageKey]);

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  const prepData = useMemo(() => buildPrepData(operations, equipment, team), [operations, equipment, team]);

  if (operations.length === 0) {
    return <EmptyState />;
  }

  const totalItems = prepData.reduce((sum, g) => sum + g.equipmentItems.length + g.teamItems.length, 0);
  const checkedCount = checked.size;

  return (
    <div className="border-t md:border-t-0 md:border-l border-[var(--border)] p-3 space-y-3 bg-[var(--background)]">
      <PrepHeader totalItems={totalItems} checkedCount={checkedCount} />
      {prepData.map((group) => (
        <PrepGroup key={group.opId} group={group} checked={checked} onToggle={toggle} />
      ))}
    </div>
  );
}

/* ─── Header ─── */
function PrepHeader({ totalItems, checkedCount }: { totalItems: number; checkedCount: number }) {
  const percent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Saha Hazırlığı
      </h4>
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
          <span className="text-[10px] text-[var(--muted-foreground)]">{checkedCount}/{totalItems}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Operasyon Grubu ─── */
function PrepGroup({ group, checked, onToggle }: {
  group: PrepGroupData;
  checked: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-base">{group.typeIcon}</span>
        <span className="text-sm font-medium text-[var(--foreground)] truncate">{group.title}</span>
      </div>

      {group.equipmentItems.length > 0 && (
        <ChecklistSection label="Ekipman" items={group.equipmentItems} checked={checked} onToggle={onToggle} />
      )}

      {group.teamItems.length > 0 && (
        <ChecklistSection label="Ekip" items={group.teamItems} checked={checked} onToggle={onToggle} />
      )}

      {group.equipmentItems.length === 0 && group.teamItems.length === 0 && (
        <p className="text-xs text-[var(--muted-foreground)]">Ekipman/ekip atanmamış</p>
      )}
    </div>
  );
}

/* ─── Checklist Section ─── */
function ChecklistSection({ label, items, checked, onToggle }: {
  label: string;
  items: PrepItem[];
  checked: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{label}</span>
      <div className="mt-1 space-y-0.5">
        {items.map((item) => {
          const isDone = checked.has(item.key);
          return (
            <button
              key={item.key}
              onClick={() => onToggle(item.key)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors hover:bg-[var(--surface-hover)] min-h-[36px]"
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
    </div>
  );
}

/* ─── Boş Durum ─── */
function EmptyState() {
  return (
    <div className="border-t md:border-t-0 md:border-l border-[var(--border)] p-3 bg-[var(--background)] flex items-center justify-center">
      <p className="text-sm text-[var(--muted-foreground)]">Gün seçin → saha hazırlığı burada görünür</p>
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
  equipmentItems: PrepItem[];
  teamItems: PrepItem[];
}

function buildPrepData(
  operations: Operation[],
  equipment: { id: string; name: string; model: string; category: string }[],
  teamMembers: { id: string; name: string; role?: string }[],
): PrepGroupData[] {
  const eqMap = new Map(equipment.map((e) => [e.id, e]));
  const tmMap = new Map(teamMembers.map((m) => [m.id, m]));

  return operations.map((op) => ({
    opId: op.id,
    title: op.title || formatOperationType(op),
    typeIcon: TYPE_ICONS[op.type] ?? "📋",
    equipmentItems: (op.assignedEquipment ?? [])
      .map((eqId) => {
        const eq = eqMap.get(eqId);
        return eq
          ? { key: `${op.id}-eq-${eqId}`, label: eq.name, detail: eq.model }
          : null;
      })
      .filter(Boolean) as PrepItem[],
    teamItems: (op.assignedTeam ?? [])
      .map((mId) => {
        const m = tmMap.get(mId);
        return m
          ? { key: `${op.id}-tm-${mId}`, label: m.name, detail: m.role }
          : null;
      })
      .filter(Boolean) as PrepItem[],
  }));
}
