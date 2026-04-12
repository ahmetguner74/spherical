"use client";

import { useState, useCallback } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { OperationsTable } from "./OperationsTable";
import { OperationCard } from "./OperationCard";
import { OperationModal } from "./OperationModal";
import { ExcelImportWizard } from "./ExcelImport/ExcelImportWizard";
import { EmptyState } from "../shared/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconFileUp } from "@/config/icons";
import { SelectFilter } from "../shared/ViewToolbar";
import { Button } from "@/components/ui/Button";
import { inputClass } from "../shared/styles";
import type { Operation, OperationStatus, OperationType, OperationStatusGroup } from "@/types/iha";
import { OPERATION_TYPE_LABELS, OPERATION_STATUS_GROUP_LABELS, OPERATION_STATUS_LABELS, getStatusGroup } from "@/types/iha";

const STATUS_GROUPS: OperationStatusGroup[] = ["yapilacak", "yapiliyor", "yapildi"];
const TYPES: OperationType[] = ["iha", "lidar", "lidar_el", "lidar_arac", "drone_fotogrametri", "oblik_cekim", "panorama_360"];

export function OperationsTab() {
  const {
    operations, equipment, team, flightPermissions, filters, setFilter,
    addOperation, updateOperation, deleteOperation,
  } = useIhaStore();

  const [selectedOpId, setSelectedOpId] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [groupFilter, setGroupFilter] = useState<OperationStatusGroup | "all">("all");

  // Toplu seçim
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };

  const handleBulkDelete = () => {
    for (const id of selectedIds) deleteOperation(id);
    exitSelectMode();
  };

  const handleBulkStatus = (status: OperationStatus) => {
    for (const id of selectedIds) updateOperation(id, { status });
    exitSelectMode();
  };

  // Store'dan güncel operasyonu oku
  const selectedOp = selectedOpId ? operations.find((o) => o.id === selectedOpId) : undefined;
  const [searchText, setSearchText] = useState(filters.searchText ?? "");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const filtered = operations.filter((op) => {
    if (groupFilter !== "all" && getStatusGroup(op.status) !== groupFilter) return false;
    if (filters.operationType !== "all" && op.type !== filters.operationType) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      const searchable = [op.title, op.description, op.requester, op.location?.il, op.location?.ilce].filter(Boolean).join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allIds = filtered.map((op) => op.id);
      const allSelected = allIds.every((id) => prev.has(id));
      return allSelected ? new Set<string>() : new Set(allIds);
    });
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleAdd = () => { setSelectedOpId(undefined); setIsModalOpen(true); };
  const handleSelect = (op: Operation) => { setSelectedOpId(op.id); setIsModalOpen(true); };
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
          placeholder="🔍 Ara..."
          className={`${inputClass} w-full`}
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* 3 grup filtre butonları */}
            <div className="flex gap-1">
              <Button
                variant={groupFilter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setGroupFilter("all")}
              >
                Tümü
              </Button>
              {STATUS_GROUPS.map((g) => (
                <Button
                  key={g}
                  variant={groupFilter === g ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setGroupFilter(groupFilter === g ? "all" : g)}
                >
                  {OPERATION_STATUS_GROUP_LABELS[g]}
                </Button>
              ))}
            </div>
            <SelectFilter
              value={filters.operationType}
              onChange={(v) => setFilter("operationType", v as OperationType | "all")}
              options={TYPES.map((t) => ({ value: t, label: OPERATION_TYPE_LABELS[t] }))}
              allLabel="Tüm Tipler"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">{filtered.length} sonuç</span>
            <Button
              size="sm"
              variant={selectMode ? "primary" : "outline"}
              onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
            >
              {selectMode ? "İptal" : "Seç"}
            </Button>
            {!selectMode && (
              <>
                <Button size="sm" variant="ghost" onClick={() => setIsImportOpen(true)}>
                  <IconFileUp size={14} className="mr-1" />
                  Excel
                </Button>
                <Button size="sm" onClick={handleAdd}>+ Yeni</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toplu seçim header */}
      {selectMode && (
        <div className="flex items-center gap-3 text-xs bg-[var(--surface)] rounded-lg border border-[var(--border)] p-2.5">
          <button type="button" onClick={toggleAll} className="text-[var(--accent)] font-medium hover:underline">
            {selectedIds.size === filtered.length ? "Hiçbirini Seçme" : `Tümünü Seç (${filtered.length})`}
          </button>
          <span className="text-[var(--muted-foreground)] ml-auto font-semibold">{selectedIds.size} seçili</span>
        </div>
      )}

      {/* Mobil: Kartlar */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <EmptyState
            icon="📋"
            title={operations.length > 0 ? "Sonuç bulunamadı" : "Henüz operasyon yok"}
            description={operations.length > 0 ? "Filtre kriterlerini değiştirin" : "İlk operasyonunu oluşturmak için başla"}
            ctaLabel={operations.length === 0 ? "+ Yeni Operasyon" : undefined}
            onCta={operations.length === 0 ? handleAdd : undefined}
          />
        ) : (
          paginated.map((op) => (
            <OperationCard
              key={op.id}
              operation={op}
              permissions={flightPermissions}
              onSelect={handleSelect}
              onStatusChange={handleStatusChange}
              selectMode={selectMode}
              selected={selectedIds.has(op.id)}
              onToggle={() => toggleSelect(op.id)}
            />
          ))
        )}
      </div>

      {/* Masaüstü: Tablo */}
      <div className="hidden md:block">
        <OperationsTable
          operations={paginated}
          onSelect={handleSelect}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggle={toggleSelect}
          onToggleAll={toggleAll}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)] disabled:opacity-30"
            aria-label="Önceki sayfa"
          >
            ←
          </button>
          <span className="text-xs text-[var(--muted-foreground)]">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface)] disabled:opacity-30"
            aria-label="Sonraki sayfa"
          >
            →
          </button>
        </div>
      )}

      {/* Toplu işlem action bar (seçim modunda, en az 1 seçili) */}
      {selectMode && selectedIds.size > 0 && (
        <div className="sticky bottom-20 md:bottom-4 z-30 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[var(--foreground)]">{selectedIds.size} seçili</span>
          <div className="flex-1" />
          {/* Toplu durum değiştir */}
          <div className="relative">
            <Button size="sm" variant="outline" onClick={() => setBulkStatusOpen(!bulkStatusOpen)}>
              Durumu Değiştir
            </Button>
            {bulkStatusOpen && (
              <div className="absolute bottom-full mb-1 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[140px] z-40">
                {(["talep", "planlama", "saha", "isleme", "kontrol", "teslim"] as OperationStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { handleBulkStatus(s); setBulkStatusOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    {OPERATION_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button size="sm" variant="danger" onClick={() => setConfirmBulkDelete(true)}>
            Sil ({selectedIds.size})
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Toplu Silme"
        description={`${selectedIds.size} operasyon kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
      />

      <OperationModal
        operation={selectedOp}
        equipment={equipment}
        team={team}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={deleteOperation}
      />

      <ExcelImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}
