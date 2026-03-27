"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Equipment,
  Software,
  StorageUnit,
  TeamMember,
  Operation,
  FlightLog,
  MaintenanceRecord,
  AuditEntry,
  AuditAction,
  AuditTarget,
  IhaTab,
  EquipmentCategory,
  OperationStatus,
  OperationType,
  Deliverable,
  StorageFolder,
  CheckoutEntry,
  OperationLocation,
} from "@/types/iha";
import {
  SEED_EQUIPMENT,
  SEED_SOFTWARE,
  SEED_STORAGE,
  SEED_TEAM,
  SEED_OPERATIONS,
  SEED_FLIGHT_LOGS,
  SEED_MAINTENANCE_RECORDS,
} from "@/config/iha-seed";

// --- Filters ---
interface IhaFilters {
  equipmentCategory: EquipmentCategory | "all";
  operationStatus: OperationStatus | "all";
  operationType: OperationType | "all";
  searchText: string;
}

// --- Store State ---
interface IhaState {
  // Data
  equipment: Equipment[];
  software: Software[];
  storage: StorageUnit[];
  team: TeamMember[];
  operations: Operation[];
  flightLogs: FlightLog[];
  maintenanceRecords: MaintenanceRecord[];
  auditLog: AuditEntry[];

  // UI
  activeTab: IhaTab;
  filters: IhaFilters;
  initialized: boolean;

  // Tab
  setActiveTab: (tab: IhaTab) => void;

  // Filters
  setFilter: <K extends keyof IhaFilters>(key: K, value: IhaFilters[K]) => void;

  // Equipment CRUD
  addEquipment: (item: Omit<Equipment, "id">) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addCheckoutEntry: (equipmentId: string, entry: Omit<CheckoutEntry, "id">) => void;
  returnEquipment: (equipmentId: string, entryId: string) => void;

  // Software CRUD
  addSoftware: (item: Omit<Software, "id">) => void;
  updateSoftware: (id: string, updates: Partial<Software>) => void;
  deleteSoftware: (id: string) => void;

  // Storage
  updateStorage: (id: string, updates: Partial<StorageUnit>) => void;
  addStorageFolder: (storageId: string, folder: Omit<StorageFolder, "id" | "storageId" | "createdAt">) => void;
  removeStorageFolder: (storageId: string, folderId: string) => void;

  // Team
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;

  // Operations CRUD
  addOperation: (item: Omit<Operation, "id" | "createdAt" | "updatedAt" | "deliverables" | "flightLogIds" | "completionPercent">) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;
  addDeliverable: (operationId: string, deliverable: Omit<Deliverable, "id">) => void;
  removeDeliverable: (operationId: string, deliverableId: string) => void;

  // Flight Logs CRUD
  addFlightLog: (item: Omit<FlightLog, "id" | "createdAt" | "updatedAt">) => void;
  updateFlightLog: (id: string, updates: Partial<FlightLog>) => void;
  deleteFlightLog: (id: string) => void;

  // Maintenance Records CRUD
  addMaintenanceRecord: (item: Omit<MaintenanceRecord, "id">) => void;
  deleteMaintenanceRecord: (id: string) => void;

