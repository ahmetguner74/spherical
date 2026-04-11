"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { PermissionForm } from "./PermissionForm";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState as SharedEmptyState } from "../shared/EmptyState";
import { inputClass } from "../shared/styles";
import { IconEdit, IconTrash, IconPermissions, IconCheck } from "@/config/icons";
import type { FlightPermission, PermissionStatus } from "@/types/iha";
import { PERMISSION_STATUS_LABELS } from "@/types/iha";

const STATUSES: PermissionStatus[] = ["beklemede", "onaylandi", "reddedildi", "suresi_doldu"];

const STATUS_ICON: Record<PermissionStatus, string> = {
  beklemede: "⏳",
  onaylandi: "✅",
  reddedildi: "❌",
  suresi_doldu: "⏰",
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger"> = {
  beklemede: "warning",
  onaylandi: "success",
  reddedildi: "danger",
  suresi_doldu: "default",
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function FlightPermissionsTab() {
  const {
    operations, flightPermissions,
    addFlightPermission, updateFlightPermission, deleteFlightPermission,
  } = useIhaStore();

  const [editPerm, setEditPerm] = useState<FlightPermission | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PermissionStatus | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = flightPermissions.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      const searchable = [
        p.hsdNumber, p.notes, p.conditions, p.coordinationContacts,
        operations.find((op) => op.id === p.operationId)?.title,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: flightPermissions.length,
    active: flightPermissions.filter((p) => p.status === "onaylandi" && daysUntil(p.endDate) > 0).length,
    pending: flightPermissions.filter((p) => p.status === "beklemede").length,
    expiring: flightPermissions.filter((p) => p.status === "onaylandi" && daysUntil(p.endDate) > 0 && daysUntil(p.endDate) <= 7).length,
  };

  const getOpTitle = (opId?: string) =>
    opId ? operations.find((op) => op.id === opId)?.title : undefined;

  return (
    <div className="space-y-4">
      {/* ─── KPI Kartları ─── */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Toplam" value={stats.total} />
        <KpiCard label="Aktif" value={stats.active} color="text-green-400" />
        <KpiCard label="Beklemede" value={stats.pending} color={stats.pending > 0 ? "text-yellow-400" : undefined} />
        <KpiCard label="Dolacak" value={stats.expiring} color={stats.expiring > 0 ? "text-red-400" : undefined} />
      </div>

      {/* ─── Üst Bar: Arama + Filtre + Yeni Ekle ─── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="🔍 Ara..."
          className={`${inputClass} flex-1`}
        />
        <div className="flex gap-2">
          {/* Durum filtre butonları */}
          <Button
            variant={statusFilter === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="min-h-[44px]"
          >
            Tümü
          </Button>
          {STATUSES.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "primary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className="min-h-[44px]"
              title={PERMISSION_STATUS_LABELS[s]}
            >
              {STATUS_ICON[s]}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => { setEditPerm(undefined); setIsFormOpen(true); }}
          className="min-h-[44px] whitespace-nowrap"
        >
          + Yeni İzin
        </Button>
      </div>

      {/* ─── İzin Listesi (Accordion) ─── */}
      {filtered.length === 0 ? (
        <SharedEmptyState
          icon="📄"
          title={flightPermissions.length > 0 ? "Sonuç bulunamadı" : "Henüz uçuş izni yok"}
          description={flightPermissions.length > 0 ? "Filtre kriterlerini değiştirin" : "SHGM uçuş izinlerinizi buradan yönetin"}
          ctaLabel={flightPermissions.length === 0 ? "+ İlk İzni Ekle" : undefined}
          onCta={flightPermissions.length === 0 ? () => { setEditPerm(undefined); setIsFormOpen(true); } : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const isExpanded = expandedId === p.id;
            const days = daysUntil(p.endDate);
            const isExpired = p.status === "onaylandi" && days <= 0;
            const isExpiring = p.status === "onaylandi" && days > 0 && days <= 7;
            const opTitle = getOpTitle(p.operationId);

            return (
              <div
                key={p.id}
                className={`rounded-lg border bg-[var(--surface)] overflow-hidden transition-colors ${
                  isExpired ? "border-red-500/40" :
                  isExpiring ? "border-yellow-500/40" :
                  "border-[var(--border)]"
                }`}
              >
                {/* Kart Header — her zaman görünür */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--surface-hover)] transition-colors min-h-[64px]"
                >
                  {/* İkon */}
                  <span className="text-2xl shrink-0">{STATUS_ICON[p.status]}</span>

                  {/* Ana bilgi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {p.hsdNumber ?? "İzin"}
                      </span>
                      <Badge variant={STATUS_VARIANT[p.status]}>
                        {PERMISSION_STATUS_LABELS[p.status]}
                      </Badge>
                      {isExpired && <span className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">Süresi Doldu</span>}
                      {isExpiring && <span className="text-[11px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-medium">{days} gün kaldı</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--muted-foreground)]">
                      <span>📅 {p.startDate} — {p.endDate}</span>
                      {p.maxAltitude && <span>📏 {p.maxAltitude}m</span>}
                      {opTitle && <span>🔗 {opTitle}</span>}
                    </div>
                  </div>

                  {/* Chevron */}
                  <span className="text-[var(--muted-foreground)] text-lg shrink-0">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {/* Genişletilmiş detay */}
                {isExpanded && (
                  <div className="border-t border-[var(--border)] p-4 space-y-4 bg-[var(--background)]">
                    {/* Bilgi grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {p.polygonCoordinates.length > 0 && (
                        <InfoBox label="İzin Bölgesi" value={`${p.polygonCoordinates.length} köşe noktası`} />
                      )}
                      {p.maxAltitude && (
                        <InfoBox label="Max Yükseklik" value={`${p.maxAltitude}m AGL`} />
                      )}
                      {opTitle && (
                        <InfoBox label="Operasyon" value={opTitle} />
                      )}
                    </div>

                    {/* Koordinatlar */}
                    {p.polygonCoordinates.length > 0 && (
                      <div className="rounded-lg bg-[var(--surface)] p-3">
                        <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1">Koordinatlar</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                          {p.polygonCoordinates.map((c, i) => (
                            <span key={i} className="text-[11px] font-mono text-[var(--muted-foreground)]">
                              {i + 1}. {c.lat.toFixed(6)}, {c.lng.toFixed(6)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Başvuru Bilgileri */}
                    {(p.applicationDate || p.applicationRef || p.responsiblePerson) && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {p.applicationDate && <InfoBox label="Başvuru Tarihi" value={p.applicationDate} />}
                        {p.applicationRef && <InfoBox label="Başvuru Ref" value={p.applicationRef} />}
                        {p.responsiblePerson && <InfoBox label="Sorumlu" value={p.responsiblePerson} />}
                      </div>
                    )}

                    {/* Ek bilgiler */}
                    {p.coordinationContacts && (
                      <DetailBlock title="Koordinasyon İrtibat" text={p.coordinationContacts} />
                    )}
                    {p.conditions && (
                      <DetailBlock title="İzin Koşulları" text={p.conditions} />
                    )}
                    {p.notes && (
                      <DetailBlock title="Notlar" text={p.notes} />
                    )}

                    {/* Aksiyon butonları */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        onClick={() => { setEditPerm(p); setIsFormOpen(true); }}
                        className="flex-1 min-h-[48px]"
                        aria-label="İzni düzenle"
                      >
                        <IconEdit size={14} className="mr-1" /> Düzenle
                      </Button>
                      {p.status === "beklemede" && (
                        <Button
                          variant="outline"
                          onClick={() => updateFlightPermission(p.id, { status: "onaylandi" })}
                          className="flex-1 min-h-[48px] !border-green-500/40 !text-green-500 hover:!bg-green-500/10"
                          aria-label="İzni onayla"
                        >
                          <IconCheck size={14} className="mr-1" /> Onayla
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="min-h-[48px]"
                        aria-label="İzni sil"
                      >
                        <IconTrash size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Form Modal (sadece ekleme/düzenleme) ─── */}
      <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          {editPerm ? <IconEdit size={18} /> : <IconPermissions size={18} />}
          {editPerm ? "İzni Düzenle" : "Yeni Uçuş İzni"}
        </h2>
        <PermissionForm
          permission={editPerm}
          operations={operations}
          onSave={(data) => {
            if (editPerm) updateFlightPermission(editPerm.id, data);
            else addFlightPermission(data);
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => { if (confirmDeleteId) deleteFlightPermission(confirmDeleteId); }}
        title="Uçuş İznini Sil"
        description="Bu uçuş izni kalıcı olarak silinecek. Bu işlem geri alınamaz."
      />
    </div>
  );
}

/* ─── KPI Kart ─── */
function KpiCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-[11px] text-[var(--muted-foreground)]">{label}</p>
      <p className={`text-xl font-bold ${color ?? "text-[var(--foreground)]"}`}>{value}</p>
    </div>
  );
}

/* ─── Bilgi Kutusu ─── */
function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface)] p-2.5">
      <p className="text-[10px] text-[var(--muted-foreground)]">{label}</p>
      <p className="text-sm text-[var(--foreground)] truncate">{value}</p>
    </div>
  );
}

/* ─── Detay Blok ─── */
function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface)] p-3">
      <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1">{title}</p>
      <p className="text-sm text-[var(--foreground)] whitespace-pre-line">{text}</p>
    </div>
  );
}

