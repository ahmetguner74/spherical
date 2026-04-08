"use client";

const TYPES = [
  { name: "LiDAR (El)", variable: "--type-lidar-el" },
  { name: "LiDAR (Arac)", variable: "--type-lidar-arac" },
  { name: "Drone Fotogrametri", variable: "--type-drone-fotogrametri" },
  { name: "Oblik Cekim", variable: "--type-oblik-cekim" },
  { name: "360 Panorama", variable: "--type-panorama-360" },
] as const;

export function TypeColors() {
  return (
    <div className="flex flex-wrap gap-3">
      {TYPES.map((t) => (
        <div
          key={t.variable}
          className="flex items-center gap-2 rounded-md px-3 py-1.5"
          style={{ backgroundColor: `var(${t.variable}-bg)` }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: `var(${t.variable})` }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: `var(${t.variable})` }}
          >
            {t.name}
          </span>
        </div>
      ))}
    </div>
  );
}
