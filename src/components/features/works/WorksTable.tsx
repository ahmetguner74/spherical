"use client";

import { formatDate } from "@/lib/utils";
import type { Work } from "@/types";
import { useAuth } from "@/hooks";
import { WorkStatusBadge } from "./WorkStatusBadge";

interface WorksTableProps {
  works: Work[];
  onSelect: (work: Work) => void;
}

export function WorksTable({ works, onSelect }: WorksTableProps) {
  const { isAdmin } = useAuth();

  if (works.length === 0) return <EmptyState />;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
            <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">İş Adı</th>
            <th className="hidden sm:table-cell px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">Müşteri</th>
            <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">Tarih</th>
            {isAdmin && <th className="hidden lg:table-cell px-4 py-3 text-right font-medium text-[var(--muted-foreground)]">Ücret</th>}
            {isAdmin && <th className="hidden lg:table-cell px-4 py-3 text-right font-medium text-[var(--muted-foreground)]">Kalan</th>}
            <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">Durum</th>
          </tr>
        </thead>
        <tbody>
          {works.map((work) => (
            <WorkRow key={work.id} work={work} onClick={() => onSelect(work)} isAdmin={isAdmin} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkRow({ work, onClick, isAdmin }: { work: Work; onClick: () => void; isAdmin: boolean }) {
  const remaining = work.totalFee - work.paidAmount;

  return (
    <tr
      className="border-b border-[var(--border)] last:border-0 cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <div className="font-medium text-[var(--foreground)]">{work.title}</div>
        <div className="text-xs text-[var(--muted-foreground)] line-clamp-1 sm:hidden">{work.client}</div>
      </td>
      <td className="hidden sm:table-cell px-4 py-3 text-[var(--muted-foreground)]">{work.client}</td>
      <td className="hidden md:table-cell px-4 py-3 text-[var(--muted-foreground)]">{formatDate(work.startDate)}</td>
      {isAdmin && (
        <td className="hidden lg:table-cell px-4 py-3 text-right text-[var(--foreground)]">
          {work.totalFee > 0 ? `₺${work.totalFee.toLocaleString("tr-TR")}` : "—"}
        </td>
      )}
      {isAdmin && (
        <td className={`hidden lg:table-cell px-4 py-3 text-right font-medium ${remaining > 0 ? "text-yellow-400" : "text-green-400"}`}>
          {work.totalFee > 0 ? `₺${remaining.toLocaleString("tr-TR")}` : "—"}
        </td>
      )}
      <td className="px-4 py-3"><WorkStatusBadge status={work.status} /></td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-[var(--border)] p-12 text-center">
      <p className="text-[var(--muted-foreground)]">Henüz iş eklenmemiş</p>
    </div>
  );
}
