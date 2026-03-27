"use client";

import dynamic from "next/dynamic";

export const MapPicker = dynamic(
  () => import("./MapPicker").then((m) => ({ default: m.MapPicker })),
  { ssr: false, loading: () => <MapPlaceholder text="Harita yükleniyor..." /> }
);

export const MapOperations = dynamic(
  () => import("./MapOperations").then((m) => ({ default: m.MapOperations })),
  { ssr: false, loading: () => <MapPlaceholder text="Harita yükleniyor..." /> }
);

export const MapPolygon = dynamic(
  () => import("./MapPolygon").then((m) => ({ default: m.MapPolygon })),
  { ssr: false, loading: () => <MapPlaceholder text="Harita yükleniyor..." /> }
);

function MapPlaceholder({ text }: { text: string }) {
  return (
    <div className="h-56 w-full rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
      <span className="text-sm text-[var(--muted-foreground)]">{text}</span>
    </div>
  );
}
