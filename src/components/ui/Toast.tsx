"use client";

import { create } from "zustand";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastStore {
  toasts: ToastItem[];
  add: (message: string, type?: ToastItem["type"]) => void;
  remove: (id: string) => void;
}

function vibrate() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(50);
  }
}

export function toast(message: string, type?: ToastItem["type"]) {
  useToast.getState().add(message, type);
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = "success") => {
    const id = Date.now().toString(36);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    vibrate();
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const TYPE_CONFIG: Record<string, { icon: string; bg: string }> = {
  success: { icon: "✓", bg: "bg-[var(--feedback-success)] text-white" },
  error: { icon: "✕", bg: "bg-[var(--feedback-error)] text-white" },
  info: { icon: "ℹ", bg: "bg-[var(--feedback-info)] text-white" },
};

export function ToastContainer() {
  const { toasts, remove } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 sm:max-w-sm">
      {toasts.map((t) => {
        const config = TYPE_CONFIG[t.type];
        return (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            role="alert"
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm cursor-pointer ${config.bg}`}
            style={{
              animation: "toastSlideIn 0.25s ease-out, toastFadeOut 0.3s ease-in 3.7s forwards",
            }}
          >
            <span className="text-base font-bold shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-white/20">
              {config.icon}
            </span>
            <span className="flex-1">{t.message}</span>
          </div>
        );
      })}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes toastFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
