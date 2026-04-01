"use client";

import { create } from "zustand";
import type {
  Equipment, Software, StorageUnit, TeamMember,
  Operation, FlightLog, FlightPermission,
  MaintenanceRecord, AuditEntry, IhaTab,
  EquipmentCategory, OperationStatus, OperationType,
  Deliverable, StorageFolder, CheckoutEntry,
} from "@/types/iha";
import * as db from "./ihaStorage";
import { useToast } from "@/components/ui/Toast";
import { isOnline, addToQueue, getQueueItems, removeFromQueue, setupOnlineListener } from "./offlineQueue";

// --- Filters ---
interface IhaFilters {
  equipmentCategory: EquipmentCategory | "all";
  operationStatus: OperationStatus | "all";
  operationType: OperationType | "all";
  searchText: string;
}

// --- Store State ---
interface IhaState {
  equipment: Equipment[];
  software: Software[];
  storage: StorageUnit[];
  team: TeamMember[];
  operations: Operation[];
  flightLogs: FlightLog[];
  flightPermissions: FlightPermission[];
  maintenanceRecords: MaintenanceRecord[];
  auditLog: AuditEntry[];

  activeTab: IhaTab;
  filters: IhaFilters;
  initialized: boolean;
  loading: boolean;

  setActiveTab: (tab: IhaTab) => void;
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
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;

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

  // Maintenance
  addMaintenanceRecord: (item: Omit<MaintenanceRecord, "id">) => void;
  deleteMaintenanceRecord: (id: string) => void;

  // Init
  initialize: () => void;
  reload: () => void;
  reloadTable: (table: "operations" | "equipment" | "software" | "team" | "storage" | "flightLogs" | "flightPermissions") => void;
}

// --- Helper: Supabase'den tüm verileri çek ---
async function fetchAll() {
  const [operations, flightPermissions, flightLogs, equipment, software, team, storage] =
    await Promise.all([
      db.fetchOperations(),
      db.fetchFlightPermissions(),
      db.fetchFlightLogs(),
      db.fetchEquipment(),
      db.fetchSoftware(),
      db.fetchTeam(),
      db.fetchStorage(),
    ]);
  return { operations, flightPermissions, flightLogs, equipment, software, team, storage };
}

// --- Helper: Audit log ---
function audit(action: AuditEntry["action"], target: AuditEntry["target"], targetId: string, description: string) {
  db.addAuditEntry({ action, target, targetId, description, performedBy: "kullanici" }).catch(() => {});
}

// --- Helper: Toast bildirimi ---
function toast(message: string, type: "success" | "error" | "info" = "success") {
  useToast.getState().add(message, type);
}

