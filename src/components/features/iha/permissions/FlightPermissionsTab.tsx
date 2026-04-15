"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIhaStore } from "../shared/ihaStore";
import { PermissionForm } from "./PermissionForm";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState as SharedEmptyState } from "../shared/EmptyState";
import { downloadForm19Pdf } from "./form19Pdf";
import { inputClass } from "../shared/styles";
import { IconEdit, IconTrash, IconPermissions, IconCheck } from "@/config/icons";
import type { FlightPermission, PermissionStatus } from "@/types/iha";
import { PERMISSION_STATUS_LABELS } from "@/types/iha";

const STATUSES: PermissionStatus[] = ["taslak", "gonderildi", "beklemede", "onaylandi", "reddedildi", "suresi_doldu"];

const STATUS_ICON: Record<PermissionStatus, string> = {
  taslak: "📝",
  gonderildi: "📤",
  beklemede: "⏳",
  onaylandi: "✅",
  reddedildi: "❌",
  suresi_doldu: "⏰",
};

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger"> = {
  taslak: "default",
  gonderildi: "warning",
  beklemede: "warning",
  onaylandi: "success",
  reddedildi: "danger",
  suresi_doldu: "default",
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function FlightPermissionsTab() {
  const { isAdmin } = useAuth();
  const {
    flightPermissions, equipment, team,
    addFlightPermission, updateFlightPermission, deleteFlightPermission,
  } = useIhaStore();

  const [editPerm, setEditPerm] = useState<FlightPermission | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PermissionStatus | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    for (const id of selectedIds) deleteFlightPermission(id);
    exitSelectMode();
  };

  const handleBulkStatus = (status: PermissionStatus) => {
    for (const id of selectedIds) updateFlightPermission(id, { status });
    exitSelectMode();
  };

  const filtered = flightPermissions.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      const searchable = [
        p.hsdNumber, p.notes, p.conditions, p.coordinationContacts,
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

  return (
    <div className="space-y-4">
      {/* ─── KPI Kartları ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Toplam" value={stats.total} />
        <KpiCard label="Aktif" value={stats.active} color="text-[var(--feedback-success)]" />
        <KpiCard label="Beklemede" value={stats.pending} color={stats.pending > 0 ? "text-[var(--feedback-warning)]" : undefined} />
        <KpiCard label="Dolacak" value={stats.expiring} color={stats.expiring > 0 ? "text-[var(--feedback-error)]" : undefined} />
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
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <Button
            variant={statusFilter === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="min-h-[44px] whitespace-nowrap"
          >
            Tümü
          </Button>
          {STATUSES.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "primary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className="min-h-[44px] whitespace-nowrap"
            >
              {PERMISSION_STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={selectMode ? "primary" : "outline"}
            onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
            className="min-h-[44px]"
          >
            {selectMode ? "İptal" : "Seç"}
          </Button>
          {!selectMode && (
            <Button
              onClick={() => { setEditPerm(undefined); setIsFormOpen(true); }}
              className="min-h-[44px] whitespace-nowrap"
            >
              + Yeni İzin
            </Button>
          )}
        </div>
      </div>

      {/* Toplu seçim header */}
      {selectMode && (
        <div className="flex items-center gap-3 text-xs bg-[var(--surface)] rounded-lg border border-[var(--border)] p-2.5">
          <button
            type="button"
            onClick={() => {
              const allIds = filtered.map((p) => p.id);
              setSelectedIds((prev) => allIds.every((id) => prev.has(id)) ? new Set() : new Set(allIds));
            }}
            className="text-[var(--accent)] font-medium hover:underline"
          >
            {selectedIds.size === filtered.length ? "Hiçbirini Seçme" : `Tümünü Seç (${filtered.length})`}
          </button>
          <span className="text-[var(--muted-foreground)] ml-auto font-semibold">{selectedIds.size} seçili</span>
        </div>
      )}

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

            return (
              <div
                key={p.id}
                className={`rounded-lg border bg-[var(--surface)] overflow-hidden transition-colors ${
                  isExpired ? "border-[var(--feedback-error)]/40" :
                  isExpiring ? "border-[var(--feedback-warning)]/40" :
                  "border-[var(--border)]"
                }`}
              >
                {/* Kart Header — her zaman görünür */}
                <button
                  onClick={() => selectMode ? toggleSelect(p.id) : setExpandedId(isExpanded ? null : p.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--surface-hover)] transition-colors min-h-[64px] ${
                    selectedIds.has(p.id) ? "bg-[var(--accent)]/5" : ""
                  }`}
                >
                  {/* Checkbox (seçim modunda) veya İkon */}
                  {selectMode ? (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer shrink-0"
                    />
                  ) : (
                    <span className="text-2xl shrink-0">{STATUS_ICON[p.status]}</span>
                  )}

                  {/* Ana bilgi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {p.hsdNumber ?? "İzin"}
                      </span>
                      <Badge variant={STATUS_VARIANT[p.status]}>
                        {PERMISSION_STATUS_LABELS[p.status]}
                      </Badge>
                      {isExpired && <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--feedback-error-bg)] text-[var(--feedback-error)] font-medium">Süresi Doldu</span>}
                      {isExpiring && <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--feedback-warning-bg)] text-[var(--feedback-warning)] font-medium">{days} gün kaldı</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--muted-foreground)]">
                      <span>📅 {p.startDate} — {p.endDate}</span>
                      {p.altitudeMeters && <span>📏 {p.altitudeMeters}m</span>}
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
                      {p.altitudeMeters && (
                        <InfoBox label="Max Yükseklik" value={`${p.altitudeMeters}m / ${p.altitudeFeet ?? ""}ft MSL`} />
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
                    {p.applicationDate && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <InfoBox label="Başvuru Tarihi" value={p.applicationDate} />
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
                    <div className="flex gap-2 pt-1 flex-wrap">
                      <Button
                        variant="outline"
                        onClick={() => { setEditPerm(p); setIsFormOpen(true); }}
                        className="flex-1 min-h-[48px]"
                        aria-label="İzni düzenle"
                      >
                        <IconEdit size={14} className="mr-1" /> Düzenle
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const pilot = p.pilotId ? team.find((t) => t.id === p.pilotId) : undefined;
                          const drone = p.equipmentId ? equipment.find((e) => e.id === p.equipmentId) : undefined;
                          downloadForm19Pdf({ permission: p, pilot, drone });
                        }}
                        className="flex-1 min-h-[48px]"
                        aria-label="PDF indir"
                      >
                        📄 Form-19 PDF
                      </Button>
                      {p.status === "beklemede" && (
                        <Button
                          variant="outline"
                          onClick={() => updateFlightPermission(p.id, { status: "onaylandi" })}
                          className="flex-1 min-h-[48px] !border-[var(--feedback-success)]/40 !text-[var(--feedback-success)] hover:!bg-[var(--feedback-success-bg)]"
                          aria-label="İzni onayla"
                        >
                          <IconCheck size={14} className="mr-1" /> Onayla
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="danger"
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="min-h-[48px]"
                          aria-label="İzni sil"
                        >
                          <IconTrash size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Toplu işlem action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="sticky bottom-20 md:bottom-4 z-[var(--z-overlay)] bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[var(--foreground)]">{selectedIds.size} seçili</span>
          <div className="flex-1" />
          <div className="relative">
            <Button size="sm" variant="outline" onClick={() => setBulkStatusOpen(!bulkStatusOpen)}>
              Durumu Değiştir
            </Button>
            {bulkStatusOpen && (
              <div className="absolute bottom-full mb-1 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[140px] z-[var(--z-header)]">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { handleBulkStatus(s); setBulkStatusOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    {PERMISSION_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isAdmin && (
            <Button size="sm" variant="danger" onClick={() => setConfirmBulkDelete(true)}>
              Sil ({selectedIds.size})
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Toplu Silme"
        description={`${selectedIds.size} uçuş izni kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
      />

      {/* ─── Form Modal (sadece ekleme/düzenleme) ─── */}
      <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
          {editPerm ? <IconEdit size={18} /> : <IconPermissions size={18} />}
          {editPerm ? "İzni Düzenle" : "Yeni Uçuş İzni"}
        </h2>
        <PermissionForm
          permission={editPerm}
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

