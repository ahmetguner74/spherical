"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { selectClass, inputClass } from "../shared/styles";

// ─── Types ───

interface AuditRow {
  id: string;
  action: string;
  target: string;
  target_id: string;
  description: string;
  performed_by: string;
  user_email?: string;
  user_role?: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  session_id?: string;
  performed_at: string;
}

// ─── Etiket / stil haritaları ───

const ACTION_LABELS: Record<string, string> = {
  ekledi: "Ekledi",
  guncelledi: "Güncelledi",
  sildi: "Sildi",
  yetki_reddedildi: "Yetki Reddedildi",
  giris_yapti: "Giriş Yaptı",
  cikis_yapti: "Çıkış Yaptı",
  rol_degistirdi: "Rol Değiştirdi",
};

const ACTION_COLOR: Record<string, { dot: string; text: string; bg: string }> = {
  ekledi:           { dot: "#22c55e", text: "text-[var(--feedback-success)]",  bg: "rgba(34,197,94,0.08)" },
  guncelledi:       { dot: "#f59e0b", text: "text-[var(--feedback-warning)]",  bg: "rgba(245,158,11,0.08)" },
  sildi:            { dot: "#ef4444", text: "text-[var(--feedback-error)]",    bg: "rgba(239,68,68,0.08)" },
  yetki_reddedildi: { dot: "#ef4444", text: "text-[var(--feedback-error)]",    bg: "rgba(239,68,68,0.08)" },
  giris_yapti:      { dot: "#3b82f6", text: "text-[var(--accent)]",            bg: "rgba(59,130,246,0.08)" },
  cikis_yapti:      { dot: "#6b7280", text: "text-[var(--muted-foreground)]",  bg: "rgba(107,114,128,0.08)" },
  rol_degistirdi:   { dot: "#a855f7", text: "text-purple-400",                 bg: "rgba(168,85,247,0.08)" },
};

const TARGET_LABELS: Record<string, string> = {
  operasyon: "Operasyon",
  ekipman: "Ekipman",
  yazilim: "Yazılım",
  personel: "Personel",
  depolama: "Depolama",
  ucus_defteri: "Uçuş Defteri",
  bakim: "Bakım",
  oturum: "Oturum",
  kullanici: "Kullanıcı",
  teslim: "Çıktı",
  izin: "Uçuş İzni",
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Süper Admin",
  admin: "Admin",
  viewer: "Görüntüleyici",
};

// ─── Helpers ───

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

function initials(email?: string, displayName?: string) {
  if (displayName) return displayName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

// ─── Component ───

export function AuditLogList() {
  const { profile } = useAuth();

  // Super admin guard
  if (profile?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-[var(--muted-foreground)]">
        🔒 Bu bölüm yalnızca Süper Admin tarafından görüntülenebilir.
      </div>
    );
  }

  return <AuditLogContent />;
}

