"use client";

import { useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import { useIhaStore } from "../shared/ihaStore";
import { Button, FormInput, FormSelect } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { VehicleEventType, VehicleEvent, Equipment } from "@/types/iha";
import { VEHICLE_EVENT_TYPE_LABELS, VEHICLE_EVENT_TYPE_ICONS } from "@/types/iha";

const EVENT_TYPES: VehicleEventType[] = ["muayene", "bakim", "sigorta", "lastik", "genel"];

export function VehicleEventsPanel() {
  const can = usePermission();
  const { equipment, vehicleEvents, addVehicleEvent, deleteVehicleEvent, toggleVehicleEventComplete } = useIhaStore();
  const vehicles = equipment.filter((e) => e.category === "arac");

  const [showForm, setShowForm] = useState(false);
  const [formVehicleId, setFormVehicleId] = useState<string | undefined>();

  const sorted = [...vehicleEvents].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return a.eventDate.localeCompare(b.eventDate);
  });

  const handleAddForVehicle = (vehicleId: string) => {
    setFormVehicleId(vehicleId);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* Araç Kartları */}
      {vehicles.length > 0 ? (
        <VehicleCards
          vehicles={vehicles}
          events={vehicleEvents}
          onAddEvent={handleAddForVehicle}
        />
      ) : (
        <div className="text-center py-6 rounded-lg border border-dashed border-[var(--border)] text-[var(--muted-foreground)]">
          <p className="text-sm">Henüz araç eklenmemiş.</p>
          <p className="text-xs mt-1">Envanter sekmesinden araç ekleyebilirsiniz.</p>
        </div>
      )}

      {/* Etkinlik Ekle Butonu (araç olmadan da) */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Etkinlikler ({sorted.length})
        </h3>
        {can("vehicle_events.delete") && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setFormVehicleId(vehicles[0]?.id); setShowForm(true); }}
          >
            + Etkinlik Ekle
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <VehicleEventForm
          vehicles={vehicles}
          defaultVehicle={formVehicleId}
          onSave={(data) => { addVehicleEvent(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Etkinlik Listesi */}
      {sorted.length === 0 && !showForm && (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
          Etkinlik yok. Muayene, bakım, sigorta tarihlerini buradan takip edin.
        </p>
      )}
      <div className="space-y-1.5">
        {sorted.map((ev) => (
          <VehicleEventCard
            key={ev.id}
            event={ev}
            onToggle={() => toggleVehicleEventComplete(ev.id, !ev.isCompleted)}
            onDelete={() => deleteVehicleEvent(ev.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Araç Kartları ─── */
function VehicleCards({ vehicles, events, onAddEvent }: {
  vehicles: Equipment[];
  events: VehicleEvent[];
  onAddEvent: (vehicleId: string) => void;
}) {
  const can = usePermission();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {vehicles.map((v) => {
        const vEvents = events.filter((e) => e.equipmentId === v.id);
        const upcoming = vEvents.filter((e) => !e.isCompleted);
        const nextEvent = upcoming.sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];
        const overdue = upcoming.filter((e) => {
          const d = new Date(e.eventDate + "T00:00").getTime();
          return d < new Date().setHours(0, 0, 0, 0);
        });

        return (
          <div
            key={v.id}
            className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🚗</span>
                  <span className="text-sm font-semibold text-[var(--foreground)] truncate">{v.name}</span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{v.model}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                v.status === "musait" ? "bg-[var(--feedback-success-bg)] text-[var(--feedback-success)]" : "bg-[var(--feedback-warning-bg)] text-[var(--feedback-warning)]"
              }`}>
                {v.status === "musait" ? "Müsait" : "Kullanımda"}
              </span>
            </div>

            {/* Etkinlik özeti */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {overdue.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--feedback-error-bg)] text-[var(--feedback-error)] font-semibold">
                  {overdue.length} gecikmiş
                </span>
              )}
              {upcoming.length > 0 ? (
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  {upcoming.length} bekleyen
                </span>
              ) : (
                <span className="text-[10px] text-[var(--muted-foreground)]">Etkinlik yok</span>
              )}
              {nextEvent && (
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  · Sonraki: {new Date(nextEvent.eventDate + "T00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>

            {/* Hızlı ekle */}
            {can("vehicle_events.delete") && (
              <button
                onClick={() => onAddEvent(v.id)}
                className="mt-2 w-full text-[11px] py-1.5 rounded-md border border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                + Etkinlik Ekle
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Etkinlik Formu ─── */
function VehicleEventForm({
  vehicles,
  defaultVehicle,
  onSave,
  onCancel,
}: {
  vehicles: { id: string; name: string }[];
  defaultVehicle?: string;
  onSave: (data: Omit<VehicleEvent, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<VehicleEventType>("muayene");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [equipmentId, setEquipmentId] = useState(defaultVehicle ?? "");

  const vehicle = vehicles.find((v) => v.id === equipmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.add("Başlık zorunlu", "error");
      return;
    }
    if (!eventDate) {
      toast.add("Tarih zorunlu", "error");
      return;
    }
    if (!equipmentId) {
      toast.add("Araç seçimi zorunlu", "error");
      return;
    }
    onSave({
      title: title.trim(),
      eventType,
      eventDate,
      description: description.trim() || undefined,
      equipmentId,
      equipmentName: vehicle?.name ?? undefined,
      isCompleted: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--surface)] space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormSelect label="Araç" required value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
          <option value="">Araç seçiniz</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </FormSelect>
        <FormSelect label="Tip" value={eventType} onChange={(e) => setEventType(e.target.value as VehicleEventType)}>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{VEHICLE_EVENT_TYPE_ICONS[t]} {VEHICLE_EVENT_TYPE_LABELS[t]}</option>
          ))}
        </FormSelect>
        <FormInput label="Başlık" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Muayene yenileme" autoFocus />
        <FormInput label="Tarih" required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      </div>
      <FormInput label="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opsiyonel not" />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" variant="primary">
          Kaydet
        </Button>
      </div>
    </form>
  );
}

/* ─── Etkinlik Kartı ─── */
function VehicleEventCard({
  event,
  onToggle,
  onDelete,
}: {
  event: VehicleEvent;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const can = usePermission();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const eventStart = new Date(event.eventDate + "T00:00").getTime();
  const daysUntil = Math.round((eventStart - todayStart) / 86400000);
  const isOverdue = !event.isCompleted && daysUntil < 0;
  const isUrgent = !event.isCompleted && daysUntil >= 0 && daysUntil <= 7;

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 p-2.5 rounded-lg border transition-colors ${
        event.isCompleted
          ? "border-[var(--border)] bg-[var(--background)]/50 opacity-60"
          : isOverdue
          ? "border-[var(--feedback-error)]/30 bg-[var(--feedback-error-bg)]"
          : isUrgent
          ? "border-[var(--feedback-warning)]/30 bg-[var(--feedback-warning-bg)]"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <button
        onClick={can("vehicle_events.delete") ? onToggle : undefined}
        disabled={!can("vehicle_events.delete")}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          event.isCompleted
            ? "bg-[var(--accent)] border-[var(--accent)] text-white"
            : "border-[var(--muted-foreground)]/40 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
        }`}
      >
        {event.isCompleted && <span className="text-[10px]">✓</span>}
      </button>
      <span className="text-base shrink-0">{VEHICLE_EVENT_TYPE_ICONS[event.eventType]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${event.isCompleted ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>
            {event.title}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-hover)] text-[var(--muted-foreground)] shrink-0">
            {VEHICLE_EVENT_TYPE_LABELS[event.eventType]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)] mt-0.5">
          <span>{new Date(event.eventDate + "T00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</span>
          {event.equipmentName && <span>· {event.equipmentName}</span>}
          {event.description && <span className="truncate hidden sm:inline">· {event.description}</span>}
        </div>
      </div>
      {!event.isCompleted && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
          isOverdue ? "bg-[var(--feedback-error-bg)] text-[var(--feedback-error)]" : isUrgent ? "bg-[var(--feedback-warning-bg)] text-[var(--feedback-warning)]" : "bg-[var(--surface-hover)] text-[var(--muted-foreground)]"
        }`}>
          {isOverdue ? `${Math.abs(daysUntil)} gün geçti` : daysUntil === 0 ? "Bugün" : `${daysUntil} gün`}
        </span>
      )}
      {can("vehicle_events.delete") && (
        <>
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-[var(--muted-foreground)] hover:text-[var(--feedback-error)] transition-colors text-sm shrink-0 p-1"
            title="Sil"
          >
            ×
          </button>
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={onDelete}
            title="Etkinliği Sil"
            description={`"${event.title}" etkinliği kalıcı olarak silinecek.`}
          />
        </>
      )}
    </div>
  );
}
