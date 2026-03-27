"use client";

import type { FlightLog } from "@/types/iha";
import { OPERATION_TYPE_LABELS, PPK_STATUS_LABELS } from "@/types/iha";
import { Badge } from "@/components/ui/Badge";

interface FlightLogTableProps {
  logs: FlightLog[];
  onSelect: (log: FlightLog) => void;
}

export function FlightLogTable({ logs, onSelect }: FlightLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        Henüz uçuş/tarama kaydı yok. Yeni kayıt ekleyin.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase">Tarih</th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase">Tip</th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden sm:table-cell">Konum</th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">Pilot</th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden md:table-cell">Ekipman</th>
            <th className="text-left py-3 px-3 text-xs font-medium text-[var(--muted-foreground)] uppercase hidden lg:table-cell">PPK</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} onClick={() => onSelect(log)} className="border-b border-[var(--border)] hover:bg-[var(--surface)] cursor-pointer transition-colors">
              <td className="py-3 px-3 text-[var(--foreground)] font-medium">{log.date}</td>
              <td className="py-3 px-3">
                <Badge>{OPERATION_TYPE_LABELS[log.type]}</Badge>
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] text-xs hidden sm:table-cell">
                {log.location.ilce ? `${log.location.il}/${log.location.ilce}` : "-"}
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] hidden md:table-cell">
                {log.pilotName ?? "-"}
              </td>
              <td className="py-3 px-3 text-[var(--muted-foreground)] hidden md:table-cell">
                {log.equipmentName ?? "-"}
              </td>
              <td className="py-3 px-3 hidden lg:table-cell">
                {log.ppkStatus ? (
                  <Badge variant={log.ppkStatus === "tamamlandi" ? "success" : log.ppkStatus === "hata" ? "danger" : "warning"}>
                    {PPK_STATUS_LABELS[log.ppkStatus]}
                  </Badge>
                ) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
