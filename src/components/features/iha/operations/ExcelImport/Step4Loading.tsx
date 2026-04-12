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
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--feedback-success-bg)] flex items-center justify-center text-3xl">
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
          <div className="rounded-md border border-[var(--feedback-success)]/30 bg-[var(--feedback-success-bg)] p-2 text-center">
            <p className="text-[10px] text-[var(--feedback-success)] uppercase">Eklendi</p>
            <p className="text-lg font-bold text-[var(--feedback-success)]">{progress.added}</p>
          </div>
          <div className="rounded-md border border-[var(--feedback-warning)]/30 bg-[var(--feedback-warning-bg)] p-2 text-center">
            <p className="text-[10px] text-[var(--feedback-warning)] uppercase">Atlandı</p>
            <p className="text-lg font-bold text-[var(--feedback-warning)]">{progress.skipped}</p>
          </div>
          <div className="rounded-md border border-[var(--feedback-error)]/30 bg-[var(--feedback-error-bg)] p-2 text-center">
            <p className="text-[10px] text-[var(--feedback-error)] uppercase">Hatalı</p>
            <p className="text-lg font-bold text-[var(--feedback-error)]">{progress.failed}</p>
          </div>
        </div>
      )}
    </div>
  );
}
