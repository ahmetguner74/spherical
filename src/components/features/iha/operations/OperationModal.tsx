"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OperationForm } from "./OperationForm";
import { QuickCreateForm } from "./QuickCreateForm";
import { OperationDeliverables } from "./OperationDeliverables";
import { WorkflowChecklist } from "./WorkflowChecklist";
import { PermissionForm } from "../permissions/PermissionForm";
import { FlightLogForm } from "../flight-log/FlightLogForm";
import { AttachmentList } from "../inventory/AttachmentList";
import { useIhaStore } from "../shared/ihaStore";
import type { Operation, Equipment, TeamMember, FlightLog, FlightPermission, Deliverable } from "@/types/iha";
import { PERMISSION_STATUS_LABELS } from "@/types/iha";
import {
  IconPermissions,
  IconPlane,
  IconCheck,
  IconInventory,
  IconFiles,
} from "@/config/icons";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

interface OperationModalProps {
  operation?: Operation;
  equipment: Equipment[];
  team: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  onDelete?: (id: string) => void;
}

type ModalView = "editOp" | "addPermission" | "editPermission" | "addFlightLog";

export function OperationModal({ operation, equipment, team, isOpen, onClose, onSave, onDelete }: OperationModalProps) {
  const [view, setView] = useState<ModalView>("editOp");
  const {
    operations, flightLogs, flightPermissions,
    addDeliverable, removeDeliverable,
    addFlightPermission, updateFlightPermission, deleteFlightPermission,
    addFlightLog, deleteFlightLog, updateOperation,
  } = useIhaStore();

  const operationFlights = operation ? flightLogs.filter((fl) => fl.operationId === operation.id) : [];
  const operationPermission = operation?.permissionId
    ? flightPermissions.find((p) => p.id === operation.permissionId)
    : flightPermissions.find((p) => p.operationId === operation?.id);

  const modalTitle = () => {
    if (view === "addPermission") return "Uçuş İzni Ekle";
    if (view === "editPermission") return "Uçuş İzni Düzenle";
    if (view === "addFlightLog") return "Uçuş Kaydı Ekle";
    return operation ? operation.title : "Yeni Operasyon";
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">{modalTitle()}</h2>

      {/* Yeni operasyon → Hızlı form */}
      {view === "editOp" && !operation && (
        <QuickCreateForm
          team={team}
          onSave={(data) => { onSave(data); onClose(); }}
          onCancel={onClose}
        />
      )}

      {/* Var olan operasyon → Düzenleme formu + alt bölümler */}
      {view === "editOp" && operation && (
        <>
          <OperationForm
            operation={operation}
            equipment={equipment}
            team={team}
            onSave={(data) => { onSave(data); }}
            onCancel={onClose}
          />

          <OperationExtras
            operation={operation}
            flights={operationFlights}
            permission={operationPermission}
            onAddPermission={() => setView("addPermission")}
            onEditPermission={() => setView("editPermission")}
            onDeletePermission={() => { if (operationPermission) deleteFlightPermission(operationPermission.id); }}
            onAddFlightLog={() => setView("addFlightLog")}
            onDeleteFlightLog={(id) => deleteFlightLog(id)}
            onAddDeliverable={(del) => addDeliverable(operation.id, del)}
            onRemoveDeliverable={(delId) => removeDeliverable(operation.id, delId)}
            onUpdateWorkflow={(steps) => {
              const existing = (operation.notes ?? "").replace(/\s*\[workflow:.*?\]/, "");
              const tag = steps.length > 0 ? ` [workflow:${steps.join(",")}]` : "";
              updateOperation(operation.id, { notes: existing + tag });
            }}
            onDelete={onDelete ? () => { onDelete(operation.id); onClose(); } : undefined}
          />
        </>
      )}

      {/* Uçuş İzni Ekle */}
      {view === "addPermission" && operation && (
        <PermissionForm
          operations={operations}
          onSave={(data) => { addFlightPermission({ ...data, operationId: operation.id }); setView("editOp"); }}
          onCancel={() => setView("editOp")}
        />
      )}

      {/* Uçuş İzni Düzenle */}
      {view === "editPermission" && operationPermission && (
        <PermissionForm
          permission={operationPermission}
          operations={operations}
          onSave={(data) => { updateFlightPermission(operationPermission.id, data); setView("editOp"); }}
          onCancel={() => setView("editOp")}
        />
      )}

      {/* Uçuş Kaydı Ekle */}
      {view === "addFlightLog" && operation && (
        <FlightLogForm
          operations={operations}
          equipment={equipment}
          team={team}
          onSave={(data) => { addFlightLog({ ...data, operationId: operation.id }); setView("editOp"); }}
          onCancel={() => setView("editOp")}
        />
      )}
    </Modal>
  );
}

/* ─── Alt Bölümler (Form altında gösterilir) ─── */

interface OperationExtrasProps {
  operation: Operation;
  flights: FlightLog[];
  permission: FlightPermission | undefined;
  onAddPermission: () => void;
  onEditPermission: () => void;
  onDeletePermission: () => void;
  onAddFlightLog: () => void;
  onDeleteFlightLog: (id: string) => void;
  onAddDeliverable: (del: Omit<Deliverable, "id">) => void;
  onRemoveDeliverable: (id: string) => void;
  onUpdateWorkflow: (completedSteps: string[]) => void;
  onDelete?: () => void;
}

