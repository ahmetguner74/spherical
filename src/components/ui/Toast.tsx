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

export function toast(message: string, type?: ToastItem["type"]) {
  useToast.getState().add(message, type);
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = "success") => {
    const id = Date.now().toString(36);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const TYPE_STYLES: Record<string, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-blue-600 text-white",
};

export function ToastContainer() {
  const { toasts, remove } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => remove(toast.id)}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm cursor-pointer animate-in slide-in-from-right ${TYPE_STYLES[toast.type]}`}
          style={{ animation: "slideIn 0.2s ease-out" }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
