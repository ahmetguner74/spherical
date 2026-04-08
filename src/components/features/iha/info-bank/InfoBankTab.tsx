"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchInfoBank, upsertInfoEntry, deleteInfoEntry } from "../shared/ihaStorage";
import { InfoCard } from "./InfoCard";
import { InfoEntryModal } from "./InfoEntryModal";
import { VehicleEventsPanel } from "./VehicleEventsPanel";
import { inputClass } from "../shared/styles";
import { INFO_CATEGORY_LABELS } from "@/types/iha";
import type { InfoEntry, InfoCategory } from "@/types/iha";

const CATEGORIES: InfoCategory[] = ["hesap", "lisans", "ag", "sigorta", "arac", "diger"];

export function InfoBankTab() {
  const [entries, setEntries] = useState<InfoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InfoCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InfoEntry | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchInfoBank()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter((e) => {
    if (filter !== "all" && e.category !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const searchable = [e.title, e.notes, ...e.fields.map((f) => f.key + " " + f.value)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: filtered.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0);

  const handleAdd = () => {
    setSelected(undefined);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<InfoEntry, "id" | "createdAt" | "updatedAt">) => {
    const entry: InfoEntry = {
      ...data,
      id: selected?.id ?? crypto.randomUUID(),
      createdAt: selected?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await upsertInfoEntry(entry);
    setIsModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteInfoEntry(id);
    setIsModalOpen(false);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara..."
            className={`${inputClass} w-full max-w-xs`}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as InfoCategory | "all")}
            className={inputClass}
          >
            <option value="all">Tüm Kategoriler</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{INFO_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + Yeni Kayıt
        </button>
      </div>

      {grouped.length === 0 && (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          {entries.length === 0 ? "Henüz bilgi eklenmemiş." : "Sonuç bulunamadı."}
        </div>
      )}

      {/* Araç Etkinlikleri — "arac" filtre veya "all" iken göster */}
      {(filter === "all" || filter === "arac") && (
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider pt-2">
            Araç Takip & Etkinlikler
          </h3>
          <VehicleEventsPanel />
        </div>
      )}

      {grouped.map(({ category, items }) => (
        <div key={category} className="space-y-1.5">
          <h3 className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider pt-2">
            {INFO_CATEGORY_LABELS[category]}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {items.map((entry) => (
              <InfoCard
                key={entry.id}
                entry={entry}
                onClick={() => { setSelected(entry); setIsModalOpen(true); }}
              />
            ))}
          </div>
        </div>
      ))}

      <InfoEntryModal
        entry={selected}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
