"use client";

import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  hidden?: "sm" | "md" | "lg";
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSelect: (item: T) => void;
  emptyMessage: string;
  keyExtractor: (item: T) => string;
  /** Toplu seçim desteği (opsiyonel) */
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
}

const HIDDEN_CLASS = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

export function DataTable<T>({
  data,
  columns,
  onSelect,
  emptyMessage,
  keyExtractor,
  selectMode,
  selectedIds,
  onToggle,
  onToggleAll,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        {emptyMessage}
      </div>
    );
  }

  const allSelected = selectMode && selectedIds && data.length > 0 && data.every((item) => selectedIds.has(keyExtractor(item)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {selectMode && (
              <th className="py-3 px-2 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleAll?.()}
                  className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                  aria-label="Tümünü seç"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase ${
                  col.hidden ? HIDDEN_CLASS[col.hidden] : ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const id = keyExtractor(item);
            const checked = selectMode && selectedIds?.has(id);
            return (
              <tr
                key={id}
                onClick={() => selectMode && onToggle ? onToggle(id) : onSelect(item)}
                className={`border-b border-[var(--border)] cursor-pointer transition-colors ${
                  checked ? "bg-[var(--accent)]/5" : "hover:bg-[var(--surface)]"
                }`}
              >
                {selectMode && (
                  <td className="py-3 px-2 w-8">
                    <input
                      type="checkbox"
                      checked={!!checked}
                      onChange={() => onToggle?.(id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 px-3 ${col.hidden ? HIDDEN_CLASS[col.hidden] : ""}`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
