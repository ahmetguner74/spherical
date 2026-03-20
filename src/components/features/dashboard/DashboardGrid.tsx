import { DashboardCard } from "./DashboardCard";

export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      <DashboardCard title="Hızlı Erişim" span="full">
        <div className="flex flex-wrap gap-2">
          <QuickLink label="Blog" href="/blog" />
          <QuickLink label="Projeler" href="/projects" />
          <QuickLink label="Hakkımda" href="/about" />
        </div>
      </DashboardCard>

      <DashboardCard title="Son Projeler">
        <PlaceholderList items={["Spherical", "3D Lab", "GIS Platform"]} />
      </DashboardCard>

      <DashboardCard title="Son Yazılar">
        <PlaceholderList items={["Next.js 15 Rehberi", "Three.js ile 3D", "TypeScript Tips"]} />
      </DashboardCard>

      <DashboardCard title="İstatistikler">
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Proje" value="6" />
          <StatItem label="Yazı" value="3" />
          <StatItem label="Teknoloji" value="12" />
          <StatItem label="Yıl" value="3+" />
        </div>
      </DashboardCard>

      <DashboardCard title="Teknolojiler" span="2">
        <div className="flex flex-wrap gap-2">
          {["TypeScript", "React", "Next.js", "Three.js", "CesiumJS", "Tailwind", "Node.js", "Supabase"].map((tech) => (
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

function QuickLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="rounded-lg bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] hover:text-white"
    >
      {label}
    </a>
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

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-[var(--accent)]">{value}</div>
      <div className="text-xs text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}
