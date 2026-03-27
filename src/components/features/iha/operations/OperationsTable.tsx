"use client";

import type { Operation } from "@/types/iha";
import { OPERATION_PRIORITY_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";
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
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase">Başlık</th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden sm:table-cell">Tip</th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">Konum</th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase">Durum</th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden lg:table-cell">Öncelik</th>
          </tr>
        </thead>
        <tbody>
          {operations.map((op) => (
            <tr key={op.id} onClick={() => onSelect(op)} className="border-b border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer transition-colors">
              <td className="py-3 px-3">
                <span className="text-[var(--foreground)] font-medium">{op.title}</span>
                {op.requester && <span className="text-xs text-[var(--muted-foreground)] block">{op.requester}</span>}
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] text-xs hidden sm:table-cell">
                {OPERATION_TYPE_LABELS[op.type]}
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] text-xs hidden md:table-cell">
                {op.location.ilce ? `${op.location.il}/${op.location.ilce}` : "-"}
              </td>
              <td className="py-3 px-3">
                <OperationStatusBadge status={op.status} />
              </td>
              <td className="py-3 px-3 hidden lg:table-cell">
                <span className={`text-xs ${op.priority === "acil" ? "text-red-500" : op.priority === "yuksek" ? "text-yellow-500" : "text-[var(--muted-foreground)]"}`}>
                  {OPERATION_PRIORITY_LABELS[op.priority]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
