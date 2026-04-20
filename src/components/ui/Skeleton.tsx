/**
 * Skeleton — veri yüklenirken görünen animasyonlu yer tutucu bileşenleri.
 * Harici bağımlılık yok; mevcut CSS değişkenlerini kullanır.
 */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Tek şerit yer tutucu */
export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[var(--surface-hover)] ${className}`}
      style={style}
    />
  );
}

/** 4'lü KPI kart iskeletleri */
export function KpiCardsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] p-3 flex flex-col gap-2"
            style={{ backgroundColor: "var(--surface-hover)" }}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-10" />
          </div>
        ))}
      </div>
      {/* Dikkat bölümü yer tutucu */}
      <Skeleton className="h-12 rounded-xl" />
    </div>
  );
}

/** Operasyon listesi iskeletleri */
export function OperationListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)]"
        >
          <Skeleton className="h-4 w-4 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** StatusBoard kanban iskeletleri */
export function StatusBoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]" style={{ backgroundColor: "var(--surface-hover)" }}>
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="px-2 py-1.5 space-y-0.5">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-7 w-full rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
