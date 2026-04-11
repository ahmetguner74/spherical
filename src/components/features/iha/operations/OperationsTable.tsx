"use client";

import type { Operation } from "@/types/iha";
import { formatOperationType, OPERATION_STATUS_LABELS, OPERATION_STATUS_VARIANTS } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "../shared/DataTable";

const columns: Column<Operation>[] = [
  {
    key: "title",
    label: "Başlık",
    render: (op) => (
      <div>
        <span className="text-[var(--foreground)] font-medium">{op.title}</span>
        {op.requester && <span className="text-xs text-[var(--muted-foreground)] block">{op.requester}</span>}
      </div>
    ),
  },
  {
    key: "type",
    label: "Tip",
    hidden: "sm",
    render: (op) => <span className="text-[var(--muted-foreground)] text-xs">{formatOperationType(op)}</span>,
  },
  {
    key: "location",
    label: "Konum",
    hidden: "md",
    render: (op) => (
      <span className="text-[var(--muted-foreground)] text-xs">
        {op.location.ilce ? `${op.location.il}/${op.location.ilce}` : "-"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Durum",
    render: (op) => (
      <Badge variant={OPERATION_STATUS_VARIANTS[op.status] ?? "default"}>
        {OPERATION_STATUS_LABELS[op.status]}
      </Badge>
    ),
  },
];

interface OperationsTableProps {
  operations: Operation[];
  onSelect: (operation: Operation) => void;
}

export function OperationsTable({ operations, onSelect }: OperationsTableProps) {
  return (
    <DataTable
      data={operations}
      columns={columns}
      onSelect={onSelect}
      emptyMessage="Henüz operasyon yok."
      keyExtractor={(op) => op.id}
    />
  );
}