function onError(msg: string) {
  return (err: unknown) => {
    toast(`Hata: ${msg}`, "error");
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
  maintenanceRecords: [],
  auditLog: [],
  activeTab: "dashboard",
  filters: { equipmentCategory: "all", operationStatus: "all", operationType: "all", searchText: "" },
  initialized: false,
  loading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),

  // --- Initialize: Supabase'den tüm verileri çek ---
  initialize: () => {
    const s = get();
    if (s.initialized || s.loading) return;
    set({ loading: true });

    // Çevrimdışı kuyruk dinleyicisi
    if (typeof window !== "undefined") {
      setupOnlineListener(() => {
        toast("İnternet bağlantısı geldi — bekleyen işlemler gönderiliyor", "info");
        get().reload();
      });
    }

    fetchAll()
      .then(async (data) => {
        set({ ...data, maintenanceRecords: [], initialized: true, loading: false });
        // Arka planda seed — eksik varsayılan verileri Supabase'e ekle
        const [eqAdded, swAdded] = await Promise.all([
          db.seedEquipment().catch(() => 0),
          db.seedSoftware().catch(() => 0),
        ]);
        if (eqAdded > 0 || swAdded > 0) {
          const fresh = await fetchAll();
          set({ ...fresh, maintenanceRecords: [] });
          toast(`${eqAdded + swAdded} varsayılan envanter verisi yüklendi`, "info");
        }
      })
      .catch(() => {
        toast("Veri yüklenemedi — çevrimdışı olabilirsiniz", "error");
        set({ initialized: true, loading: false });
      });
  },

  reload: () => {
    set({ loading: true });
    fetchAll()
      .then((data) => set({ ...data, loading: false }))
      .catch(() => set({ loading: false }));
  },

  // Sadece belirli tabloyu yenile (performans)
  reloadTable: (table: "operations" | "equipment" | "software" | "team" | "storage" | "flightLogs" | "flightPermissions") => {
    const fetchers: Record<string, () => Promise<unknown>> = {
      operations: db.fetchOperations,
      equipment: db.fetchEquipment,
      software: db.fetchSoftware,
      team: db.fetchTeam,
      storage: db.fetchStorage,
      flightLogs: db.fetchFlightLogs,
      flightPermissions: db.fetchFlightPermissions,
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
      .then(() => { audit("guncelledi", "ekipman", id, "Ekipman güncellendi"); get().reloadTable("equipment"); })
      .catch(onError("İşlem başarısız"));
  },

  deleteEquipment: (id) => {
    db.deleteEquipment(id)
      .then(() => { audit("sildi", "ekipman", id, "Ekipman silindi"); toast("Ekipman silindi"); get().reloadTable("equipment"); })
      .catch(onError("İşlem başarısız"));
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
      .then(() => { audit("guncelledi", "yazilim", id, "Yazılım güncellendi"); get().reloadTable("software"); })
      .catch(onError("İşlem başarısız"));
  },

  deleteSoftware: (id) => {
    db.deleteSoftware(id)
      .then(() => { audit("sildi", "yazilim", id, "Yazılım silindi"); toast("Yazılım silindi"); get().reloadTable("software"); })
      .catch(onError("İşlem başarısız"));
  },

  // --- Storage ---
  updateStorage: (id, updates) => {
    db.updateStorage(id, updates)
      .then(() => { audit("guncelledi", "depolama", id, "Depolama güncellendi"); get().reloadTable("storage"); })
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
      .catch(onError("İşlem başarısız"));
  },

  // --- Team ---
  updateTeamMember: (id, updates) => {
    const member = get().team.find((t) => t.id === id);
    if (!member) return;
    db.upsertTeamMember({ ...member, ...updates })
      .then(() => { audit("guncelledi", "personel", id, "Personel güncellendi"); toast("Personel güncellendi"); get().reloadTable("team"); })
      .catch(onError("İşlem başarısız"));
  },

  // --- Operations ---
  addOperation: (item) => {
    const now = new Date().toISOString();
    db.upsertOperation({
      ...item,
      deliverables: [],
      flightLogIds: [],
      completionPercent: 0,
      createdAt: now,
      updatedAt: now,
    } as Partial<Operation>)
      .then(() => { audit("ekledi", "operasyon", "", `${item.title} eklendi`); toast("Operasyon oluşturuldu"); get().reloadTable("operations"); })
      .catch(onError("İşlem başarısız"));
  },

  updateOperation: (id, updates) => {
    const op = get().operations.find((o) => o.id === id);
    if (!op) return;
    db.fetchOperations()
      .then((current) => {
        const serverOp = current.find((o) => o.id === id);
        if (serverOp && serverOp.updatedAt !== op.updatedAt) {
          toast("Bu kayıt başka biri tarafından değiştirilmiş. Veriler yenilendi.", "info");
          set({ operations: current });
          return;
        }
        return db.upsertOperation({ ...op, ...updates });
      })
      .then(() => { audit("guncelledi", "operasyon", id, "Operasyon güncellendi"); get().reloadTable("operations"); })
      .catch(onError("Operasyon güncellenemedi"));
  },

  deleteOperation: (id) => {
    db.deleteOperation(id)
      .then(() => { audit("sildi", "operasyon", id, "Operasyon silindi"); toast("Operasyon silindi"); get().reloadTable("operations"); })
      .catch(onError("İşlem başarısız"));
  },

  addDeliverable: (operationId, deliverable) => {
    db.addDeliverable(operationId, deliverable)
      .then(() => { audit("ekledi", "operasyon", operationId, `Çıktı eklendi: ${deliverable.description}`); toast("Çıktı eklendi"); get().reloadTable("operations"); })
      .catch(onError("İşlem başarısız"));
  },

  removeDeliverable: (_operationId, deliverableId) => {
    db.removeDeliverable(deliverableId)
      .then(() => { audit("sildi", "operasyon", deliverableId, "Çıktı silindi"); get().reloadTable("operations"); })
      .catch(onError("İşlem başarısız"));
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
      .then(() => { audit("guncelledi", "ucus_defteri", id, "Uçuş kaydı güncellendi"); get().reloadTable("flightLogs"); })
      .catch(onError("İşlem başarısız"));
  },

  deleteFlightLog: (id) => {
    db.deleteFlightLog(id)
      .then(() => { audit("sildi", "ucus_defteri", id, "Uçuş kaydı silindi"); toast("Uçuş kaydı silindi"); get().reloadTable("flightLogs"); })
      .catch(onError("İşlem başarısız"));
  },

  // --- Flight Permissions ---
  addFlightPermission: (item) => {
    db.upsertFlightPermission(item as Partial<FlightPermission>)
      .then((newId) => {
        if (item.operationId) {
          const op = get().operations.find((o) => o.id === item.operationId);
          if (op) db.upsertOperation({ ...op, permissionId: newId }).catch(() => {});
        }
        audit("ekledi", "operasyon", newId, `Uçuş izni eklendi${item.hsdNumber ? `: ${item.hsdNumber}` : ""}`);
        toast("Uçuş izni eklendi");
        get().reloadTable("flightPermissions");
        get().reloadTable("operations");
      })
      .catch(onError("İzin eklenemedi"));
  },

  updateFlightPermission: (id, updates) => {
    const fp = get().flightPermissions.find((p) => p.id === id);
    if (!fp) return;
    db.upsertFlightPermission({ ...fp, ...updates })
      .then(() => { audit("guncelledi", "operasyon", id, "Uçuş izni güncellendi"); get().reloadTable("flightPermissions"); })
      .catch(onError("İzin güncellenemedi"));
  },

  deleteFlightPermission: (id) => {
    const ops = get().operations.filter((o) => o.permissionId === id);
    for (const op of ops) {
      db.upsertOperation({ ...op, permissionId: undefined }).catch(() => {});
    }
    db.deleteFlightPermission(id)
      .then(() => { audit("sildi", "operasyon", id, "Uçuş izni silindi"); toast("Uçuş izni silindi"); get().reloadTable("flightPermissions"); get().reloadTable("operations"); })
      .catch(onError("İzin silinemedi"));
  },

  // --- Maintenance ---
  addMaintenanceRecord: () => {},
  deleteMaintenanceRecord: () => {},
}));
