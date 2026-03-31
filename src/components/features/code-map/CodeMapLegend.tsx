import { CATEGORIES } from "@/config/codeMap";

export function CodeMapLegend() {
  const entries = Object.entries(CATEGORIES);

  return (
    <div className="absolute top-4 left-4 p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-sm">
      <p className="text-[10px] text-white/40 font-bold tracking-wider mb-2">
        KATEGORİLER
      </p>
      <div className="flex flex-col gap-1.5">
        {entries.map(([key, { color, label }]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            <span className="text-[11px] text-white/70">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
