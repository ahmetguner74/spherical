"use client";

import type { Operation } from "@/types/iha";
import { OPERATION_PRIORITY_LABELS } from "@/types/iha";
import { OperationStatusBadge } from "./OperationStatusBadge";

interface OperationsTableProps {
  operations: Operation[];
  onSelect: (operation: Operation) => void;
}

export function OperationsTable({ operations, onSelect }: OperationsTableProps) {
  if (operations.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        Henüz operasyon yok. Yeni operasyon ekleyin.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase">
              Başlık
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">
              Talep Eden
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden sm:table-cell">
              Öncelik
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase">
              Durum
            </th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden lg:table-cell">
              Tarih
            </th>
          </tr>
        </thead>
        <tbody>
          {operations.map((op) => (
            <tr
              key={op.id}
              onClick={() => onSelect(op)}
              className="border-b border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer transition-colors"
            >
              <td className="py-3 px-3 text-[var(--foreground)] font-medium">
                {op.title}
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] hidden md:table-cell">
                {op.requester || "-"}
              </td>
              <td className="py-3 px-3 hidden sm:table-cell">
                <span
                  className={`text-xs ${
                    op.priority === "acil"
                      ? "text-red-500"
                      : op.priority === "yuksek"
                        ? "text-yellow-500"
                        : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {OPERATION_PRIORITY_LABELS[op.priority]}
                </span>
              </td>
              <td className="py-3 px-3">
                <OperationStatusBadge status={op.status} />
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] hidden lg:table-cell">
                {op.startDate ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
