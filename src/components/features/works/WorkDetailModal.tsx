"use client";

import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import type { Work } from "@/types";
import { useWorkDetail } from "./useWorkDetail";
import { WorkStatusBadge } from "./WorkStatusBadge";
import { WorkFinanceSection } from "./WorkFinanceSection";
import { WorkLocationView } from "./WorkLocationView";
import { WorkWorkerList } from "./WorkWorkerList";
import { WorkPaymentList } from "./WorkPaymentList";

interface WorkDetailModalProps {
  work: Work | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkDetailModal({ work, onClose, onEdit, onDelete }: WorkDetailModalProps) {
  const {
    workers, payments, totalExpenses, paidAmount, payouts, totalSharePercent,
    loading, addWorker, removeWorker, updateShare,
    addExpense, removeExpense, addPayment, removePayment,
  } = useWorkDetail(work?.id ?? null, work?.totalFee ?? 0);

  if (!work) return null;

  return (
    <Modal open={!!work} onClose={onClose}>
      <DetailHeader work={work} />
      <DetailBody work={work} />
      {work.locationLat && work.locationLng && (
        <div className="mt-4">
          <WorkLocationView lat={work.locationLat} lng={work.locationLng} address={work.locationAddress} />
        </div>
      )}
      <div className="mt-4">
        <WorkFinanceSection totalFee={work.totalFee} paidAmount={paidAmount} totalExpenses={totalExpenses} />
      </div>
      <div className="mt-4">
        <WorkPaymentList payments={payments} onAdd={addPayment} onRemove={removePayment} />
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        ) : (
          <WorkWorkerList
            workers={workers}
            payouts={payouts}
            totalSharePercent={totalSharePercent}
            onAddWorker={addWorker}
            onRemoveWorker={removeWorker}
            onUpdateShare={updateShare}
            onAddExpense={addExpense}
            onRemoveExpense={removeExpense}
          />
        )}
      </div>
      <DetailActions onEdit={onEdit} onDelete={onDelete} onClose={onClose} />
    </Modal>
  );
}

function DetailHeader({ work }: { work: Work }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <h2 className="text-lg font-bold text-[var(--foreground)]">{work.title}</h2>
      <WorkStatusBadge status={work.status} />
    </div>
  );
}

function DetailBody({ work }: { work: Work }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-[var(--foreground)] leading-relaxed">{work.description}</p>
      <InfoRow label="Müşteri" value={work.client} />
      <InfoRow label="Başlangıç" value={formatDate(work.startDate)} />
      {work.endDate && <InfoRow label="Bitiş" value={formatDate(work.endDate)} />}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[var(--muted-foreground)] min-w-[80px]">{label}:</span>
      <span className="text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function DetailActions({ onEdit, onDelete, onClose }: { onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  return (
    <div className="mt-6 flex items-center gap-2">
      <button onClick={onEdit} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]">
        Düzenle
      </button>
      <button onClick={onDelete} className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20">
        Sil
      </button>
      <button onClick={onClose} className="ml-auto rounded-lg bg-[var(--surface-hover)] px-4 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--border)]">
        Kapat
      </button>
    </div>
  );
}