type ExtraTab = "permission" | "flights" | "workflow" | "deliverables" | "files";

const EXTRA_TABS: { key: ExtraTab; label: string; Icon: LucideIcon }[] = [
  { key: "permission", label: "Uçuş İzni", Icon: IconPermissions },
  { key: "flights", label: "Uçuş Kayıtları", Icon: IconPlane },
  { key: "workflow", label: "İş Akışı", Icon: IconCheck },
  { key: "deliverables", label: "Çıktılar", Icon: IconInventory },
  { key: "files", label: "Dosyalar", Icon: IconFiles },
];

function OperationExtras({
  operation, flights, permission,
  onAddPermission, onEditPermission, onDeletePermission,
  onAddFlightLog, onDeleteFlightLog,
  onAddDeliverable, onRemoveDeliverable,
  onUpdateWorkflow, onDelete,
}: OperationExtrasProps) {
  const [confirmOp, setConfirmOp] = useState(false);
  const [confirmPerm, setConfirmPerm] = useState(false);
  const [confirmFlightId, setConfirmFlightId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ExtraTab>("permission");

  return (
    <div className="mt-6 border-t border-[var(--border)] pt-4">
      {/* Sekme başlıkları */}
      <div className="flex gap-1 overflow-x-auto mb-4 -mx-1 px-1 border-b border-[var(--border)] pb-0">
        {EXTRA_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 whitespace-nowrap transition-colors min-h-[40px] ${
              activeTab === tab.key
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <tab.Icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sekme içerikleri */}
      <div className="space-y-4">
        {activeTab === "permission" && (<>
      {/* Uçuş İzni */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Uçuş İzni</h4>
          {!permission && <button onClick={onAddPermission} className="text-xs text-[var(--accent)] hover:underline">+ İzin Ekle</button>}
        </div>
        {permission ? (
          <div className={`rounded-md p-3 border ${
            permission.status === "onaylandi" ? "border-green-500/30 bg-green-500/5" :
            permission.status === "reddedildi" ? "border-red-500/30 bg-red-500/5" :
            "border-yellow-500/30 bg-yellow-500/5"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={permission.status === "onaylandi" ? "success" : permission.status === "reddedildi" ? "danger" : "warning"}>
                  {PERMISSION_STATUS_LABELS[permission.status]}
                </Badge>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {permission.hsdNumber ?? "HSD"} · {permission.startDate} — {permission.endDate}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={onEditPermission} className="text-xs text-[var(--accent)] hover:underline">Düzenle</button>
                <button onClick={() => setConfirmPerm(true)} className="text-xs text-red-500 hover:underline ml-2">Sil</button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)]">Henüz izin eklenmemiş</p>
        )}
      </div>
        </>)}

        {activeTab === "flights" && (<>
      {/* Uçuş Kayıtları */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            Uçuş Kayıtları ({flights.length})
          </h4>
          <button onClick={onAddFlightLog} className="text-xs text-[var(--accent)] hover:underline">+ Kayıt Ekle</button>
        </div>
        {flights.length > 0 ? (
          <div className="space-y-1.5">
            {flights.map((fl) => (
              <div key={fl.id} className="text-xs flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <div>
                  <span className="text-[var(--foreground)]">{fl.date}</span>
                  <span className="text-[var(--muted-foreground)] ml-2">{fl.pilotName ?? ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted-foreground)]">{fl.equipmentName ?? ""}</span>
                  <button
                    onClick={() => setConfirmFlightId(fl.id)}
                    className="ring-1 ring-red-500 text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 rounded text-[10px]"
                    title="Uçuş kaydını sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)]">Henüz kayıt yok</p>
        )}
      </div>
        </>)}

        {activeTab === "workflow" && (
          <WorkflowChecklist operation={operation} onUpdate={onUpdateWorkflow} />
        )}

        {activeTab === "deliverables" && (
          <OperationDeliverables
            deliverables={operation.deliverables}
            onAdd={onAddDeliverable}
            onRemove={onRemoveDeliverable}
          />
        )}

        {activeTab === "files" && (
          <AttachmentList parentTable="operations" parentId={operation.id} label="Dosya Ekleri" />
        )}
      </div>

      {/* Sil (her zaman altta) */}
      {onDelete && (
        <div className="pt-4 mt-4 border-t border-[var(--border)]">
          <Button variant="danger" size="sm" onClick={() => setConfirmOp(true)}>Operasyonu Sil</Button>
        </div>
      )}

      {/* Onay Dialogları */}
      {onDelete && (
        <ConfirmDialog
          open={confirmOp}
          onClose={() => setConfirmOp(false)}
          onConfirm={onDelete}
          title="Operasyonu Sil"
          description={`"${operation.title}" ve bağlı tüm çıktılar kalıcı olarak silinecek.`}
        />
      )}
      <ConfirmDialog
        open={confirmPerm}
        onClose={() => setConfirmPerm(false)}
        onConfirm={onDeletePermission}
        title="Uçuş İznini Sil"
        description="Bu uçuş izni kalıcı olarak silinecek."
      />
      <ConfirmDialog
        open={!!confirmFlightId}
        onClose={() => setConfirmFlightId(null)}
        onConfirm={() => { if (confirmFlightId) onDeleteFlightLog(confirmFlightId); }}
        title="Uçuş Kaydını Sil"
        description="Bu uçuş kaydı kalıcı olarak silinecek."
      />
    </div>
  );
}
