import { formatDate } from "@/lib/utils";
import type { Work } from "@/types";
import { WorkStatusBadge } from "./WorkStatusBadge";

interface WorksTableProps {
  works: Work[];
  onSelect: (work: Work) => void;
}

export function WorksTable({ works, onSelect }: WorksTableProps) {
  if (works.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
            <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">İş Adı</th>
            <th className="hidden sm:table-cell px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">Müşteri</th>
            <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">Tarih</th>
            <th className="px-4 py-3 text-left font-medium text-[var(--muted-foreground)]">Durum</th>
          </tr>
        </thead>
        <tbody>
          {works.map((work) => (
            <WorkRow key={work.id} work={work} onClick={() => onSelect(work)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkRow({ work, onClick }: { work: Work; onClick: () => void }) {
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