  // Init
  initialize: () => void;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function addAudit(
  log: AuditEntry[],
  action: AuditAction,
  target: AuditTarget,
  targetId: string,
  description: string
): AuditEntry[] {
  const entry: AuditEntry = {
    id: generateId("audit"),
    action,
    target,
    targetId,
    description,
    performedBy: "kullanici",
    performedAt: new Date().toISOString(),
  };
  return [entry, ...log].slice(0, 500);
}

const EMPTY_LOCATION: OperationLocation = { il: "", ilce: "" };

export const useIhaStore = create<IhaState>()(
  persist(
    (set) => ({
      equipment: [],
      software: [],
      storage: [],
      team: [],
      operations: [],
      flightLogs: [],
      maintenanceRecords: [],
      auditLog: [],
      activeTab: "dashboard",
      filters: {
        equipmentCategory: "all",
        operationStatus: "all",
        operationType: "all",
        searchText: "",
      },
      initialized: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),

      initialize: () =>
        set((s) => {
          if (s.initialized) return s;
          return {
            equipment: SEED_EQUIPMENT,
            software: SEED_SOFTWARE,
            storage: SEED_STORAGE,
            team: SEED_TEAM,
            operations: SEED_OPERATIONS,
            flightLogs: SEED_FLIGHT_LOGS,
            maintenanceRecords: SEED_MAINTENANCE_RECORDS,
            initialized: true,
          };
        }),

      // --- Equipment ---
      addEquipment: (item) =>
        set((s) => {
          const newItem: Equipment = { ...item, id: generateId("eq") };
          return {
            equipment: [...s.equipment, newItem],
            auditLog: addAudit(s.auditLog, "ekledi", "ekipman", newItem.id, `${newItem.name} eklendi`),
          };
        }),

      updateEquipment: (id, updates) =>
        set((s) => ({
          equipment: s.equipment.map((e) => (e.id === id ? { ...e, ...updates } : e)),
          auditLog: addAudit(s.auditLog, "guncelledi", "ekipman", id, `Ekipman güncellendi`),
        })),

      deleteEquipment: (id) =>
        set((s) => ({
          equipment: s.equipment.filter((e) => e.id !== id),
          auditLog: addAudit(s.auditLog, "sildi", "ekipman", id, `Ekipman silindi`),
        })),

      addCheckoutEntry: (equipmentId, entry) =>
        set((s) => {
          const newEntry: CheckoutEntry = { ...entry, id: generateId("co") };
          return {
            equipment: s.equipment.map((e) =>
              e.id === equipmentId
                ? { ...e, checkoutLog: [...(e.checkoutLog ?? []), newEntry], status: "kullanımda" as const, currentHolder: entry.personName }
                : e
            ),
            auditLog: addAudit(s.auditLog, "guncelledi", "ekipman", equipmentId, `${entry.personName} zimmetine verildi`),
          };
        }),

      returnEquipment: (equipmentId, entryId) =>
        set((s) => ({
          equipment: s.equipment.map((e) =>
            e.id === equipmentId
              ? {
                  ...e,
                  status: "musait" as const,
                  currentHolder: undefined,
                  checkoutLog: (e.checkoutLog ?? []).map((c) =>
                    c.id === entryId ? { ...c, returnDate: new Date().toISOString() } : c
                  ),
                }
              : e
          ),
          auditLog: addAudit(s.auditLog, "guncelledi", "ekipman", equipmentId, `Ekipman iade edildi`),
        })),

      // --- Software ---
      addSoftware: (item) =>
        set((s) => {
          const newItem: Software = { ...item, id: generateId("sw") };
          return {
            software: [...s.software, newItem],
            auditLog: addAudit(s.auditLog, "ekledi", "yazilim", newItem.id, `${newItem.name} eklendi`),
          };
        }),

      updateSoftware: (id, updates) =>
        set((s) => ({
          software: s.software.map((sw) => (sw.id === id ? { ...sw, ...updates } : sw)),
          auditLog: addAudit(s.auditLog, "guncelledi", "yazilim", id, `Yazılım güncellendi`),
        })),

      deleteSoftware: (id) =>
        set((s) => ({
          software: s.software.filter((sw) => sw.id !== id),
          auditLog: addAudit(s.auditLog, "sildi", "yazilim", id, `Yazılım silindi`),
        })),

      // --- Storage ---
      updateStorage: (id, updates) =>
        set((s) => ({
          storage: s.storage.map((st) => (st.id === id ? { ...st, ...updates } : st)),
          auditLog: addAudit(s.auditLog, "guncelledi", "depolama", id, `Depolama güncellendi`),
        })),

      addStorageFolder: (storageId, folder) =>
        set((s) => {
          const newFolder: StorageFolder = {
            ...folder,
            id: generateId("sf"),
            storageId,
            createdAt: new Date().toISOString(),
          };
          return {
            storage: s.storage.map((st) =>
              st.id === storageId
                ? { ...st, folders: [...(st.folders ?? []), newFolder] }
                : st
            ),
            auditLog: addAudit(s.auditLog, "ekledi", "depolama", storageId, `Klasör eklendi: ${folder.name}`),
          };
        }),

      removeStorageFolder: (storageId, folderId) =>
        set((s) => ({
          storage: s.storage.map((st) =>
            st.id === storageId
              ? { ...st, folders: (st.folders ?? []).filter((f) => f.id !== folderId) }
              : st
          ),
          auditLog: addAudit(s.auditLog, "sildi", "depolama", storageId, `Klasör silindi`),
        })),

      // --- Team ---
      updateTeamMember: (id, updates) =>
        set((s) => ({
          team: s.team.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          auditLog: addAudit(s.auditLog, "guncelledi", "personel", id, `Personel güncellendi`),
        })),

      // --- Operations ---
      addOperation: (item) =>
        set((s) => {
          const now = new Date().toISOString();
          const newOp: Operation = {
            ...item,
            id: generateId("op"),
            location: item.location ?? EMPTY_LOCATION,
            deliverables: [],
            flightLogIds: [],
            completionPercent: 0,
            createdAt: now,
            updatedAt: now,
          };
          return {
            operations: [...s.operations, newOp],
            auditLog: addAudit(s.auditLog, "ekledi", "operasyon", newOp.id, `${newOp.title} operasyonu eklendi`),
          };
        }),

      updateOperation: (id, updates) =>
        set((s) => ({
          operations: s.operations.map((op) =>
            op.id === id ? { ...op, ...updates, updatedAt: new Date().toISOString() } : op
          ),
          auditLog: addAudit(s.auditLog, "guncelledi", "operasyon", id, `Operasyon güncellendi`),
        })),

      deleteOperation: (id) =>
        set((s) => ({
          operations: s.operations.filter((op) => op.id !== id),
          auditLog: addAudit(s.auditLog, "sildi", "operasyon", id, `Operasyon silindi`),
        })),

      addDeliverable: (operationId, deliverable) =>
        set((s) => {
          const newDel: Deliverable = { ...deliverable, id: generateId("del") };
          return {
            operations: s.operations.map((op) =>
              op.id === operationId
                ? { ...op, deliverables: [...op.deliverables, newDel] }
                : op
            ),
            auditLog: addAudit(s.auditLog, "ekledi", "operasyon", operationId, `Çıktı eklendi: ${deliverable.description}`),
          };
        }),

      removeDeliverable: (operationId, deliverableId) =>
        set((s) => ({
          operations: s.operations.map((op) =>
            op.id === operationId
              ? { ...op, deliverables: op.deliverables.filter((d) => d.id !== deliverableId) }
              : op
          ),
          auditLog: addAudit(s.auditLog, "sildi", "operasyon", operationId, `Çıktı silindi`),
        })),

      // --- Flight Logs ---
      addFlightLog: (item) =>
        set((s) => {
          const now = new Date().toISOString();
          const newLog: FlightLog = { ...item, id: generateId("fl"), createdAt: now, updatedAt: now };
          // Link to operation
          const operations = item.operationId
            ? s.operations.map((op) =>
                op.id === item.operationId
                  ? { ...op, flightLogIds: [...op.flightLogIds, newLog.id] }
                  : op
              )
            : s.operations;
          return {
            flightLogs: [...s.flightLogs, newLog],
            operations,
            auditLog: addAudit(s.auditLog, "ekledi", "ucus_defteri", newLog.id, `Uçuş kaydı eklendi`),
          };
        }),

      updateFlightLog: (id, updates) =>
        set((s) => ({
          flightLogs: s.flightLogs.map((fl) =>
            fl.id === id ? { ...fl, ...updates, updatedAt: new Date().toISOString() } : fl
          ),
          auditLog: addAudit(s.auditLog, "guncelledi", "ucus_defteri", id, `Uçuş kaydı güncellendi`),
        })),

      deleteFlightLog: (id) =>
        set((s) => {
          const log = s.flightLogs.find((fl) => fl.id === id);
          const operations = log?.operationId
            ? s.operations.map((op) =>
                op.id === log.operationId
                  ? { ...op, flightLogIds: op.flightLogIds.filter((fid) => fid !== id) }
                  : op
              )
            : s.operations;
          return {
            flightLogs: s.flightLogs.filter((fl) => fl.id !== id),
            operations,
            auditLog: addAudit(s.auditLog, "sildi", "ucus_defteri", id, `Uçuş kaydı silindi`),
          };
        }),

      // --- Maintenance ---
      addMaintenanceRecord: (item) =>
        set((s) => {
          const newRecord: MaintenanceRecord = { ...item, id: generateId("mr") };
          return {
            maintenanceRecords: [...s.maintenanceRecords, newRecord],
            auditLog: addAudit(s.auditLog, "ekledi", "bakim", newRecord.id, `Bakım kaydı eklendi`),
          };
        }),

      deleteMaintenanceRecord: (id) =>
        set((s) => ({
          maintenanceRecords: s.maintenanceRecords.filter((mr) => mr.id !== id),
          auditLog: addAudit(s.auditLog, "sildi", "bakim", id, `Bakım kaydı silindi`),
        })),
    }),
    {
      name: "spherical-iha-store-v2",
      partialize: (state) => ({
        equipment: state.equipment,
        software: state.software,
        storage: state.storage,
        team: state.team,
        operations: state.operations,
        flightLogs: state.flightLogs,
        maintenanceRecords: state.maintenanceRecords,
        auditLog: state.auditLog,
        initialized: state.initialized,
      }),
    }
  )
);
