"use client";

import { create } from "zustand";
import type {
  Equipment, Software, StorageUnit, TeamMember,
  Operation, FlightLog, FlightPermission,
  AuditEntry, IhaTab,
  EquipmentCategory, OperationStatus, OperationType,
  Deliverable, StorageFolder, CheckoutEntry,
  VehicleEvent,
} from "@/types/iha";
import * as db from "./ihaStorage";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";

// --- Filters ---
interface IhaFilters {
  equipmentCategory: EquipmentCategory | "all";
  operationStatus: OperationStatus | "all";
  operationType: OperationType | "all";
  searchText: string;
  showOnlyMine: boolean;
}

// --- Cache: burst deduplication ---
// Mutation sonrası reloadTable çağrılır + realtime event aynı tabloyu tetikler.
// Bu iki olay arasında genelde 100-300ms fark vardır. Bu TTL'den daha kısa
// olanları tekrar fetch etmeyiz → network tasarrufu + daha az UI flicker.
const RELOAD_DEDUPE_MS = 1000;

// --- Store State ---
interface IhaState {
  equipment: Equipment[];
  software: Software[];
  storage: StorageUnit[];
  team: TeamMember[];
  operations: Operation[];
  flightLogs: FlightLog[];
  flightPermissions: FlightPermission[];
  auditLog: AuditEntry[];
  vehicleEvents: VehicleEvent[];

  activeTab: IhaTab;
  filters: IhaFilters;
  myMemberId: string | null;
  /** Supabase Auth user ID — audit log'da performedBy olarak kullanılır */
  currentUserId: string | null;
  initialized: boolean;
  loading: boolean;
  /** 3 başarısız initialize → true → ReloginOverlay gösterilir */
  degraded: boolean;
  /** Başarısız initialize denemeleri sayacı */
  _initFails: number;
  /** Cache: tablo → son fetch zamanı (ms). Burst deduplication için. */
  _lastReload: Record<string, number>;

  setActiveTab: (tab: IhaTab) => void;
  setMyMemberId: (id: string | null) => void;
  setCurrentUserId: (id: string | null) => void;
  setFilter: <K extends keyof IhaFilters>(key: K, value: IhaFilters[K]) => void;

  // Equipment
  addEquipment: (item: Omit<Equipment, "id">) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addCheckoutEntry: (equipmentId: string, entry: Omit<CheckoutEntry, "id">) => void;
  returnEquipment: (equipmentId: string, entryId: string) => void;

  // Software
  addSoftware: (item: Omit<Software, "id">) => void;
  updateSoftware: (id: string, updates: Partial<Software>) => void;
  deleteSoftware: (id: string) => void;

  // Storage
  updateStorage: (id: string, updates: Partial<StorageUnit>) => void;
  addStorageFolder: (storageId: string, folder: Omit<StorageFolder, "id" | "storageId" | "createdAt">) => void;
  removeStorageFolder: (storageId: string, folderId: string) => void;

  // Team
  addTeamMember: (item: Omit<TeamMember, "id">) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  // Operations
  addOperation: (item: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;
  addDeliverable: (operationId: string, deliverable: Omit<Deliverable, "id">) => void;
  removeDeliverable: (operationId: string, deliverableId: string) => void;

  // Flight Logs
  addFlightLog: (item: Omit<FlightLog, "id" | "createdAt" | "updatedAt">) => void;
  updateFlightLog: (id: string, updates: Partial<FlightLog>) => void;
  deleteFlightLog: (id: string) => void;

  // Flight Permissions
  addFlightPermission: (item: Omit<FlightPermission, "id" | "createdAt">) => void;
  updateFlightPermission: (id: string, updates: Partial<FlightPermission>) => void;
  deleteFlightPermission: (id: string) => void;

  // Vehicle Events
  addVehicleEvent: (event: Omit<VehicleEvent, "id" | "createdAt">) => void;
  updateVehicleEvent: (id: string, updates: Partial<VehicleEvent>) => void;
  deleteVehicleEvent: (id: string) => void;
  toggleVehicleEventComplete: (id: string, isCompleted: boolean) => void;

  // Init
  initialize: () => Promise<void>;
  reload: () => Promise<void>;
  reloadTable: (table: "operations" | "equipment" | "software" | "team" | "storage" | "flightLogs" | "flightPermissions" | "vehicleEvents") => void;
}

// --- Helper: Supabase'den tüm verileri çek ---
async function fetchAll() {
  const [operations, flightPermissions, flightLogs, equipment, software, team, storage, auditLog, vehicleEvents] =
    await Promise.all([
      db.fetchOperations(),
      db.fetchFlightPermissions(),
      db.fetchFlightLogs(),
      db.fetchEquipment(),
      db.fetchSoftware(),
      db.fetchTeam(),
      db.fetchStorage(),
      db.fetchAuditLog(100),
      db.fetchVehicleEvents().catch(() => [] as VehicleEvent[]),
    ]);
  return { operations, flightPermissions, flightLogs, equipment, software, team, storage, auditLog, vehicleEvents };
}

// --- Helper: Audit log ---
function audit(action: AuditEntry["action"], target: AuditEntry["target"], targetId: string, description: string) {
  const userId = useIhaStore.getState().currentUserId ?? "bilinmiyor";
  db.addAuditEntry({ action, target, targetId, description, performedBy: userId }).catch(() => {});
}

// --- Helper: Toast bildirimi ---
function toast(message: string, type: "success" | "error" | "info" = "success") {
  useToast.getState().add(message, type);
}

function isRlsError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("row-level security") || msg.includes("policy") || msg.includes("permission denied") || msg.includes("RLS");
}

