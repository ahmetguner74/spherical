"use client";

import { useState } from "react";
import type { OperationLocation } from "@/types/iha";
import { MapPicker } from "../map";
import { inputClass } from "../shared/styles";
import { IHA_CONFIG } from "@/config/iha";

interface OperationLocationFormProps {
  location: OperationLocation;
  onChange: (location: OperationLocation) => void;
}

export function OperationLocationForm({ location, onChange }: OperationLocationFormProps) {
  const [showMap, setShowMap] = useState(false);

  const update = (key: keyof OperationLocation, value: string | number) => {
    onChange({ ...location, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Konum
        </h4>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="text-xs text-[var(--accent)] hover:underline"
        >
          {showMap ? "Gizle" : "Haritada Seç"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">İl *</label>
          <input type="text" value={location.il} onChange={(e) => update("il", e.target.value)} className={inputClass} placeholder={IHA_CONFIG.defaultLocation.il} />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted-foreground)] mb-1">İlçe *</label>
          <input type="text" value={location.ilce} onChange={(e) => update("ilce", e.target.value)} className={inputClass} placeholder="Osmangazi" />
        </div>
      </div>

      {showMap ? (
        <div className="space-y-2">
          <MapPicker
            lat={location.lat}
            lng={location.lng}
            onSelect={(lat, lng) => onChange({ ...location, lat, lng })}
            className="h-40 sm:h-48 w-full rounded-lg"
          />
          {location.lat && location.lng && (
            <p className="text-xs text-[var(--muted-foreground)]">
              <span className="font-mono text-[var(--accent)]">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </p>
          )}
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
