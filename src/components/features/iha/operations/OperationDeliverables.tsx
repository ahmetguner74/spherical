"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Deliverable, DeliverableType, DeliveryMethod } from "@/types/iha";
import { DELIVERABLE_TYPE_LABELS, DELIVERY_METHOD_LABELS } from "@/types/iha";
import { inputClass } from "../shared/styles";

interface OperationDeliverablesProps {
  deliverables: Deliverable[];
  onAdd: (deliverable: Omit<Deliverable, "id">) => void;
  onRemove: (deliverableId: string) => void;
}

const TYPES: DeliverableType[] = [
  "ortofoto", "dem", "dsm", "nokta_bulutu", "cad_dwg", "cad_dxf",
  "shp", "geotiff", "panorama_360", "video", "rapor", "diger",
];
const METHODS: DeliveryMethod[] = ["sunucu", "fiziksel", "dijital", "eposta"];

export function OperationDeliverables({ deliverables, onAdd, onRemove }: OperationDeliverablesProps) {
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [confirmDelId, setConfirmDelId] = useState<string | null>(null);
  const [type, setType] = useState<DeliverableType>("ortofoto");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<DeliveryMethod>("sunucu");
  const [deliveredTo, setDeliveredTo] = useState("");
  const [filePath, setFilePath] = useState("");

  const handleAdd = () => {
    if (!description.trim()) return;
    onAdd({
      type,
      description: description.trim(),
      deliveryMethod: method,
      deliveredTo: deliveredTo || undefined,
      deliveredAt: deliveredTo ? new Date().toISOString().split("T")[0] : undefined,
      filePath: filePath || undefined,
    });
    setDescription("");
    setDeliveredTo("");
    setFilePath("");
    setShowForm(false);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-[var(--border)]">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Çıktılar / Teslimat ({deliverables.length})
        </h4>
        {!showForm && (
          <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>+ Çıktı Ekle</Button>
        )}
      </div>

      {deliverables.length > 0 && (
        <div className="space-y-2">
          {deliverables.map((del) => (
            <div key={del.id} className="flex items-start justify-between p-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge>{DELIVERABLE_TYPE_LABELS[del.type]}</Badge>
                  <Badge variant={del.deliveredTo ? "success" : "warning"}>
                    {del.deliveredTo ? "Teslim Edildi" : "Bekliyor"}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--foreground)]">{del.description}</p>
                <div className="flex gap-3 text-xs text-[var(--muted-foreground)] mt-0.5">
                  <span>{DELIVERY_METHOD_LABELS[del.deliveryMethod]}</span>
                  {del.deliveredTo && <span>→ {del.deliveredTo}</span>}
                  {del.filePath && <span className="font-mono truncate max-w-[150px]">{del.filePath}</span>}
                </div>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setConfirmDelId(del.id)}
                  className="text-[var(--feedback-error)] text-xs px-2 py-1.5 hover:bg-[var(--feedback-error-bg)] rounded ml-2 flex-shrink-0 min-h-[44px]"
                  aria-label="Çıktıyı sil"
                  title="Çıktıyı sil"
                >×</button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelId}
        onClose={() => setConfirmDelId(null)}
        onConfirm={() => { if (confirmDelId) onRemove(confirmDelId); }}
        title="Çıktıyı Sil"
        description="Bu çıktı/teslimat kaydı kalıcı olarak silinecek."
      />

      {showForm && (
        <div className="p-3 rounded-lg border border-[var(--accent)] bg-[var(--accent)]/5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Tip</label>
              <select value={type} onChange={(e) => setType(e.target.value as DeliverableType)} className={inputClass}>
                {TYPES.map((t) => <option key={t} value={t}>{DELIVERABLE_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Teslimat Yöntemi</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as DeliveryMethod)} className={inputClass}>
                {METHODS.map((m) => <option key={m} value={m}>{DELIVERY_METHOD_LABELS[m]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Açıklama *</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="ör: Osmangazi ortofoto 5cm GSD" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Teslim Edilen</label>
              <input type="text" value={deliveredTo} onChange={(e) => setDeliveredTo(e.target.value)} className={inputClass} placeholder="Birim / Kişi" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Dosya Yolu</label>
              <input type="text" value={filePath} onChange={(e) => setFilePath(e.target.value)} className={inputClass} placeholder="/cografidrone/2026/..." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!description.trim()}>Ekle</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>İptal</Button>
          </div>
        </div>
      )}
    </div>
  );
}
