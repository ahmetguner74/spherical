"use client";

import type { OperationLocation } from "@/types/iha";

interface OperationLocationFormProps {
  location: OperationLocation;
  onChange: (location: OperationLocation) => void;
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function OperationLocationForm({ location, onChange }: OperationLocationFormProps) {
  const update = (key: keyof OperationLocation, value: string | number) => {
    onChange({ ...location, [key]: value });
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Konum Bilgisi
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">İl *</label>
          <input type="text" value={location.il} onChange={(e) => update("il", e.target.value)} className={inputClass} placeholder="Bursa" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">İlçe *</label>
          <input type="text" value={location.ilce} onChange={(e) => update("ilce", e.target.value)} className={inputClass} placeholder="Osmangazi" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Mahalle</label>
          <input type="text" value={location.mahalle ?? ""} onChange={(e) => update("mahalle", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Pafta</label>
          <input type="text" value={location.pafta ?? ""} onChange={(e) => update("pafta", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Ada</label>
          <input type="text" value={location.ada ?? ""} onChange={(e) => update("ada", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Parsel</label>
          <input type="text" value={location.parsel ?? ""} onChange={(e) => update("parsel", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Alan</label>
          <input type="number" value={location.alan ?? ""} onChange={(e) => update("alan", Number(e.target.value))} className={inputClass} min={0} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Birim</label>
          <select value={location.alanBirimi ?? "m2"} onChange={(e) => update("alanBirimi", e.target.value)} className={inputClass}>
            <option value="m2">m²</option>
            <option value="km2">km²</option>
            <option value="hektar">Hektar</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Enlem (Lat)</label>
          <input type="number" step="any" value={location.lat ?? ""} onChange={(e) => update("lat", Number(e.target.value))} className={inputClass} placeholder="40.1885" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">Boylam (Lng)</label>
          <input type="number" step="any" value={location.lng ?? ""} onChange={(e) => update("lng", Number(e.target.value))} className={inputClass} placeholder="29.0610" />
        </div>
      </div>
    </div>
  );
}
