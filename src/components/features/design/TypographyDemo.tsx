"use client";

const SIZES = [
  { label: "4xl", class: "text-4xl", px: "36px" },
  { label: "3xl", class: "text-3xl", px: "30px" },
  { label: "2xl", class: "text-2xl", px: "24px" },
  { label: "xl", class: "text-xl", px: "20px" },
  { label: "lg", class: "text-lg", px: "18px" },
  { label: "base", class: "text-base", px: "16px" },
  { label: "sm", class: "text-sm", px: "14px" },
  { label: "xs", class: "text-xs", px: "12px" },
];

const WEIGHTS = [
  { label: "Normal", class: "font-normal", value: "400" },
  { label: "Medium", class: "font-medium", value: "500" },
  { label: "Semibold", class: "font-semibold", value: "600" },
  { label: "Bold", class: "font-bold", value: "700" },
];

const SPACING = [
  { label: "0.5", value: "2px" },
  { label: "1", value: "4px" },
  { label: "2", value: "8px" },
  { label: "3", value: "12px" },
  { label: "4", value: "16px" },
  { label: "6", value: "24px" },
  { label: "8", value: "32px" },
  { label: "12", value: "48px" },
];

export function TypographyDemo() {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Tipografi & Spacing</h2>

      {/* Font boyutları */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Font Boyutları</h3>
        <div className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          {SIZES.map((s) => (
            <div key={s.label} className="flex items-baseline gap-3">
              <span className="text-[10px] font-mono text-[var(--muted-foreground)] w-16 shrink-0">{s.label} ({s.px})</span>
              <span className={`${s.class} text-[var(--foreground)]`}>CBS İHA Birimi</span>
            </div>
          ))}
        </div>
      </div>

      {/* Font ağırlıkları */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Font Ağırlıkları</h3>
        <div className="flex flex-wrap gap-3">
          {WEIGHTS.map((w) => (
            <div key={w.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-center">
              <span className={`text-base text-[var(--foreground)] ${w.class}`}>Aa</span>
              <p className="text-[9px] text-[var(--muted-foreground)] mt-0.5">{w.label} ({w.value})</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing ölçeği */}
      <div>
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Spacing (4px Grid)</h3>
        <div className="space-y-1">
          {SPACING.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[var(--muted-foreground)] w-16 shrink-0">p-{s.label} ({s.value})</span>
              <div className="bg-[var(--accent)]/20 rounded" style={{ width: s.value, height: "12px" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
