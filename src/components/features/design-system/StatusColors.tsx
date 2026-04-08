"use client";

const STATUSES = [
  { name: "Talep", variable: "--status-talep" },
  { name: "Planlama", variable: "--status-planlama" },
  { name: "Saha", variable: "--status-saha" },
  { name: "Isleme", variable: "--status-isleme" },
  { name: "Kontrol", variable: "--status-kontrol" },
  { name: "Teslim", variable: "--status-teslim" },
  { name: "Iptal", variable: "--status-iptal" },
] as const;

export function StatusColors() {
  return (
    <div className="flex flex-wrap gap-3">
      {STATUSES.map((s) => (
        <div
          key={s.variable}
          className="flex items-center gap-2 rounded-md px-3 py-1.5"
          style={{ backgroundColor: `var(${s.variable}-bg)` }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: `var(${s.variable})` }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: `var(${s.variable})` }}
          >
            {s.name}
          </span>
        </div>
      ))}
    </div>
  );
}
