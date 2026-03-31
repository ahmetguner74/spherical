import { CATEGORIES } from "@/config/codeMap";

export function CodeMapLegend() {
  const entries = Object.entries(CATEGORIES);

  return (
    <div className="absolute top-3 left-3 p-2.5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-sm">
      <p className="text-[9px] text-white/30 font-bold tracking-wider mb-1.5">
        RENKLERİN ANLAMLARI
      </p>
      <div className="flex flex-col gap-1">
        {entries.map(([key, { color, label }]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: color }}
            />
            <span className="text-[10px] text-white/60">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
