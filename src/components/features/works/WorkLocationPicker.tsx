"use client";

import dynamic from "next/dynamic";

const WorkLocationMap = dynamic(
  () => import("./WorkLocationMap").then((m) => m.WorkLocationMap),
  { ssr: false, loading: () => <div className="h-48 w-full rounded-lg bg-[var(--surface)] animate-pulse" /> },
);

interface Props {
  lat?: number;
  lng?: number;
  address: string;
  onLatLngChange: (lat: number, lng: number) => void;
  onAddressChange: (address: string) => void;
}

export function WorkLocationPicker({ lat, lng, address, onLatLngChange, onAddressChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--foreground)]">Konum</label>
      <WorkLocationMap lat={lat} lng={lng} onSelect={onLatLngChange} />
      <input
        type="text"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder="Adres (ör: Bursa, Osmangazi)"
        className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </div>
  );
}
