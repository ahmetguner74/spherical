"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { OperationsTable } from "./OperationsTable";
import { OperationCard } from "./OperationCard";
import { OperationModal } from "./OperationModal";
import { SelectFilter } from "../shared/ViewToolbar";
import { Button } from "@/components/ui/Button";
import { inputClass } from "../shared/styles";
import type { Operation, OperationStatus, OperationType } from "@/types/iha";
import { OPERATION_STATUS_LABELS, OPERATION_TYPE_LABELS } from "@/types/iha";

const STATUSES: OperationStatus[] = ["talep", "planlama", "saha", "isleme", "kontrol", "teslim", "iptal"];
const TYPES: OperationType[] = ["iha", "lidar", "lidar_el", "lidar_arac", "drone_fotogrametri", "oblik_cekim", "panorama_360"];

export function OperationsTab() {
  const {
    operations, equipment, team, filters, setFilter,
    addOperation, updateOperation, deleteOperation,
  } = useIhaStore();

  const [selectedOp, setSelectedOp] = useState<Operation | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState(filters.searchText ?? "");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const filtered = operations.filter((op) => {
    if (filters.operationStatus !== "all" && op.status !== filters.operationStatus) return false;
    if (filters.operationType !== "all" && op.type !== filters.operationType) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      const searchable = [op.title, op.description, op.requester, op.location?.il, op.location?.ilce].filter(Boolean).join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleAdd = () => { setSelectedOp(undefined); setIsModalOpen(true); };
  const handleSelect = (op: Operation) => { setSelectedOp(op); setIsModalOpen(true); };
  const handleStatusChange = (id: string, status: OperationStatus) => {
    updateOperation(id, { status });
  };

  const handleSave = (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => {
    if (selectedOp) updateOperation(selectedOp.id, data);
    else addOperation(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Arama + Filtreler */}
      <div className="space-y-3">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Operasyon ara... (başlık, talep eden, konum)"
          className={`${inputClass} w-full`}
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <SelectFilter
              value={filters.operationStatus}
              onChange={(v) => setFilter("operationStatus", v as OperationStatus | "all")}
              options={STATUSES.map((s) => ({ value: s, label: OPERATION_STATUS_LABELS[s] }))}
              allLabel="Tüm Durumlar"
            />
            <SelectFilter
              value={filters.operationType}
              onChange={(v) => setFilter("operationType", v as OperationType | "all")}
              options={TYPES.map((t) => ({ value: t, label: OPERATION_TYPE_LABELS[t] }))}
              allLabel="Tüm Tipler"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">{filtered.length} sonuç</span>
            <Button size="sm" onClick={handleAdd}>+ Yeni</Button>
          </div>
        </div>
      </div>

      {/* Mobil: Kartlar */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">Sonuç yok</div>
        ) : (
          paginated.map((op) => (
            <OperationCard
              key={op.id}
              operation={op}
              onSelect={handleSelect}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      {/* Masaüstü: Tablo */}
      <div className="hidden md:block">
        <OperationsTable operations={paginated} onSelect={handleSelect} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)] disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-xs text-[var(--muted-foreground)]">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)] disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}

      <OperationModal
        operation={selectedOp}
        equipment={equipment}
        team={team}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={deleteOperation}
      />
    </div>
  );
}
