"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Equipment, Software, StorageUnit, TeamMember,
  Operation, FlightLog, FlightPermission,
  AuditEntry, IhaTab,
  EquipmentCategory, OperationStatus, OperationType,
  Deliverable, StorageFolder, CheckoutEntry,
  VehicleEvent,
} from "@/types/iha";
import * as db from "./ihaStorage";
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
  /** Cache'in son başarılı tazelenme zamanı (ms epoch). null → hiç senkron olmadı. */
  lastSyncedAt: number | null;
  /** Ağ ile son senkron başarısız → cached veri gösteriliyor. UI küçük rozet basar. */
  staleData: boolean;

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
/** Bir promise'ı süre sonunda timeout hatası ile reject et */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${label}`)), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

/** Tek sorgu: zamanlanmış log + timeout + hata yutma (boş dizi) */
async function safeFetch<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  const t0 = Date.now();
  try {
    const result = await withTimeout(fn(), 12000, label);
    const dt = Date.now() - t0;
    const count = Array.isArray(result) ? result.length : "?";
    console.log(`[IHA] ${label}: ${count} kayıt (${dt}ms)`);
    return result;
  } catch (err) {
    const dt = Date.now() - t0;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[IHA] ${label} BAŞARISIZ (${dt}ms):`, msg);
    useToast.getState().add(`${label} yüklenemedi: ${msg}`, "error");
    return fallback;
  }
}

async function fetchAll() {
  // Promise.all yerine her biri bağımsız → biri takılsa diğerleri gelir.
  // Her sorguya 12 saniye timeout → sonsuz bekleme yok.
  const [operations, flightPermissions, flightLogs, equipment, software, team, storage, auditLog, vehicleEvents] =
    await Promise.all([
      safeFetch("operations", db.fetchOperations, [] as Operation[]),
      safeFetch("flightPermissions", db.fetchFlightPermissions, [] as FlightPermission[]),
      safeFetch("flightLogs", db.fetchFlightLogs, [] as FlightLog[]),
      safeFetch("equipment", db.fetchEquipment, [] as Equipment[]),
      safeFetch("software", db.fetchSoftware, [] as Software[]),
      safeFetch("team", db.fetchTeam, [] as TeamMember[]),
      safeFetch("storage", db.fetchStorage, [] as StorageUnit[]),
      safeFetch("auditLog", () => db.fetchAuditLog(100), [] as AuditEntry[]),
      safeFetch("vehicleEvents", db.fetchVehicleEvents, [] as VehicleEvent[]),
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

// UI state kalıcılığı — sadece activeTab + filters localStorage'da tutulur.
// Veri (operations, team, ...) persist EDİLMEZ: Supabase kaynaklı, her oturumda
// tazelenir. Internal state (loading, initialized, _initFails, _lastReload)
// persist EDİLMEZ: oturum başında sıfırlanmalı.
// Sonuç: sayfa yenileme → aynı sekme, aynı filtreler — kullanıcı kaldığı yerden devam.
export const useIhaStore = create<IhaState>()(persist((set, get) => ({
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
  lastSyncedAt: null,
  staleData: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setMyMemberId: (id) => {
    if (id) localStorage.setItem("iha_my_member_id", id);
    else localStorage.removeItem("iha_my_member_id");
    set({ myMemberId: id });
  },
  setCurrentUserId: (id) => set({ currentUserId: id }),
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),

  // --- Initialize: Cache'ten ANINDA render et, arkada Supabase'den tazele (SWR) ---
  // Akış: cache varsa → initialized=true, loading=false (UI hemen açılır)
  //                    → arka planda fetchAll → başarılıysa state + lastSyncedAt
  //                    → başarısızsa cached veri kalır, staleData=true rozet
  //       cache yoksa → loading=true, fetchAll bekle
  initialize: async () => {
    const s = get();
    if (s.loading) return;

    const hasCache = s.lastSyncedAt !== null;
    if (hasCache) {
      // Cache varsa anında aç — hiç beklemeden
      set({ initialized: true, loading: false });
      console.log(`[IHA] cache'ten anında açıldı (son senkron: ${new Date(s.lastSyncedAt!).toLocaleString("tr-TR")})`);
      // Arka planda tazele — başarısızsa cache kalır
      void get().reload();
      return;
    }

    // Cache yok → ilk yükleme, beklemek zorunda
    set({ loading: true, degraded: false });
    console.log("[IHA] initialize başlıyor — cache yok, fetchAll çağrılacak");

    try {
      const data = await fetchAll();
      const counts = {
        operations: data.operations.length,
        flightPermissions: data.flightPermissions.length,
        flightLogs: data.flightLogs.length,
        equipment: data.equipment.length,
        software: data.software.length,
        team: data.team.length,
        storage: data.storage.length,
        auditLog: data.auditLog.length,
        vehicleEvents: data.vehicleEvents.length,
      };
      console.log("[IHA] initialize başarılı — kayıt sayıları:", counts);
      set({ ...data, initialized: true, loading: false, _initFails: 0, degraded: false, lastSyncedAt: Date.now(), staleData: false });
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
      console.error("[IHA] initialize fetchAll HATASI:", err);
      toast(`Veri yüklenemedi: ${err instanceof Error ? err.message : String(err)}`, "error");
      const fails = (get()._initFails ?? 0) + 1;
      if (fails >= 3) {
        set({ loading: false, _initFails: fails, degraded: true });
      } else {
        set({ initialized: false, loading: false, _initFails: fails });
      }
    }
  },

  // Arka plan tazelemesi — UI'da loading gösterme (kullanıcı kesintisiz çalışır)
  // Başarılı → veri + lastSyncedAt güncelle, staleData=false
  // Başarısız → cached veri korunur, staleData=true (UI küçük "ağ yok" rozeti basabilir)
  reload: async () => {
    try {
      const data = await fetchAll();
      set({ ...data, lastSyncedAt: Date.now(), staleData: false, degraded: false });
    } catch (err) {
      console.warn("[IHA] reload hatası (cache korunuyor, staleData=true):", err);
      set({ staleData: true });
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

}), {
  name: "spherical-iha-ui",
  storage: createJSONStorage(() => localStorage),
  // SWR cache — veri tabloları ve UI state persist edilir.
  // Internal state (loading, _initFails, _lastReload, currentUserId) edilmez:
  // her oturum başında sıfırlanmalı; aksi halde stale loading durumu kalabilir.
  partialize: (state) => ({
    activeTab: state.activeTab,
    filters: state.filters,
    equipment: state.equipment,
    software: state.software,
    storage: state.storage,
    team: state.team,
    operations: state.operations,
    flightLogs: state.flightLogs,
    flightPermissions: state.flightPermissions,
    auditLog: state.auditLog,
    vehicleEvents: state.vehicleEvents,
    lastSyncedAt: state.lastSyncedAt,
  }),
  version: 2,
  migrate: (state, version) => {
    if (version < 2) {
      // v1 → v2: veri tabloları persist'e dahil edildi. Eski cache geçersiz, sıfırla.
      return undefined;
    }
    return state as IhaState;
  },
}));

// Online geldiğinde staleData true ise otomatik tazele.
// Offline → cached veri görünür kalır. Online → arka planda reload.
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    const s = useIhaStore.getState();
    if (s.staleData && s.initialized) {
      console.log("[IHA] online geri geldi → otomatik reload");
      void s.reload();
    }
  });
}
