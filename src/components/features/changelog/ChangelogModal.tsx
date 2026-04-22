"use client";

import { useEffect, useMemo, useState } from "react";
import { IconClose as CloseIcon } from "@/config/icons";
import { VERSION } from "@/config/version";
import {
  changelog, normalizeChange,
  CHANGE_TYPE_LABELS, CHANGE_TYPE_COLORS,
  type ChangeType, type ChangelogEntry,
} from "@/config/changelog";

import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/config/permissions";

interface ChangelogModalProps {
  onClose: () => void;
}

const ALL_TYPES: ChangeType[] = ["feat", "fix", "refactor", "perf", "docs", "chore"];

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  const { profile } = useAuth();
  const canSee = profile ? hasPermission(profile.role, "system.changelog") : false;

  const [filterType, setFilterType] = useState<ChangeType | "all">("all");
  const [expandedVersion, setExpandedVersion] = useState<string | null>(changelog[0]?.version ?? null);

  useEffect(() => {
    if (!canSee) {
      onClose();
    }
  }, [canSee, onClose]);

  // İstatistikler
  const stats = useMemo(() => {
    const counts: Record<ChangeType, number> = { feat: 0, fix: 0, refactor: 0, perf: 0, docs: 0, chore: 0 };
    let totalChanges = 0;
    changelog.forEach((entry) => {
      entry.changes.forEach((c) => {
        const item = normalizeChange(c);
        counts[item.type]++;
        totalChanges++;
      });
    });
    return { counts, totalChanges, totalVersions: changelog.length };
  }, []);

  // Filtreleme
  const filteredEntries = useMemo(() => {
    if (filterType === "all") return changelog;
    return changelog
      .map((entry) => ({
        ...entry,
        changes: entry.changes.filter((c) => normalizeChange(c).type === filterType),
      }))
      .filter((entry) => entry.changes.length > 0);
  }, [filterType]);

  // İlk tarih
  const firstDate = changelog[changelog.length - 1]?.date ?? "";
  const daysSinceStart = Math.floor(
    (Date.now() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (!canSee) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Kapat"
      />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--background)] sm:rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)]">Changelog</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {VERSION.display} · {stats.totalVersions} sürüm · {stats.totalChanges} değişiklik · {daysSinceStart} gün
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* İstatistik çubukları */}
          <div className="flex gap-1 h-1.5 rounded-full overflow-hidden mb-3">
            {ALL_TYPES.map((type) => (
              stats.counts[type] > 0 ? (
                <div
                  key={type}
                  className="rounded-full transition-all"
                  style={{
                    backgroundColor: CHANGE_TYPE_COLORS[type],
                    flex: stats.counts[type],
                  }}
                  title={`${CHANGE_TYPE_LABELS[type]}: ${stats.counts[type]}`}
                />
              ) : null
            ))}
          </div>

          {/* Filtre butonları */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            <FilterBtn
              label={`Tümü (${stats.totalChanges})`}
              active={filterType === "all"}
              onClick={() => setFilterType("all")}
            />
            {ALL_TYPES.map((type) => (
              stats.counts[type] > 0 ? (
                <FilterBtn
                  key={type}
                  label={`${CHANGE_TYPE_LABELS[type]} (${stats.counts[type]})`}
                  color={CHANGE_TYPE_COLORS[type]}
                  active={filterType === type}
                  onClick={() => setFilterType(type)}
                />
              ) : null
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="relative">
            {/* Sol çizgi */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-[var(--border)]" />

            <div className="space-y-1">
              {filteredEntries.map((entry, idx) => (
                <VersionEntry
                  key={entry.version}
                  entry={entry}
                  isLatest={idx === 0 && filterType === "all"}
                  isExpanded={expandedVersion === entry.version}
                  onToggle={() => setExpandedVersion(
                    expandedVersion === entry.version ? null : entry.version
                  )}
                />
              ))}
            </div>
          </div>

          {filteredEntries.length === 0 && (
            <p className="text-center text-sm text-[var(--muted-foreground)] py-8">
              Bu kategoride değişiklik yok.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function VersionEntry({
  entry, isLatest, isExpanded, onToggle,
}: {
  entry: ChangelogEntry;
  isLatest: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative pl-8">
      {/* Timeline noktası */}
      <div className={`absolute left-1.5 top-3 w-3 h-3 rounded-full border-2 ${
        isLatest
          ? "bg-[var(--accent)] border-[var(--accent)]"
          : "bg-[var(--background)] border-[var(--border)]"
      }`} />

      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left rounded-lg p-3 hover:bg-[var(--surface)] transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-bold ${isLatest ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
            v{entry.version}
          </span>
          {isLatest && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-medium uppercase tracking-wider">
              Güncel
            </span>
          )}
          <span className="text-xs text-[var(--muted-foreground)]">{entry.date}</span>
          <span className="text-xs text-[var(--muted-foreground)] ml-auto">
            {entry.changes.length} değişiklik
          </span>
          <span className="text-xs text-[var(--muted-foreground)] transition-transform" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0)" }}>
            ▶
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="pl-3 pb-3 space-y-1.5">
          {entry.changes.map((c, i) => {
            const item = normalizeChange(c);
            return (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span
                  className="mt-0.5 shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
                  style={{
                    backgroundColor: `${CHANGE_TYPE_COLORS[item.type]}15`,
                    color: CHANGE_TYPE_COLORS[item.type],
                  }}
                >
                  {item.type}
                </span>
                <span className="text-[var(--muted-foreground)]">{item.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterBtn({
  label, color, active, onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
        active
          ? "font-medium"
          : "text-[var(--muted-foreground)] hover:bg-[var(--surface)]"
      }`}
      style={active && color ? { backgroundColor: `${color}20`, color } : active ? { backgroundColor: "var(--accent)", color: "white" } : {}}
    >
      {label}
    </button>
  );
}
