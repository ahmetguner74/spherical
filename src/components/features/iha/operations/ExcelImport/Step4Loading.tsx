"use client";

interface Step4LoadingProps {
  progress: {
    done: number;
    total: number;
    added: number;
    skipped: number;
    failed: number;
  };
}

export function Step4Loading({ progress }: Step4LoadingProps) {
  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const isDone = progress.done >= progress.total && progress.total > 0;

  return (
    <div className="space-y-4 py-6">
      {/* Büyük ikon */}
      <div className="text-center">
        {isDone ? (
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center text-3xl">
            ✓
          </div>
        ) : (
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent)]/10 flex items-center justify-center animate-pulse">
            <div className="w-10 h-10 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          {isDone ? "İçe Aktarma Tamamlandı" : "İçe Aktarılıyor..."}
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {progress.done} / {progress.total} kayıt
        </p>
      </div>

      {/* İlerleme çubuğu */}
      <div className="max-w-sm mx-auto">
        <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-2">
          %{percent}
        </p>
      </div>

      {/* Özet (bitince) */}
      {isDone && (
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
          <div className="rounded-md border border-green-500/30 bg-green-500/5 p-2 text-center">
            <p className="text-[10px] text-green-400 uppercase">Eklendi</p>
            <p className="text-lg font-bold text-green-400">{progress.added}</p>
          </div>
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-2 text-center">
            <p className="text-[10px] text-yellow-400 uppercase">Atlandı</p>
            <p className="text-lg font-bold text-yellow-400">{progress.skipped}</p>
          </div>
          <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2 text-center">
            <p className="text-[10px] text-red-400 uppercase">Hatalı</p>
            <p className="text-lg font-bold text-red-400">{progress.failed}</p>
          </div>
        </div>
      )}
    </div>
  );
}
