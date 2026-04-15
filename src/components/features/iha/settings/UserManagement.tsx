"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { FormInput } from "@/components/ui/FormInput";
import { IconEdit, IconCheck, IconClose, IconLoader } from "@/config/icons";
import type { UserRole } from "@/components/providers/AuthProvider";

// ─── Types ───

interface ProfileRow {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

// ─── Component ───

export function UserManagement() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Profilleri çek
  const loadProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, role, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      toast("Kullanıcılar yüklenemedi", "error");
      return;
    }
    setProfiles(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  // Rol değiştir
  const toggleRole = useCallback(async (profileId: string, currentRole: UserRole) => {
    if (profileId === user?.id) {
      toast("Kendi rolünüzü değiştiremezsiniz", "error");
      return;
    }
    const newRole: UserRole = currentRole === "admin" ? "kullanici" : "admin";
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profileId);

    if (error) {
      toast("Rol değiştirilemedi", "error");
    } else {
      toast(`Rol "${newRole}" olarak güncellendi`, "success");
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      );
    }
    setSaving(false);
  }, [user?.id]);

  // İsim düzenleme başlat
  const startEdit = useCallback((profile: ProfileRow) => {
    setEditingId(profile.id);
    setEditName(profile.display_name);
  }, []);

  // İsim kaydet
  const saveName = useCallback(async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: editName.trim() })
      .eq("id", editingId);

    if (error) {
      toast("İsim güncellenemedi", "error");
    } else {
      toast("Görünen ad güncellendi", "success");
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === editingId ? { ...p, display_name: editName.trim() } : p
        )
      );
    }
    setEditingId(null);
    setEditName("");
    setSaving(false);
  }, [editingId, editName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          {profiles.length} kullanıcı kayıtlı
        </p>
      </div>

      {/* Kullanıcı kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {profiles.map((p) => (
          <UserCard
            key={p.id}
            profile={p}
            isSelf={p.id === user?.id}
            saving={saving}
            onToggleRole={() => toggleRole(p.id, p.role)}
            onEditName={() => startEdit(p)}
          />
        ))}
      </div>

      {/* İsim düzenleme modal */}
      <Modal open={editingId !== null} onClose={() => setEditingId(null)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
          Görünen Adı Düzenle
        </h2>
        <FormInput
          label="Görünen Ad"
          required
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="px-3 py-2 text-sm rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--surface)] transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={saveName}
            disabled={saving || !editName.trim()}
            className="px-3 py-2 text-sm rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {saving ? <IconLoader className="h-3.5 w-3.5 animate-spin" /> : <IconCheck className="h-3.5 w-3.5" />}
            Kaydet
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── UserCard ───

interface UserCardProps {
  profile: ProfileRow;
  isSelf: boolean;
  saving: boolean;
  onToggleRole: () => void;
  onEditName: () => void;
}

function UserCard({ profile, isSelf, saving, onToggleRole, onEditName }: UserCardProps) {
  const initials = profile.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : profile.email.slice(0, 2).toUpperCase();

  const createdDate = new Date(profile.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>

        {/* Bilgiler */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {profile.display_name || profile.email.split("@")[0]}
            </p>
            {isSelf && (
              <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">(Sen)</span>
            )}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] truncate">
            {profile.email}
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Kayıt: {createdDate}
          </p>
        </div>
      </div>

      {/* Alt kısım: Rol + İşlemler */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
        <Badge variant={profile.role === "admin" ? "success" : "default"}>
          {profile.role === "admin" ? "Admin" : "Kullanıcı"}
        </Badge>

        <div className="flex items-center gap-1">
          {/* İsim düzenle */}
          <button
            type="button"
            onClick={onEditName}
            title="Adı düzenle"
            className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-colors"
          >
            <IconEdit className="h-3.5 w-3.5" />
          </button>

          {/* Rol değiştir */}
          {!isSelf && (
            <button
              type="button"
              onClick={onToggleRole}
              disabled={saving}
              title={profile.role === "admin" ? "Kullanıcıya çevir" : "Admin yap"}
              className="px-2 py-1 text-xs rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)] disabled:opacity-50 transition-colors"
            >
              {profile.role === "admin" ? "Kullanıcı Yap" : "Admin Yap"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
