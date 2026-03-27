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
    fetchAll()
      .then((data) => set({ ...data, maintenanceRecords: [], initialized: true, loading: false }))
      .catch(() => set({ initialized: true, loading: false }));
  },

  reload: () => {
    set({ loading: true });
    fetchAll()
      .then((data) => set({ ...data, loading: false }))
      .catch(() => set({ loading: false }));
  },

  // --- Equipment ---
  addEquipment: (item) => {
    db.upsertEquipment(item as Partial<Equipment>)
      .then(() => { audit("ekledi", "ekipman", "", `${item.name} eklendi`); get().reload(); })
      .catch(() => {});
  },

  updateEquipment: (id, updates) => {
    const eq = get().equipment.find((e) => e.id === id);
    if (!eq) return;
    db.upsertEquipment({ ...eq, ...updates })
      .then(() => { audit("guncelledi", "ekipman", id, "Ekipman güncellendi"); get().reload(); })
      .catch(() => {});
  },

  deleteEquipment: (id) => {
    db.deleteEquipment(id)
      .then(() => { audit("sildi", "ekipman", id, "Ekipman silindi"); get().reload(); })
      .catch(() => {});
  },

  addCheckoutEntry: (equipmentId, entry) => {
    db.addCheckoutEntry(equipmentId, entry)
      .then(() => { audit("guncelledi", "ekipman", equipmentId, `${entry.personName} zimmetine verildi`); get().reload(); })
      .catch(() => {});
  },

  returnEquipment: (equipmentId, entryId) => {
    db.returnEquipment(equipmentId, entryId)
      .then(() => { audit("guncelledi", "ekipman", equipmentId, "Ekipman iade edildi"); get().reload(); })
      .catch(() => {});
  },

  // --- Software ---
  addSoftware: (item) => {
    db.upsertSoftware(item as Partial<Software>)
      .then(() => { audit("ekledi", "yazilim", "", `${item.name} eklendi`); get().reload(); })
      .catch(() => {});
  },

  updateSoftware: (id, updates) => {
    const sw = get().software.find((s) => s.id === id);
    if (!sw) return;
    db.upsertSoftware({ ...sw, ...updates })
      .then(() => { audit("guncelledi", "yazilim", id, "Yazılım güncellendi"); get().reload(); })
      .catch(() => {});
  },

  deleteSoftware: (id) => {
    db.deleteSoftware(id)
      .then(() => { audit("sildi", "yazilim", id, "Yazılım silindi"); get().reload(); })
      .catch(() => {});
  },

  // --- Storage ---
  updateStorage: (id, updates) => {
    db.updateStorage(id, updates)
      .then(() => { audit("guncelledi", "depolama", id, "Depolama güncellendi"); get().reload(); })
      .catch(() => {});
  },

  addStorageFolder: (storageId, folder) => {
    db.addStorageFolder(storageId, folder)
      .then(() => { audit("ekledi", "depolama", storageId, `Klasör eklendi: ${folder.name}`); get().reload(); })
      .catch(() => {});
  },

  removeStorageFolder: (_storageId, folderId) => {
    db.removeStorageFolder(folderId)
      .then(() => { audit("sildi", "depolama", folderId, "Klasör silindi"); get().reload(); })
      .catch(() => {});
  },

  // --- Team ---
  updateTeamMember: (id, updates) => {
    const member = get().team.find((t) => t.id === id);
    if (!member) return;
    db.upsertTeamMember({ ...member, ...updates })
      .then(() => { audit("guncelledi", "personel", id, "Personel güncellendi"); get().reload(); })
      .catch(() => {});
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
      .then(() => { audit("ekledi", "operasyon", "", `${item.title} eklendi`); get().reload(); })
      .catch(() => {});
  },

  updateOperation: (id, updates) => {
    const op = get().operations.find((o) => o.id === id);
    if (!op) return;
    db.upsertOperation({ ...op, ...updates })
      .then(() => { audit("guncelledi", "operasyon", id, "Operasyon güncellendi"); get().reload(); })
      .catch(() => {});
  },

  deleteOperation: (id) => {
    db.deleteOperation(id)
      .then(() => { audit("sildi", "operasyon", id, "Operasyon silindi"); get().reload(); })
      .catch(() => {});
  },

  addDeliverable: (operationId, deliverable) => {
    db.addDeliverable(operationId, deliverable)
      .then(() => { audit("ekledi", "operasyon", operationId, `Çıktı eklendi: ${deliverable.description}`); get().reload(); })
      .catch(() => {});
  },

  removeDeliverable: (_operationId, deliverableId) => {
    db.removeDeliverable(deliverableId)
      .then(() => { audit("sildi", "operasyon", deliverableId, "Çıktı silindi"); get().reload(); })
      .catch(() => {});
  },

  // --- Flight Logs ---
  addFlightLog: (item) => {
    db.upsertFlightLog(item as Partial<FlightLog>)
      .then(() => { audit("ekledi", "ucus_defteri", "", "Uçuş kaydı eklendi"); get().reload(); })
      .catch(() => {});
  },

  updateFlightLog: (id, updates) => {
    const fl = get().flightLogs.find((f) => f.id === id);
    if (!fl) return;
    db.upsertFlightLog({ ...fl, ...updates })
      .then(() => { audit("guncelledi", "ucus_defteri", id, "Uçuş kaydı güncellendi"); get().reload(); })
      .catch(() => {});
  },

  deleteFlightLog: (id) => {
    db.deleteFlightLog(id)
      .then(() => { audit("sildi", "ucus_defteri", id, "Uçuş kaydı silindi"); get().reload(); })
      .catch(() => {});
  },

  // --- Flight Permissions ---
  addFlightPermission: (item) => {
    db.upsertFlightPermission(item as Partial<FlightPermission>)
      .then((newId) => {
        // Operasyona izin bağla
        if (item.operationId) {
          const op = get().operations.find((o) => o.id === item.operationId);
          if (op) db.upsertOperation({ ...op, permissionId: newId }).catch(() => {});
        }
        audit("ekledi", "operasyon", newId, `Uçuş izni eklendi${item.hsdNumber ? `: ${item.hsdNumber}` : ""}`);
        get().reload();
      })
      .catch(() => {});
  },

  updateFlightPermission: (id, updates) => {
    const fp = get().flightPermissions.find((p) => p.id === id);
    if (!fp) return;
    db.upsertFlightPermission({ ...fp, ...updates })
      .then(() => { audit("guncelledi", "operasyon", id, "Uçuş izni güncellendi"); get().reload(); })
      .catch(() => {});
  },

  deleteFlightPermission: (id) => {
    // Operasyondan izin bağlantısını kaldır
    const ops = get().operations.filter((o) => o.permissionId === id);
    for (const op of ops) {
      db.upsertOperation({ ...op, permissionId: undefined }).catch(() => {});
    }
    db.deleteFlightPermission(id)
      .then(() => { audit("sildi", "operasyon", id, "Uçuş izni silindi"); get().reload(); })
      .catch(() => {});
  },

  // --- Maintenance ---
  addMaintenanceRecord: () => {},
  deleteMaintenanceRecord: () => {},
}));
