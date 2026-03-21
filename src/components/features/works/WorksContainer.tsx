"use client";

import { useState } from "react";
import type { Work } from "@/types";
import { useWorks } from "./useWorks";
import { WorksToolbar } from "./WorksToolbar";
import { WorksTable } from "./WorksTable";
import { WorksGrid } from "./WorksGrid";
import { WorkDetailModal } from "./WorkDetailModal";
import type { WorkSaveData } from "./WorkDetailModal";

type ModalState =
  | { type: "none" }
  | { type: "detail"; work: Work }
  | { type: "new" };

export function WorksContainer() {
  const { works, clients, filters, setFilters, addWork, updateWork, deleteWork, loading, error } =
    useWorks();
  const [view, setView] = useState<"table" | "grid">("table");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const close = () => setModal({ type: "none" });

  const handleSelect = (work: Work) => setModal({ type: "detail", work });

  const handleSave = async (data: WorkSaveData): Promise<Work | void> => {
    const payload = {
      ...data,
      paidAmount: 0,
      endDate: data.endDate || undefined,
      locationAddress: data.locationAddress || undefined,
    };
    if (modal.type === "detail") {
      const updated = await updateWork(modal.work.id, payload);
      return updated;
    } else if (modal.type === "new") {
      const created = await addWork(payload);
      return created;
    }
  };

  const handleDelete = async (id: string) => {
    await deleteWork(id);
    close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
        Veriler yüklenirken hata oluştu: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WorksToolbar
        view={view} onViewChange={setView}
        statusFilter={filters.status} onStatusChange={(s) => setFilters((p) => ({ ...p, status: s }))}
        clientFilter={filters.client} onClientChange={(c) => setFilters((p) => ({ ...p, client: c }))}
        clients={clients}
        onAdd={() => setModal({ type: "new" })}
      />
      {view === "table"
        ? <WorksTable works={works} onSelect={handleSelect} />
        : <WorksGrid works={works} onSelect={handleSelect} />
      }
      {modal.type !== "none" && (
        <WorkDetailModal
          work={modal.type === "detail" ? modal.work : null}
          isNew={modal.type === "new"}
          onClose={close}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