function onError(msg: string, auditTarget?: AuditEntry["target"], auditTargetId?: string) {
  return (err: unknown) => {
    const detail = err instanceof Error ? err.message : String(err);
    logger.error(msg, err);
    if (isRlsError(err)) {
      toast("Bu işlem için yetkiniz yok", "error");
      if (auditTarget) {
        audit("yetki_reddedildi", auditTarget, auditTargetId ?? "", `Yetkisiz işlem engellendi: ${msg}`);
      }
    } else {
      toast(`Hata: ${msg} — ${detail}`, "error");
    }
  };
}

function onVehicleEventError(msg: string) {
  return (err: unknown) => {
    const detail = err instanceof Error ? err.message : String(err);
    const isTableMissing = detail.includes("iha_vehicle_events") || detail.includes("does not exist") || detail.includes("relation");
    logger.error(msg, err);
    if (isTableMissing) {
      toast("Araç etkinlik tablosu henüz oluşturulmamış. Supabase SQL editöründe iha-schema.sql dosyasındaki tabloyu çalıştırın.", "error");
    } else {
      toast(`Hata: ${msg} — ${detail}`, "error");
    }
  };
}

export const useIhaStore = create<IhaState>()((set, get) => ({
  equipment: [],
  software: [],
  storage: [],
  team: [],
  operations: [],
  flightLogs: [],
  flightPermissions: [],
  auditLog: [],
  vehicleEvents: [],
  activeTab: "dashboard",
  filters: { equipmentCategory: "all", operationStatus: "all", operationType: "all", searchText: "", showOnlyMine: false },
  myMemberId: typeof window !== "undefined" ? localStorage.getItem("iha_my_member_id") : null,
  currentUserId: null,
  initialized: false,
  loading: false,
  degraded: false,
  _initFails: 0,
  _lastReload: {},

  setActiveTab: (tab) => set({ activeTab: tab }),
  setMyMemberId: (id) => {
    if (id) localStorage.setItem("iha_my_member_id", id);
    else localStorage.removeItem("iha_my_member_id");
    set({ myMemberId: id });
  },
  setCurrentUserId: (id) => set({ currentUserId: id }),
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),

  // --- Initialize: Supabase'den tüm verileri çek ---
  initialize: async () => {
    const s = get();
    if (s.initialized || s.loading) return;
    set({ loading: true, degraded: false });

    // KRİTİK: Yarış durumunu önle — sorgudan önce session'ın geçerli olduğunu
    // sunucuya doğrulat. getUser() hem token'ı doğrular hem gerekirse refresh eder.
    // Bu yapılmazsa refresh sonrası token geçerli değilken sorgular boş dönebilir.
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        // Oturum gerçekten yok → AuthProvider SIGNED_OUT eventi ile yakalayacak
        // Burada sadece kendi state'imizi temizle
        set({ loading: false, initialized: false, degraded: false });
        return;
      }
    } catch (err) {
      logger.error("Auth doğrulama hatası", err);
      set({ loading: false, initialized: false, degraded: false });
      return;
    }

    try {
      const data = await fetchAll();
      set({ ...data, initialized: true, loading: false, _initFails: 0, degraded: false });
      // Arka planda seed — eksik varsayılan verileri Supabase'e ekle
      const [eqAdded, swAdded] = await Promise.all([
        db.seedEquipment().catch(() => 0),
        db.seedSoftware().catch(() => 0),
      ]);
      if (eqAdded > 0 || swAdded > 0) {
        const [equipment, software] = await Promise.all([
          db.fetchEquipment(),
          db.fetchSoftware(),
        ]);
        set({ equipment, software });
        toast(`${eqAdded + swAdded} varsayılan envanter verisi yüklendi`, "info");
      }
    } catch (err) {
      logger.error("fetchAll hatası", err);
      const fails = (get()._initFails ?? 0) + 1;
      if (fails >= 3) {
        // 3 başarısız deneme → degraded: true → ReloginOverlay gösterilir
        set({ loading: false, _initFails: fails, degraded: true });
      } else {
        // Yeniden denenebilir — useIhaData 2sn sonra tekrar deneyecek
        toast("Veri yüklenemedi — yeniden denenecek...", "error");
        set({ initialized: false, loading: false, _initFails: fails });
      }
    }
  },

  reload: async () => {
    set({ loading: true });
    // Auth doğrulaması — tab/visibility değişiminde token refresh sürebilir
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        set({ loading: false });
        return;
      }
    } catch {
      set({ loading: false });
      return;
    }
    try {
      const data = await fetchAll();
      set({ ...data, loading: false });
    } catch {
      // Hata → mevcut veriyi koru, sadece loading'i kapat
      set({ loading: false });
    }
  },

  // Sadece belirli tabloyu yenile (performans)
  // Burst deduplication: aynı tablo son RELOAD_DEDUPE_MS içinde çağrıldıysa atla.
  // Nedeni: mutation sonrası manuel reloadTable + Supabase realtime event aynı
  // tabloyu 100-300ms içinde iki kere tetikliyor → gereksiz network + UI flicker.
  reloadTable: (table) => {
    const lastAt = get()._lastReload[table] ?? 0;
    if (Date.now() - lastAt < RELOAD_DEDUPE_MS) return;
    set((s) => ({ _lastReload: { ...s._lastReload, [table]: Date.now() } }));

    const fetchers: Record<string, () => Promise<unknown>> = {
      operations: db.fetchOperations,
      equipment: db.fetchEquipment,
      software: db.fetchSoftware,
      team: db.fetchTeam,
      storage: db.fetchStorage,
      flightLogs: db.fetchFlightLogs,
      flightPermissions: db.fetchFlightPermissions,
      vehicleEvents: db.fetchVehicleEvents,
    };
    fetchers[table]?.()
      .then((data) => set({ [table]: data }))
      .catch(() => {});
  },

  // --- Equipment ---
  addEquipment: (item) => {
    db.upsertEquipment(item as Partial<Equipment>)
      .then(() => { audit("ekledi", "ekipman", "", `${item.name} eklendi`); toast("Ekipman eklendi"); get().reloadTable("equipment"); })
      .catch(onError("İşlem başarısız"));
  },

  updateEquipment: (id, updates) => {
    const eq = get().equipment.find((e) => e.id === id);
    if (!eq) return;
    db.upsertEquipment({ ...eq, ...updates })
      .then(() => { audit("guncelledi", "ekipman", id, "Ekipman güncellendi"); toast("Ekipman güncellendi"); get().reloadTable("equipment"); })
      .catch(onError("İşlem başarısız"));
  },

  deleteEquipment: (id) => {
    db.deleteEquipment(id)
      .then(() => { audit("sildi", "ekipman", id, "Ekipman silindi"); toast("Ekipman silindi"); get().reloadTable("equipment"); })
      .catch(onError("Ekipman silinemedi", "ekipman", id));
  },

  addCheckoutEntry: (equipmentId, entry) => {
    db.addCheckoutEntry(equipmentId, entry)
      .then(() => { audit("guncelledi", "ekipman", equipmentId, `${entry.personName} zimmetine verildi`); toast(`${entry.personName} zimmetine verildi`); get().reloadTable("equipment"); })
      .catch(onError("İşlem başarısız"));
  },

  returnEquipment: (equipmentId, entryId) => {
    db.returnEquipment(equipmentId, entryId)
      .then(() => { audit("guncelledi", "ekipman", equipmentId, "Ekipman iade edildi"); toast("Ekipman iade edildi"); get().reloadTable("equipment"); })
      .catch(onError("İşlem başarısız"));
  },

  // --- Software ---
  addSoftware: (item) => {
    db.upsertSoftware(item as Partial<Software>)
      .then(() => { audit("ekledi", "yazilim", "", `${item.name} eklendi`); toast("Yazılım eklendi"); get().reloadTable("software"); })
      .catch(onError("İşlem başarısız"));
  },

  updateSoftware: (id, updates) => {
    const sw = get().software.find((s) => s.id === id);
    if (!sw) return;
    db.upsertSoftware({ ...sw, ...updates })
      .then(() => { audit("guncelledi", "yazilim", id, "Yazılım güncellendi"); toast("Yazılım güncellendi"); get().reloadTable("software"); })
      .catch(onError("İşlem başarısız"));
  },

  deleteSoftware: (id) => {
    db.deleteSoftware(id)
      .then(() => { audit("sildi", "yazilim", id, "Yazılım silindi"); toast("Yazılım silindi"); get().reloadTable("software"); })
      .catch(onError("Yazılım silinemedi", "yazilim", id));
  },

  // --- Storage ---
  updateStorage: (id, updates) => {
    db.updateStorage(id, updates)
      .then(() => { audit("guncelledi", "depolama", id, "Depolama güncellendi"); toast("Depolama güncellendi"); get().reloadTable("storage"); })
      .catch(onError("İşlem başarısız"));
  },

  addStorageFolder: (storageId, folder) => {
    db.addStorageFolder(storageId, folder)
      .then(() => { audit("ekledi", "depolama", storageId, `Klasör eklendi: ${folder.name}`); toast("Klasör eklendi"); get().reloadTable("storage"); })
      .catch(onError("İşlem başarısız"));
  },

  removeStorageFolder: (_storageId, folderId) => {
    db.removeStorageFolder(folderId)
      .then(() => { audit("sildi", "depolama", folderId, "Klasör silindi"); toast("Klasör silindi"); get().reloadTable("storage"); })
      .catch(onError("Klasör silinemedi", "depolama", folderId));
  },

  // --- Team ---
  addTeamMember: (item) => {
    const member: TeamMember = { ...item, id: crypto.randomUUID() };
    db.upsertTeamMember(member)
      .then(() => { audit("ekledi", "personel", member.id, `${member.name} eklendi`); toast("Personel eklendi"); get().reloadTable("team"); })
      .catch(onError("Personel eklenemedi", "personel", member.id));
  },
  updateTeamMember: (id, updates) => {
    const member = get().team.find((t) => t.id === id);
    if (!member) return;
    db.upsertTeamMember({ ...member, ...updates })
      .then(() => { audit("guncelledi", "personel", id, "Personel güncellendi"); toast("Personel güncellendi"); get().reloadTable("team"); })
      .catch(onError("Personel güncellenemedi", "personel", id));
  },
  deleteTeamMember: (id) => {
    db.deleteTeamMember(id)
      .then(() => { audit("sildi", "personel", id, "Personel silindi"); toast("Personel silindi"); get().reloadTable("team"); })
      .catch(onError("Personel silinemedi", "personel", id));
  },

  // --- Operations (Optimistic Update) ---
  addOperation: (item) => {
    const now = new Date().toISOString();
    const tempId = crypto.randomUUID();
    const optimistic: Operation = {
      ...item, id: tempId, deliverables: [], flightLogIds: [],
      completionPercent: 0, createdAt: now, updatedAt: now,
    } as Operation;
    // Anında UI'a ekle
    set((s) => ({ operations: [optimistic, ...s.operations] }));
    toast("Operasyon oluşturuldu");
    // Arka planda DB'ye yaz
    db.upsertOperation(optimistic as Partial<Operation>)
      .then(() => { audit("ekledi", "operasyon", tempId, `${item.title} eklendi`); get().reloadTable("operations"); })
      .catch((err) => {
        // Hata: optimistic geri al
        set((s) => ({ operations: s.operations.filter((o) => o.id !== tempId) }));
        onError("Operasyon eklenemedi")(err);
      });
  },

  updateOperation: (id, updates) => {
    const op = get().operations.find((o) => o.id === id);
    if (!op) return;
    // Durum değiştiğinde tamamlanma yüzdesini otomatik hesapla
    if (updates.status && !updates.completionPercent) {
      const STATUS_PERCENT: Record<string, number> = {
        talep: 0, planlama: 15, saha: 35, isleme: 60, kontrol: 80, teslim: 100, iptal: 0,
      };
      updates.completionPercent = STATUS_PERCENT[updates.status] ?? op.completionPercent;
    }
    const updated = { ...op, ...updates, updatedAt: new Date().toISOString() };
    // Anında UI güncelle
    set((s) => ({ operations: s.operations.map((o) => o.id === id ? updated : o) }));
    toast("Operasyon güncellendi");
    // Arka planda DB'ye yaz
    db.upsertOperation(updated as Partial<Operation>)
      .then(() => { audit("guncelledi", "operasyon", id, "Operasyon güncellendi"); })
      .catch((err) => {
        // Hata: eski haline geri al
        set((s) => ({ operations: s.operations.map((o) => o.id === id ? op : o) }));
        onError("Operasyon güncellenemedi")(err);
      });
  },

  deleteOperation: (id) => {
    const ops = get().operations;
    // Anında UI'dan kaldır
    set({ operations: ops.filter((o) => o.id !== id) });
    toast("Operasyon silindi");
    // Arka planda DB'den sil
    db.deleteOperation(id)
      .then(() => { audit("sildi", "operasyon", id, "Operasyon silindi"); })
      .catch((err) => {
        set({ operations: ops });
        onError("Operasyon silinemedi", "operasyon", id)(err);
      });
  },

  addDeliverable: (operationId, deliverable) => {
    db.addDeliverable(operationId, deliverable)
      .then(() => { audit("ekledi", "operasyon", operationId, `Çıktı eklendi: ${deliverable.description}`); toast("Çıktı eklendi"); get().reloadTable("operations"); })
      .catch(onError("İşlem başarısız"));
  },

  removeDeliverable: (_operationId, deliverableId) => {
    db.removeDeliverable(deliverableId)
      .then(() => { audit("sildi", "operasyon", deliverableId, "Çıktı silindi"); toast("Çıktı silindi"); get().reloadTable("operations"); })
      .catch(onError("Çıktı silinemedi", "operasyon", deliverableId));
  },

  // --- Flight Logs ---
  addFlightLog: (item) => {
    db.upsertFlightLog(item as Partial<FlightLog>)
      .then(() => { audit("ekledi", "ucus_defteri", "", "Uçuş kaydı eklendi"); toast("Uçuş kaydı eklendi"); get().reloadTable("flightLogs"); })
      .catch(onError("İşlem başarısız"));
  },

  updateFlightLog: (id, updates) => {
    const fl = get().flightLogs.find((f) => f.id === id);
    if (!fl) return;
    db.upsertFlightLog({ ...fl, ...updates })
      .then(() => { audit("guncelledi", "ucus_defteri", id, "Uçuş kaydı güncellendi"); toast("Uçuş kaydı güncellendi"); get().reloadTable("flightLogs"); })
      .catch(onError("İşlem başarısız"));
  },

  deleteFlightLog: (id) => {
    db.deleteFlightLog(id)
      .then(() => { audit("sildi", "ucus_defteri", id, "Uçuş kaydı silindi"); toast("Uçuş kaydı silindi"); get().reloadTable("flightLogs"); })
      .catch(onError("Uçuş kaydı silinemedi", "ucus_defteri", id));
  },

  // --- Flight Permissions (Optimistic Update) ---
  addFlightPermission: (item) => {
    const tempId = crypto.randomUUID();
    const optimistic: FlightPermission = {
      ...item, id: tempId, createdAt: new Date().toISOString(),
    } as FlightPermission;
    // Anında UI'a ekle
    set((s) => ({ flightPermissions: [optimistic, ...s.flightPermissions] }));
    toast("Uçuş izni eklendi");
    // Arka planda DB'ye yaz
    db.upsertFlightPermission(item as Partial<FlightPermission>)
      .then((newId) => {
        audit("ekledi", "operasyon", newId, `Uçuş izni eklendi${item.hsdNumber ? `: ${item.hsdNumber}` : ""}`);
        get().reloadTable("flightPermissions");
      })
      .catch((err) => {
        set((s) => ({ flightPermissions: s.flightPermissions.filter((p) => p.id !== tempId) }));
        onError("İzin eklenemedi")(err);
      });
  },

  updateFlightPermission: (id, updates) => {
    const fp = get().flightPermissions.find((p) => p.id === id);
    if (!fp) return;
    const updated = { ...fp, ...updates };
    // Anında UI güncelle
    set((s) => ({ flightPermissions: s.flightPermissions.map((p) => p.id === id ? updated : p) }));
    toast("Uçuş izni güncellendi");
    // Arka planda DB'ye yaz
    db.upsertFlightPermission(updated as Partial<FlightPermission>)
      .then(() => { audit("guncelledi", "operasyon", id, "Uçuş izni güncellendi"); })
      .catch((err) => {
        set((s) => ({ flightPermissions: s.flightPermissions.map((p) => p.id === id ? fp : p) }));
        onError("İzin güncellenemedi")(err);
      });
  },

  deleteFlightPermission: (id) => {
    const perms = get().flightPermissions;
    const ops = get().operations;
    // Anında UI'dan kaldır
    set({
      flightPermissions: perms.filter((p) => p.id !== id),
      operations: ops.map((o) => o.permissionId === id ? { ...o, permissionId: undefined } : o),
    });
    toast("Uçuş izni silindi");
    // Arka planda DB'den sil
    for (const op of ops.filter((o) => o.permissionId === id)) {
      db.upsertOperation({ ...op, permissionId: undefined }).catch(() => {});
    }
    db.deleteFlightPermission(id)
      .then(() => { audit("sildi", "operasyon", id, "Uçuş izni silindi"); })
      .catch((err) => {
        set({ flightPermissions: perms, operations: ops });
        onError("Uçuş izni silinemedi", "operasyon", id)(err);
      });
  },

  // --- Vehicle Events ---
  addVehicleEvent: (event) => {
    const id = crypto.randomUUID();
    const full: VehicleEvent = { ...event, id, createdAt: new Date().toISOString() };
    set((s) => ({ vehicleEvents: [...s.vehicleEvents, full] }));
    toast("Araç etkinliği eklendi");
    db.upsertVehicleEvent(full)
      .then(() => { audit("ekledi", "ekipman", id, `Araç etkinliği: ${event.title}`); get().reloadTable("vehicleEvents"); })
      .catch((err) => { set((s) => ({ vehicleEvents: s.vehicleEvents.filter((e) => e.id !== id) })); onVehicleEventError("Etkinlik eklenemedi")(err); });
  },

  updateVehicleEvent: (id, updates) => {
    const prev = get().vehicleEvents.find((e) => e.id === id);
    if (!prev) return;
    const updated = { ...prev, ...updates };
    set((s) => ({ vehicleEvents: s.vehicleEvents.map((e) => e.id === id ? updated : e) }));
    toast("Araç etkinliği güncellendi");
    db.upsertVehicleEvent(updated)
      .then(() => { audit("guncelledi", "ekipman", id, `Araç etkinliği güncellendi: ${updated.title}`); })
      .catch((err) => { set((s) => ({ vehicleEvents: s.vehicleEvents.map((e) => e.id === id ? prev : e) })); onVehicleEventError("Etkinlik güncellenemedi")(err); });
  },

  deleteVehicleEvent: (id) => {
    const prev = get().vehicleEvents;
    set({ vehicleEvents: prev.filter((e) => e.id !== id) });
    toast("Araç etkinliği silindi");
    db.deleteVehicleEvent(id)
      .then(() => { audit("sildi", "ekipman", id, "Araç etkinliği silindi"); })
      .catch((err) => {
        set({ vehicleEvents: prev });
        if (isRlsError(err)) { onError("Araç etkinliği silinemedi", "ekipman", id)(err); }
        else { onVehicleEventError("Etkinlik silinemedi")(err); }
      });
  },

  toggleVehicleEventComplete: (id, isCompleted) => {
    const prev = get().vehicleEvents.find((e) => e.id === id);
    if (!prev) return;
    set((s) => ({ vehicleEvents: s.vehicleEvents.map((e) => e.id === id ? { ...e, isCompleted } : e) }));
    toast(isCompleted ? "Tamamlandı olarak işaretlendi" : "Tamamlanmadı olarak işaretlendi");
    db.toggleVehicleEventComplete(id, isCompleted)
      .then(() => { audit("guncelledi", "ekipman", id, `Araç etkinliği ${isCompleted ? "tamamlandı" : "geri alındı"}: ${prev.title}`); })
      .catch((err) => { set((s) => ({ vehicleEvents: s.vehicleEvents.map((e) => e.id === id ? prev : e) })); onVehicleEventError("Durum güncellenemedi")(err); });
  },

}));