function AuditLogContent() {
  const [entries, setEntries]         = useState<AuditRow[]>([]);
  const [profileMap, setProfileMap]   = useState<Record<string, { name: string; role: string }>>({});
  const [loading, setLoading]         = useState(true);
  const [limit, setLimit]             = useState(100);
  const [expandedId, setExpandedId]   = useState<string | null>(null);

  // Filtreler
  const [filterAction, setFilterAction] = useState("");
  const [filterTarget, setFilterTarget] = useState("");
  const [filterUser, setFilterUser]     = useState("");
  const [searchText, setSearchText]     = useState("");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Audit log
      const { data: auditData } = await supabase
        .from("iha_audit_log")
        .select("*")
        .order("performed_at", { ascending: false })
        .limit(limit);

      // Profiles haritası
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, email, role");

      const pMap: Record<string, { name: string; role: string }> = {};
      for (const p of profiles ?? []) {
        pMap[p.id] = { name: p.display_name ?? p.email ?? p.id, role: p.role ?? "" };
      }

      setEntries((auditData ?? []) as AuditRow[]);
      setProfileMap(pMap);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  // Benzersiz kullanıcılar (filtre dropdown için)
  const uniqueUsers = useMemo(() => {
    const ids = new Set(entries.map((e) => e.performed_by));
    return Array.from(ids).map((id) => ({
      id,
      label: profileMap[id]?.name ?? entries.find((e) => e.performed_by === id)?.user_email ?? id.slice(0, 8),
    }));
  }, [entries, profileMap]);

  // Benzersiz hedefler
  const uniqueTargets = useMemo(() => {
    const set = new Set(entries.map((e) => e.target));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let r = entries;
    if (filterAction) r = r.filter((e) => e.action === filterAction);
    if (filterTarget) r = r.filter((e) => e.target === filterTarget);
    if (filterUser)   r = r.filter((e) => e.performed_by === filterUser);
    if (dateFrom)     r = r.filter((e) => e.performed_at >= dateFrom);
    if (dateTo)       r = r.filter((e) => e.performed_at <= dateTo + "T23:59:59");
    if (searchText) {
      const q = searchText.toLowerCase();
      r = r.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          (e.user_email ?? "").toLowerCase().includes(q) ||
          (profileMap[e.performed_by]?.name ?? "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [entries, filterAction, filterTarget, filterUser, dateFrom, dateTo, searchText, profileMap]);

  const resolveUser = (row: AuditRow) => {
    const p = profileMap[row.performed_by];
    return p?.name ?? row.user_email ?? row.performed_by.slice(0, 8) + "…";
  };

  const resolveRole = (row: AuditRow) => {
    const p = profileMap[row.performed_by];
    return p?.role ?? row.user_role ?? "";
  };

  const getColor = (action: string) => ACTION_COLOR[action] ?? { dot: "#6b7280", text: "text-[var(--muted-foreground)]", bg: "rgba(107,114,128,0.08)" };

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-4">
      {/* ── Filtre Çubuğu ── */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
        {/* Arama */}
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Açıklama, kullanıcı veya e-posta ara…"
          className={inputClass + " w-full text-xs"}
        />

        <div className="flex flex-wrap gap-2">
          {/* İşlem */}
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className={selectClass + " text-xs"}>
            <option value="">Tüm İşlemler</option>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          {/* Hedef */}
          <select value={filterTarget} onChange={(e) => setFilterTarget(e.target.value)} className={selectClass + " text-xs"}>
            <option value="">Tüm Modüller</option>
            {uniqueTargets.map((t) => (
              <option key={t} value={t}>{TARGET_LABELS[t] ?? t}</option>
            ))}
          </select>

          {/* Kullanıcı */}
          <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className={selectClass + " text-xs"}>
            <option value="">Tüm Kullanıcılar</option>
            {uniqueUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>

          {/* Tarih aralığı */}
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={selectClass + " text-xs"} title="Başlangıç tarihi" />
          <input type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   className={selectClass + " text-xs"} title="Bitiş tarihi" />

          {/* Kayıt limiti */}
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className={selectClass + " text-xs"}>
            {[50, 100, 250, 500].map((n) => <option key={n} value={n}>Son {n}</option>)}
          </select>

          <span className="ml-auto text-xs text-[var(--muted-foreground)] self-center">
            {filtered.length} / {entries.length} kayıt
          </span>
        </div>
      </div>

      {/* ── Liste ── */}
      {loading ? (
        <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">Yükleniyor…</div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
          {entries.length === 0 ? "Henüz denetim kaydı yok" : "Filtreye uygun kayıt bulunamadı"}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          {filtered.map((e, idx) => {
            const color = getColor(e.action);
            const { date, time } = fmtDateTime(e.performed_at);
            const userName = resolveUser(e);
            const userRole = resolveRole(e);
            const isExpanded = expandedId === e.id;
            const hasDetail = e.old_data ?? e.new_data ?? e.metadata;

            return (
              <div key={e.id}>
                {/* Ana satır */}
                <div
                  className={`flex items-start gap-3 px-3 py-2.5 text-xs cursor-pointer transition-colors hover:bg-[var(--surface-hover)] ${idx !== 0 ? "border-t border-[var(--border)]" : ""}`}
                  style={{ backgroundColor: isExpanded ? color.bg : undefined }}
                  onClick={() => hasDetail && toggleExpand(e.id)}
                  title={hasDetail ? "Detay için tıklayın" : undefined}
                >
                  {/* Renk dot */}
                  <span
                    className="mt-[5px] w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color.dot }}
                  />

                  {/* Kullanıcı avatar */}
                  <div
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: color.dot }}
                  >
                    {initials(e.user_email, profileMap[e.performed_by]?.name)}
                  </div>

                  {/* İçerik */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-semibold ${color.text}`}>
                        {ACTION_LABELS[e.action] ?? e.action}
                      </span>
                      <span className="text-[var(--muted-foreground)]">·</span>
                      <span className="text-[var(--foreground)]">
                        {TARGET_LABELS[e.target] ?? e.target}
                      </span>
                      {userRole && (
                        <>
                          <span className="text-[var(--muted-foreground)]">·</span>
                          <span className="text-[var(--muted-foreground)]">
                            {ROLE_LABELS[userRole] ?? userRole}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[var(--muted-foreground)] truncate mt-0.5">{e.description}</p>
                  </div>

                  {/* Sağ: kullanıcı + tarih */}
                  <div className="shrink-0 text-right">
                    <p className="font-medium text-[var(--foreground)]">{userName}</p>
                    <p className="text-[var(--muted-foreground)]">{date}</p>
                    <p className="text-[var(--muted-foreground)]">{time}</p>
                  </div>

                  {/* Detay oku oku */}
                  {hasDetail && (
                    <span className="text-[var(--muted-foreground)] shrink-0 self-center">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  )}
                </div>

                {/* Açılır detay */}
                {isExpanded && hasDetail && (
                  <div
                    className="px-4 pb-3 pt-2 text-[11px] font-mono space-y-2 border-t border-[var(--border)]"
                    style={{ backgroundColor: color.bg }}
                  >
                    {e.old_data && (
                      <div>
                        <p className="text-[var(--feedback-error)] font-sans font-semibold mb-1">Önceki Değer</p>
                        <pre className="whitespace-pre-wrap break-all text-[var(--muted-foreground)] bg-[var(--background)] rounded p-2">
                          {JSON.stringify(e.old_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {e.new_data && (
                      <div>
                        <p className="text-[var(--feedback-success)] font-sans font-semibold mb-1">Yeni Değer</p>
                        <pre className="whitespace-pre-wrap break-all text-[var(--muted-foreground)] bg-[var(--background)] rounded p-2">
                          {JSON.stringify(e.new_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {e.metadata && (
                      <div>
                        <p className="text-[var(--foreground)] font-sans font-semibold mb-1">Meta</p>
                        <pre className="whitespace-pre-wrap break-all text-[var(--muted-foreground)] bg-[var(--background)] rounded p-2">
                          {JSON.stringify(e.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                    {e.ip_address && (
                      <p className="text-[var(--muted-foreground)] font-sans">
                        IP: <span className="text-[var(--foreground)]">{e.ip_address}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
