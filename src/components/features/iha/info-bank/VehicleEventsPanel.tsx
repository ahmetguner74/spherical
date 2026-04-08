"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { inputClass } from "../shared/styles";
import { useToast } from "@/components/ui/Toast";
import type { VehicleEventType, VehicleEvent } from "@/types/iha";
import { VEHICLE_EVENT_TYPE_LABELS, VEHICLE_EVENT_TYPE_ICONS } from "@/types/iha";

const EVENT_TYPES: VehicleEventType[] = ["muayene", "bakim", "sigorta", "lastik", "genel"];

export function VehicleEventsPanel() {
  const { equipment, vehicleEvents, addVehicleEvent, deleteVehicleEvent, toggleVehicleEventComplete } = useIhaStore();
  const vehicles = equipment.filter((e) => e.category === "arac");

  const [showForm, setShowForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");

  const filtered = selectedVehicle === "all"
    ? vehicleEvents
    : vehicleEvents.filter((e) => e.equipmentId === selectedVehicle);

  const sorted = [...filtered].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return a.eventDate.localeCompare(b.eventDate);
  });

  return (
    <div className="space-y-3">
      <VehicleEventsHeader
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onVehicleChange={setSelectedVehicle}
        onAdd={() => setShowForm(true)}
      />
      {showForm && (
        <VehicleEventForm
          vehicles={vehicles}
          defaultVehicle={selectedVehicle !== "all" ? selectedVehicle : vehicles[0]?.id}
          onSave={(data) => { addVehicleEvent(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {sorted.length === 0 && !showForm && (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
          Araç etkinliği yok. Muayene, bakım, sigorta tarihlerini buradan takip edin.
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

/* ─── Header ─── */
function VehicleEventsHeader({
  vehicles,
  selectedVehicle,
  onVehicleChange,
  onAdd,
}: {
  vehicles: { id: string; name: string }[];
  selectedVehicle: string;
  onVehicleChange: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <select
          value={selectedVehicle}
          onChange={(e) => onVehicleChange(e.target.value)}
          className={`${inputClass} text-xs`}
        >
          <option value="all">Tüm Araçlar</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onAdd}
        className="text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors font-medium"
      >
        + Etkinlik Ekle
      </button>
    </div>
  );
}

/* ─── Etkinlik Formu (Bug Fix) ─── */
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
  const [eventType, setEventType] = useState<VehicleEventType>("bakim");
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
    onSave({
      title: title.trim(),
      eventType,
      eventDate,
      description: description.trim() || undefined,
      equipmentId: equipmentId || undefined,
      equipmentName: vehicle?.name ?? undefined,
      isCompleted: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase">Başlık *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Muayene yenileme"
            autoFocus
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase">Tip</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value as VehicleEventType)} className={inputClass}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{VEHICLE_EVENT_TYPE_ICONS[t]} {VEHICLE_EVENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase">Tarih *</label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase">Araç</label>
          <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className={inputClass}>
            <option value="">Araç seçiniz</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase">Açıklama</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Opsiyonel not" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="text-xs px-3 py-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors">
          İptal
        </button>
        <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors font-medium">
          Kaydet
        </button>
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
          ? "border-red-500/30 bg-red-500/5"
          : isUrgent
          ? "border-yellow-500/30 bg-yellow-500/5"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          event.isCompleted
            ? "bg-[var(--accent)] border-[var(--accent)] text-white"
            : "border-[var(--muted-foreground)]/40 hover:border-[var(--accent)]"
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
          isOverdue ? "bg-red-500/15 text-red-400" : isUrgent ? "bg-yellow-500/15 text-yellow-400" : "bg-[var(--surface-hover)] text-[var(--muted-foreground)]"
        }`}>
          {isOverdue ? `${Math.abs(daysUntil)} gün geçti` : daysUntil === 0 ? "Bugün" : `${daysUntil} gün`}
        </span>
      )}
      <button
        onClick={onDelete}
        className="text-[var(--muted-foreground)] hover:text-red-400 transition-colors text-sm shrink-0 p-1"
        title="Sil"
      >
        ×
      </button>
    </div>
  );
}
