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
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
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
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onSelect(item)}
              className="border-b border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 px-3 ${col.hidden ? HIDDEN_CLASS[col.hidden] : ""}`}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
