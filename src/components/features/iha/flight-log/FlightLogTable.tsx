"use client";

import type { FlightLog } from "@/types/iha";
import { OPERATION_TYPE_LABELS, PPK_STATUS_LABELS } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "../shared/DataTable";

const columns: Column<FlightLog>[] = [
  {
    key: "date",
    label: "Tarih",
    render: (log) => <span className="text-[var(--foreground)] font-medium">{log.date}</span>,
  },
  {
    key: "type",
    label: "Tip",
    render: (log) => <Badge>{OPERATION_TYPE_LABELS[log.type]}</Badge>,
  },
  {
    key: "location",
    label: "Konum",
    hidden: "sm",
    render: (log) => (
      <span className="text-[var(--muted-foreground)] text-xs">
        {log.location.ilce ? `${log.location.il}/${log.location.ilce}` : "-"}
      </span>
    ),
  },
  {
    key: "pilot",
    label: "Pilot",
    hidden: "md",
    render: (log) => <span className="text-[var(--muted-foreground)]">{log.pilotName ?? "-"}</span>,
  },
  {
    key: "equipment",
    label: "Ekipman",
    hidden: "md",
    render: (log) => <span className="text-[var(--muted-foreground)]">{log.equipmentName ?? "-"}</span>,
  },
  {
    key: "ppk",
    label: "PPK",
    hidden: "lg",
    render: (log) =>
      log.ppkStatus ? (
        <Badge variant={log.ppkStatus === "tamamlandi" ? "success" : log.ppkStatus === "hata" ? "danger" : "warning"}>
          {PPK_STATUS_LABELS[log.ppkStatus]}
        </Badge>
      ) : (
        <span className="text-[var(--muted-foreground)]">-</span>
      ),
  },
];

interface FlightLogTableProps {
  logs: FlightLog[];
  onSelect: (log: FlightLog) => void;
}

export function FlightLogTable({ logs, onSelect }: FlightLogTableProps) {
  return (
    <DataTable
      data={logs}
      columns={columns}
      onSelect={onSelect}
      emptyMessage="Henüz uçuş/tarama kaydı yok."
      keyExtractor={(log) => log.id}
    />
  );
}
