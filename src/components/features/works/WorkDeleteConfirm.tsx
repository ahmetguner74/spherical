"use client";

import { Modal } from "@/components/ui/Modal";

interface WorkDeleteConfirmProps {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function WorkDeleteConfirm({ open, title, onConfirm, onClose }: WorkDeleteConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-sm">
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">İşi Sil</h2>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        <strong className="text-[var(--foreground)]">{title}</strong> silinecek. Bu işlem geri alınamaz.
      </p>
      <div className="flex items-center gap-2">
        <button onClick={onConfirm} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">
          Sil
        </button>
        <button onClick={onClose} className="rounded-lg bg-[var(--surface-hover)] px-4 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--border)]">
          İptal
        </button>
      </div>
    </Modal>
  );
}
