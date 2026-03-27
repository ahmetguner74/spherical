import Link from "next/link";
import { DashboardCard } from "./DashboardCard";

export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      <DashboardCard title="CBS İHA Birimi">
        <p className="text-sm text-[var(--muted-foreground)] mb-2">
          Operasyon yönetim paneli
        </p>
        <div className="space-y-1.5">
          <InfoRow label="Operasyonlar" value="Kanban · Takvim · Harita" />
          <InfoRow label="Uçuş Defteri" value="GPS · PPK · Seyir kaydı" />
          <InfoRow label="Envanter" value="Donanım · Yazılım" />
        </div>
        <Link
          href="/iha-birimi"
          className="inline-block mt-3 text-xs text-[var(--accent)] hover:underline"
        >
          Panele git →
        </Link>
      </DashboardCard>

      <DashboardCard title="Son Projeler">
        <PlaceholderList items={["Spherical Platform", "3D Lab", "GIS 360"]} />
      </DashboardCard>

      <DashboardCard title="Teknolojiler" span="2">
        <div className="flex flex-wrap gap-2">
          {["TypeScript", "React", "Next.js", "Three.js", "CesiumJS", "Leaflet", "Tailwind", "Supabase", "QGIS"].map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-[var(--background)] px-2 py-1 text-xs text-[var(--muted-foreground)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Durum">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          <span className="text-sm text-[var(--foreground)]">Aktif geliştirme</span>
        </div>
      </DashboardCard>
    </div>
  );
}

function PlaceholderList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--foreground)] font-medium">{label}</span>
      <span className="text-[var(--muted-foreground)]">{value}</span>
    </div>
  );
}
