// ============================================
// CBS İHA Birimi - Type Definitions
// ============================================

// --- Operasyon ---
export type OperationStatus =
  | "talep"
  | "planlama"
  | "saha"
  | "isleme"
  | "kontrol"
  | "teslim"
  | "iptal";

export type OperationPriority = "dusuk" | "normal" | "yuksek" | "acil";

export interface Operation {
  id: string;
  title: string;
  description: string;
  requester: string;
  status: OperationStatus;
  priority: OperationPriority;
  assignedTeam: string[];
  assignedEquipment: string[];
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  dataStoragePath?: string;
  outputDescription?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// --- Envanter: Donanım ---
export type EquipmentCategory =
  | "drone"
  | "gps"
  | "kamera"
  | "tarayici"
  | "arac"
  | "bilgisayar"
  | "aksesuar";

export type EquipmentStatus =
  | "musait"
  | "kullanımda"
  | "bakim"
  | "ariza"
  | "odunc";

export type OwnershipType = "sahip" | "odunc";

export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber?: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  ownership: OwnershipType;
  currentHolder?: string;
  purchaseDate?: string;
  insuranceExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  accessories?: string[];
  flightHours?: number;
  batteryCount?: number;
  lastCalibration?: string;
}

// --- Envanter: Yazılım ---
export type SoftwareLicenseType = "perpetual" | "subscription" | "free";

export interface Software {
  id: string;
  name: string;
  version?: string;
  licenseType: SoftwareLicenseType;
  licenseExpiry?: string;
  installedOn?: string[];
  notes?: string;
}

// --- Personel ---
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills?: string[];
  currentOperationId?: string;
  phone?: string;
  email?: string;
}

// --- Depolama ---
export interface StorageUnit {
  id: string;
  name: string;
  totalCapacityTB: number;
  usedCapacityTB: number;
  path?: string;
  notes?: string;
}

// --- Audit Log ---
export type AuditAction = "ekledi" | "guncelledi" | "sildi";
export type AuditTarget =
  | "operasyon"
  | "ekipman"
  | "yazilim"
  | "personel"
  | "depolama";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  target: AuditTarget;
  targetId: string;
  description: string;
  performedBy: string;
  performedAt: string;
}

// --- Tab ---
export type IhaTab =
  | "dashboard"
  | "operations"
  | "inventory"
  | "personnel"
  | "storage";

// --- Label Maps ---
export const OPERATION_STATUS_LABELS: Record<OperationStatus, string> = {
  talep: "Talep",
  planlama: "Planlama",
  saha: "Saha",
  isleme: "İşleme",
  kontrol: "Kontrol",
  teslim: "Teslim",
  iptal: "İptal",
};

export const OPERATION_PRIORITY_LABELS: Record<OperationPriority, string> = {
  dusuk: "Düşük",
  normal: "Normal",
  yuksek: "Yüksek",
  acil: "Acil",
};

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  drone: "Drone",
  gps: "GPS/GNSS",
  kamera: "Kamera",
  tarayici: "Tarayıcı",
  arac: "Araç",
  bilgisayar: "Bilgisayar",
  aksesuar: "Aksesuar",
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  musait: "Müsait",
  "kullanımda": "Kullanımda",
  bakim: "Bakım",
  ariza: "Arıza",
  odunc: "Ödünç",
};

export const IHA_TAB_LABELS: Record<IhaTab, string> = {
  dashboard: "Genel Bakış",
  operations: "Operasyonlar",
  inventory: "Envanter",
  personnel: "Personel",
  storage: "Depolama",
};
