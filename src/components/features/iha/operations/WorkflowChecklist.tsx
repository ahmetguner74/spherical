"use client";

import { useMemo, useState } from "react";
import type { Operation } from "@/types/iha";
import { WORKFLOW_STEPS } from "@/config/workflowSteps";

interface WorkflowChecklistProps {
  operation: Operation;
  onUpdate: (completedSteps: string[]) => void;
}

export function WorkflowChecklist({ operation, onUpdate }: WorkflowChecklistProps) {
  const steps = WORKFLOW_STEPS[operation.type] ?? [];
  const notesSignature = `${operation.id}:${operation.notes ?? ""}`;
  const savedChecked = useMemo(() => {
    const saved = operation.notes?.match(/\[workflow:(.*?)\]/)?.[1];
    return saved ? new Set(saved.split(",")) : new Set<string>();
  }, [operation.notes]);
  const [localState, setLocalState] = useState<{ signature: string; checked: Set<string> } | null>(null);
  const checked = localState?.signature === notesSignature ? localState.checked : savedChecked;

  const toggle = (stepId: string) => {
    const next = new Set(checked);
    if (next.has(stepId)) {
      next.delete(stepId);
    } else {
      next.add(stepId);
    }
    setLocalState({ signature: notesSignature, checked: next });
    onUpdate(Array.from(next));
  };

  const completedCount = checked.size;
  const totalCount = steps.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-[var(--background)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${percent}%`,
              backgroundColor: percent === 100 ? "var(--status-teslim)" : "var(--accent)",
            }}
          />
        </div>
        <span className="text-xs font-medium text-[var(--muted-foreground)] whitespace-nowrap">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step, i) => {
          const isDone = checked.has(step.id);
          const isPrev = i > 0 && !checked.has(steps[i - 1].id);

          return (
            <button
              key={step.id}
              onClick={() => toggle(step.id)}
              className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-colors min-h-[44px] ${
                isDone
                  ? "bg-[var(--accent)]/5"
                  : "hover:bg-[var(--surface-hover)]"
              }`}
            >
              {/* Checkbox */}
              <span className={`mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs border transition-colors ${
                isDone
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                  : isPrev
                  ? "border-[var(--border)] text-transparent"
                  : "border-[var(--muted-foreground)]/50 text-transparent"
              }`}>
                {isDone ? "✓" : ""}
              </span>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <span className={`text-sm ${
                  isDone ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"
                }`}>
                  {step.label}
                </span>
                {step.description && (
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Step number */}
              <span className="text-[10px] text-[var(--muted-foreground)] mt-1 shrink-0">
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
