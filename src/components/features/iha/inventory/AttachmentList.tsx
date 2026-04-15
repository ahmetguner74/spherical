"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui";
import * as db from "../shared/ihaStorage";
import { useIhaStore } from "../shared/ihaStore";
import { useToast } from "@/components/ui/Toast";
import type { Attachment } from "@/types/iha";

interface AttachmentListProps {
  parentTable: string;
  parentId: string;
  label?: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp", "gif", "doc", "docx", "xls", "xlsx", "csv", "zip", "rar", "dwg", "dxf", "las", "laz", "tif", "tiff", "geojson", "shp", "kml", "kmz"];

export function AttachmentList({ parentTable, parentId, label }: AttachmentListProps) {
  const { isAdmin } = useAuth();
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

    // Dosya boyut kontrolu
    if (file.size > MAX_FILE_SIZE) {
      useToast.getState().add(`Dosya boyutu 25 MB'dan buyuk olamaz (${(file.size / 1048576).toFixed(1)} MB)`, "error");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    // Dosya tipi kontrolu
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      useToast.getState().add(`Bu dosya tipi desteklenmiyor (.${ext}). Desteklenen: ${ALLOWED_EXTENSIONS.slice(0, 5).join(", ")}...`, "error");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      await db.uploadAttachment(file, parentTable, parentId);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      useToast.getState().add(`Dosya yuklenemedi: ${msg}`, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = (att: Attachment) => {
    db.deleteAttachment(att.id, att.fileUrl).then(load).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("row-level security") || msg.includes("policy") || msg.includes("permission denied")) {
        const userId = useIhaStore.getState().currentUserId ?? "bilinmiyor";
        db.addAuditEntry({ action: "yetki_reddedildi", target: "ekipman", targetId: att.id, description: "Yetkisiz dosya silme engellendi", performedBy: userId }).catch(() => {});
        useToast.getState().add("Bu islem icin yetkiniz yok", "error");
      } else {
        useToast.getState().add(`Hata: ${msg}`, "error");
      }
    });
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="rounded-lg p-3 space-y-3 border border-[var(--border)]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          {label ?? "Dosya Ekleri"}
        </p>
        <label className="text-xs text-[var(--accent)] hover:underline cursor-pointer">
          {uploading ? "Yukleniyor..." : "+ Dosya Ekle"}
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <p className="text-xs text-[var(--muted-foreground)]">Yukleniyor...</p>
      ) : files.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)]">Henuz dosya eklenmemis</p>
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
              {isAdmin && (
                <Button type="button" variant="danger" size="sm" className="min-h-[44px] ml-2 shrink-0" onClick={() => handleDelete(att)}>Sil</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
