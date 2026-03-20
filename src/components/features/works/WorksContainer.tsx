"use client";

import { useState } from "react";
import type { Work } from "@/types";
import { useWorks } from "./useWorks";
import { WorksToolbar } from "./WorksToolbar";
import { WorksTable } from "./WorksTable";
import { WorksGrid } from "./WorksGrid";
import { WorkDetailModal } from "./WorkDetailModal";
import { WorkFormModal } from "./WorkFormModal";
import { WorkDeleteConfirm } from "./WorkDeleteConfirm";
import type { WorkFormData } from "./WorkFormModal";

type ModalState =
  | { type: "none" }
  | { type: "detail"; work: Work }
  | { type: "form"; work?: Work }
  | { type: "delete"; work: Work };

export function WorksContainer() {
  const { works, clients, filters, setFilters, addWork, updateWork, deleteWork } = useWorks();
  const [view, setView] = useState<"table" | "grid">("table");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const close = () => setModal({ type: "none" });

  const handleSelect = (work: Work) => setModal({ type: "detail", work });

  const handleSave = (data: WorkFormData) => {
    const payload = { ...data, endDate: data.endDate || undefined };
    if (modal.type === "form" && modal.work) {
      updateWork(modal.work.id, payload);
    } else {
      addWork(payload);
    }
    close();
  };

  const handleDelete = () => {
    if (modal.type === "delete") {
      deleteWork(modal.work.id);
      close();
    }
  };

  return (
    <div className="space-y-6">
      <WorksToolbar
        view={view} onViewChange={setView}
        statusFilter={filters.status} onStatusChange={(s) => setFilters((p) => ({ ...p, status: s }))}
        clientFilter={filters.client} onClientChange={(c) => setFilters((p) => ({ ...p, client: c }))}
        clients={clients}
        onAdd={() => setModal({ type: "form" })}
      />
      {view === "table"
        ? <WorksTable works={works} onSelect={handleSelect} />
        : <WorksGrid works={works} onSelect={handleSelect} />
      }
      <WorkDetailModal
        work={modal.type === "detail" ? modal.work : null}
        onClose={close}
        onEdit={() => { if (modal.type === "detail") setModal({ type: "form", work: modal.work }); }}
        onDelete={() => { if (modal.type === "detail") setModal({ type: "delete", work: modal.work }); }}
      />
      <WorkFormModal
        open={modal.type === "form"}
        onClose={close}
        onSave={handleSave}
        initial={modal.type === "form" ? modal.work : undefined}
      />
      <WorkDeleteConfirm
        open={modal.type === "delete"}
        title={modal.type === "delete" ? modal.work.title : ""}
        onConfirm={handleDelete}
        onClose={close}
      />
    </div>
  );
}
