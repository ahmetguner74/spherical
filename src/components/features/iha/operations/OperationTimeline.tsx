"use client";

import type { OperationStatus } from "@/types/iha";
import { OPERATION_STATUS_LABELS } from "@/types/iha";

interface OperationTimelineProps {
  currentStatus: OperationStatus;
}

const STEPS: OperationStatus[] = [
  "talep",
  "planlama",
  "saha",
  "isleme",
  "kontrol",
  "teslim",
];

export function OperationTimeline({ currentStatus }: OperationTimelineProps) {
  if (currentStatus === "iptal") {
    return (
      <div className="text-center py-2">
        <span className="text-sm text-red-500 font-medium">
          Operasyon iptal edildi
        </span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {STEPS.map((step, i) => {
        const isDone = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step} className="flex items-center gap-1 flex-shrink-0">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                isCurrent
                  ? "bg-[var(--accent)] text-white"
                  : isDone
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border)]"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs whitespace-nowrap ${
                isCurrent
                  ? "text-[var(--accent)] font-medium"
                  : isDone
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]"
              }`}
            >
              {OPERATION_STATUS_LABELS[step]}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`w-4 h-0.5 ${
                  i < currentIndex ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
