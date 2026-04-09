"use client";

const SECTIONS = [
  {
    title: "Ana Renkler",
    colors: [
      { name: "Background", var: "--background" },
      { name: "Foreground", var: "--foreground" },
      { name: "Surface", var: "--surface" },
      { name: "Surface Hover", var: "--surface-hover" },
      { name: "Accent", var: "--accent" },
      { name: "Accent Hover", var: "--accent-hover" },
      { name: "Accent Secondary", var: "--accent-secondary" },
      { name: "Border", var: "--border" },
      { name: "Muted FG", var: "--muted-foreground" },
    ],
  },
  {
    title: "Durum Renkleri",
    colors: [
      { name: "Talep", var: "--status-talep" },
      { name: "Planlama", var: "--status-planlama" },
      { name: "Saha", var: "--status-saha" },
      { name: "İşleme", var: "--status-isleme" },
      { name: "Kontrol", var: "--status-kontrol" },
      { name: "Teslim", var: "--status-teslim" },
      { name: "İptal", var: "--status-iptal" },
    ],
  },
  {
    title: "Operasyon Tipleri",
    colors: [
      { name: "LiDAR El", var: "--type-lidar-el" },
      { name: "LiDAR Araç", var: "--type-lidar-arac" },
      { name: "Drone", var: "--type-drone-fotogrametri" },
      { name: "Oblik", var: "--type-oblik-cekim" },
      { name: "Panorama", var: "--type-panorama-360" },
    ],
  },
  {
    title: "Öncelik",
    colors: [
      { name: "Acil", var: "--priority-acil" },
      { name: "Yüksek", var: "--priority-yuksek" },
      { name: "Normal", var: "--priority-normal" },
      { name: "Düşük", var: "--priority-dusuk" },
    ],
  },
  {
    title: "Feedback",
    colors: [
      { name: "Success", var: "--feedback-success" },
      { name: "Error", var: "--feedback-error" },
      { name: "Info", var: "--feedback-info" },
      { name: "Warning", var: "--feedback-warning" },
    ],
  },
];

export function ColorPalette() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Renk Paleti</h2>
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              {section.colors.map((c) => (
                <div key={c.var} className="text-center">
                  <div
                    className="w-full aspect-square rounded-lg border border-[var(--border)] mb-1"
                    style={{ backgroundColor: `var(${c.var})` }}
                  />
                  <p className="text-[10px] font-medium text-[var(--foreground)]">{c.name}</p>
                  <p className="text-[9px] text-[var(--muted-foreground)] font-mono">{c.var}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
