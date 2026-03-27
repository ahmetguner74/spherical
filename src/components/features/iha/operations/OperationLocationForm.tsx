"use client";

import { useState } from "react";
import type { OperationLocation } from "@/types/iha";
import { MapPicker } from "../map";

interface OperationLocationFormProps {
  location: OperationLocation;
  onChange: (location: OperationLocation) => void;
}

const inputClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export function OperationLocationForm({ location, onChange }: OperationLocationFormProps) {
  const [showMap, setShowMap] = useState(false);

  const update = (key: keyof OperationLocation, value: string | number) => {
    onChange({ ...location, [key]: value });
  };

  const handleMapSelect = (lat: number, lng: number) => {
    onChange({ ...location, lat, lng });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Konum Bilgisi
        </h4>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="text-xs text-[var(--accent)] hover:underline"
        >
          {showMap ? "Haritayı Gizle" : "Haritada Seç"}
        </button>
      </div>

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

      {/* Harita veya elle koordinat girişi */}
      {showMap ? (
        <div className="space-y-2">
          <MapPicker
            lat={location.lat}
            lng={location.lng}
            onSelect={handleMapSelect}
            className="h-48 w-full rounded-lg"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Haritaya tıklayarak konum seçin
            {location.lat && location.lng && (
              <span className="ml-2 font-mono text-[var(--accent)]">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </span>
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Enlem</label>
            <input type="number" step="any" value={location.lat ?? ""} onChange={(e) => update("lat", Number(e.target.value))} className={inputClass} placeholder="40.1885" />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Boylam</label>
            <input type="number" step="any" value={location.lng ?? ""} onChange={(e) => update("lng", Number(e.target.value))} className={inputClass} placeholder="29.0610" />
          </div>
        </div>
      )}
    </div>
  );
}
