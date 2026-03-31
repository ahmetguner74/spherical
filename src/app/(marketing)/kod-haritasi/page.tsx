"use client";

import dynamic from "next/dynamic";

const CodeMapCanvas = dynamic(
  () =>
    import("@/components/features/code-map").then((m) => ({
      default: m.CodeMapCanvas,
    })),
  { ssr: false, loading: () => <MapLoading /> }
);

export default function KodHaritasiPage() {
  return <CodeMapCanvas />;
}

function MapLoading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#0a0a1a]">
      <p className="text-white/40 text-sm animate-pulse">
        Harita yükleniyor...
      </p>
    </div>
  );
}
