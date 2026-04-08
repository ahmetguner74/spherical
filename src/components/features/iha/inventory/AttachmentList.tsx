"use client";

import { useState, useEffect, useRef } from "react";
import * as db from "../shared/ihaStorage";
import type { Attachment } from "@/types/iha";

interface AttachmentListProps {
  parentTable: string;
  parentId: string;
  label?: string;
}

export function AttachmentList({ parentTable, parentId, label }: AttachmentListProps) {
  const [files, setFiles] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    db.fetchAttachments(parentTable, parentId)
      .then(setFiles)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [parentTable, parentId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await db.uploadAttachment(file, parentTable, parentId);
      load();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = (att: Attachment) => {
    db.deleteAttachment(att.id, att.fileUrl).then(load);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="ring-2 ring-red-500 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
          {label ?? "Dosya Ekleri"}
        </p>
        <label className="text-xs text-[var(--accent)] hover:underline cursor-pointer">
          {uploading ? "Yükleniyor..." : "+ Dosya Ekle"}
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <p className="text-xs text-[var(--muted-foreground)]">Yükleniyor...</p>
      ) : files.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)]">Henüz dosya eklenmemiş</p>
      ) : (
        <div className="space-y-1.5">
          {files.map((att) => (
            <div key={att.id} className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)] last:border-0">
              <div className="min-w-0 flex-1">
                <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline truncate block">
                  {att.fileName}
                </a>
                <span className="text-[var(--muted-foreground)]">
                  {att.fileType?.toUpperCase()} {formatSize(att.fileSize)}
                </span>
              </div>
              <button onClick={() => handleDelete(att)} className="text-red-400 hover:bg-red-500/10 px-1.5 py-0.5 rounded text-[10px] ml-2 shrink-0">Sil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
