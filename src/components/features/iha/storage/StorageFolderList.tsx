"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { StorageUnit, StorageFolder } from "@/types/iha";
import { inputClass } from "../shared/styles";

interface StorageFolderListProps {
  storage: StorageUnit;
  onAddFolder: (folder: Omit<StorageFolder, "id" | "storageId" | "createdAt">) => void;
  onRemoveFolder: (folderId: string) => void;
}

export function StorageFolderList({ storage, onAddFolder, onRemoveFolder }: StorageFolderListProps) {
  const [showForm, setShowForm] = useState(false);
  const [confirmFolderId, setConfirmFolderId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [sizeGB, setSizeGB] = useState(0);
  const [description, setDescription] = useState("");

  const folders = storage.folders ?? [];

  const handleAdd = () => {
    if (!name.trim() || !path.trim()) return;
    onAddFolder({
      name: name.trim(),
      path: path.trim(),
      sizeGB: sizeGB || undefined,
      description: description || undefined,
    });
    setName("");
    setPath("");
    setSizeGB(0);
    setDescription("");
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {folders.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
          Henüz klasör tanımlanmamış.
        </p>
      ) : (
        <div className="space-y-2">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--foreground)]">{folder.name}</p>
                <p className="text-xs text-[var(--muted-foreground)] font-mono truncate">
                  {folder.path}
                </p>
                <div className="flex gap-3 text-xs text-[var(--muted-foreground)] mt-0.5">
                  {folder.sizeGB && <span>{folder.sizeGB} GB</span>}
                  {folder.description && <span>{folder.description}</span>}
                </div>
              </div>
              <button
                onClick={() => setConfirmFolderId(folder.id)}
                className="text-red-500 text-xs px-2 py-1 hover:bg-red-500/10 rounded ml-2 flex-shrink-0"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmFolderId}
        onClose={() => setConfirmFolderId(null)}
        onConfirm={() => { if (confirmFolderId) onRemoveFolder(confirmFolderId); }}
        title="Klasörü Sil"
        description="Bu klasör kaydı kalıcı olarak silinecek."
      />

      {showForm ? (
        <div className="space-y-3 p-3 rounded-lg border border-[var(--accent)] bg-[var(--accent)]/5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Klasör Adı *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder={`ör: ${new Date().getFullYear()}-osmangazi`} />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] mb-1">Boyut (GB)</label>
              <input type="number" value={sizeGB} onChange={(e) => setSizeGB(Number(e.target.value))} className={inputClass} min={0} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Yol *</label>
            <input type="text" value={path} onChange={(e) => setPath(e.target.value)} className={inputClass} placeholder={`ör: /${storage.name}/${new Date().getFullYear()}/osmangazi/`} />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">Açıklama</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={!name.trim() || !path.trim()} size="sm">Ekle</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>İptal</Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
          + Klasör Ekle
        </Button>
      )}
    </div>
  );
}
