"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { FormInput, FormSelect } from "@/components/ui";
import { IconEdit, IconCheck, IconLoader } from "@/config/icons";
import { ALL_ROLES, ROLE_LABELS, type UserRole } from "@/config/permissions";

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
  const { user, profile: myProfile } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const myRole = (myProfile?.role as UserRole) ?? "viewer";

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
    setProfiles((data ?? []) as ProfileRow[]);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  // Rol değiştir
  const changeRole = useCallback(async (profileId: string, newRole: UserRole) => {
    if (profileId === user?.id) {
      toast("Kendi rolünüzü değiştiremezsiniz", "error");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profileId);

    if (error) {
      toast("Rol değiştirilemedi", "error");
    } else {
      toast(`Rol "${ROLE_LABELS[newRole]}" olarak güncellendi`, "success");
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
            myRole={myRole}
            saving={saving}
            onChangeRole={(newRole) => changeRole(p.id, newRole)}
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
  myRole: UserRole;
  saving: boolean;
  onChangeRole: (newRole: UserRole) => void;
  onEditName: () => void;
}

/** Süper admin hangi rolleri atayabilir */
function getAssignableRoles(myRole: UserRole, targetRole: UserRole): UserRole[] {
  if (myRole !== "super_admin") return [];
  // super_admin başka birine super_admin dahil her rol verebilir
  return ALL_ROLES.filter((r) => r !== targetRole);
}

function roleBadgeVariant(role: UserRole): "success" | "info" | "default" {
  if (role === "super_admin") return "info";
  if (role === "admin") return "success";
  return "default";
}

function UserCard({ profile, isSelf, myRole, saving, onChangeRole, onEditName }: UserCardProps) {
  const initials = profile.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : profile.email.slice(0, 2).toUpperCase();

  const createdDate = new Date(profile.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const assignable = getAssignableRoles(myRole, profile.role);

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
        <Badge variant={roleBadgeVariant(profile.role)}>
          {ROLE_LABELS[profile.role]}
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

          {/* Rol değiştir — sadece super_admin ve kendi dışında */}
          {!isSelf && assignable.length > 0 && (
            <FormSelect
              label=""
              value=""
              onChange={(e) => {
                if (e.target.value) onChangeRole(e.target.value as UserRole);
              }}
              disabled={saving}
              selectClassName="text-xs py-1 px-2 min-h-[32px] w-auto border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--muted-foreground)]"
              fieldClassName="mb-0"
            >
              <option value="">Rol Ata</option>
              {assignable.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </FormSelect>
          )}
        </div>
      </div>
    </div>
  );
}
