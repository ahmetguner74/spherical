"use client";

import dynamic from "next/dynamic";

const WorkLocationMap = dynamic(
  () => import("./WorkLocationMap").then((m) => m.WorkLocationMap),
  { ssr: false, loading: () => <div className="h-48 w-full rounded-lg bg-[var(--surface)] animate-pulse" /> },
);

interface Props {
  lat: number;
  lng: number;
  address?: string;
}

export function WorkLocationView({ lat, lng, address }: Props) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-[var(--muted-foreground)]">Konum</h4>
      <WorkLocationMap lat={lat} lng={lng} readonly />
      {address && (
        <p className="text-sm text-[var(--muted-foreground)]">{address}</p>
      )}
    </div>
  );
}
