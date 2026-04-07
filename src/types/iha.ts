// ============================================
// CBS İHA Birimi - Type Definitions (v2)
// ============================================

// --- Operasyon Tipi ---
export type OperationType =
  | "lidar_el"
  | "lidar_arac"
  | "drone_fotogrametri"
  | "oblik_cekim"
  | "panorama_360";

// --- Operasyon Durumu ---
export type OperationStatus =
  | "talep"
  | "planlama"
  | "saha"
  | "isleme"
  | "kontrol"
  | "teslim"
  | "iptal";

export type OperationPriority = "dusuk" | "normal" | "yuksek" | "acil";

// --- Operasyon Konum ---
export interface OperationLocation {
  il: string;
  ilce: string;
  mahalle?: string;
  pafta?: string;
  ada?: string;
  parsel?: string;
  lat?: number;
  lng?: number;
  alan?: number;
  alanBirimi?: "m2" | "km2" | "hektar";
}

// --- Çıktı / Teslimat ---
export type DeliverableType =
  | "ortofoto"
  | "dem"
  | "dsm"
  | "nokta_bulutu"
  | "cad_dwg"
  | "cad_dxf"
  | "shp"
  | "geotiff"
  | "panorama_360"
  | "video"
  | "rapor"
  | "diger";

export type DeliveryMethod = "sunucu" | "fiziksel" | "dijital" | "eposta";

export interface Deliverable {
  id: string;
  type: DeliverableType;
  description: string;
  deliveryMethod: DeliveryMethod;
  deliveredTo?: string;
  deliveredAt?: string;
  filePath?: string;
}

// --- Uçuş İzni (SHGM / HSD) ---
export type PermissionStatus = "beklemede" | "onaylandi" | "reddedildi" | "suresi_doldu";

export interface FlightPermissionCoordinate {
  lat: number;
  lng: number;
}

export type FlightZoneType = "polygon" | "circle";

export interface FlightPermission {
  id: string;
  operationId?: string;
  hsdNumber?: string;
  status: PermissionStatus;
  startDate: string;
  endDate: string;
  maxAltitude?: number;
  zoneType: FlightZoneType;
  polygonCoordinates: FlightPermissionCoordinate[];
  circleCenter?: FlightPermissionCoordinate;
  circleRadius?: number;
  conditions?: string;
  coordinationContacts?: string;
  applicationDate?: string;
  applicationRef?: string;
  responsiblePerson?: string;
  notes?: string;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// --- Dosya Eki ---
export interface Attachment {
  id: string;
  parentTable: string;
  parentId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
  createdAt: string;
}

// --- Operasyon ---
export interface Operation {
  id: string;
  title: string;
  description: string;
  type: OperationType;
  requester: string;
  status: OperationStatus;
  priority: OperationPriority;
  location: OperationLocation;
  assignedTeam: string[];
  assignedEquipment: string[];
  permissionId?: string;
  dataStoragePath?: string;
  dataSize?: number;
  outputDescription?: string;
  deliverables: Deliverable[];
  flightLogIds: string[];
  completionPercent: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// --- Uçuş / Tarama Seyir Defteri ---
export type PpkStatus = "beklemede" | "tamamlandi" | "hata";

export interface FlightLog {
  id: string;
  operationId: string;
  type: OperationType;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;

  pilotId?: string;
  pilotName?: string;

  equipmentId?: string;
  equipmentName?: string;

  altitude?: number;
  gsd?: number;
  overlapForward?: number;
  overlapSide?: number;
  photoCount?: number;
  scanCount?: number;
  scanDuration?: number;

  batteryUsed?: number;
  totalFlightTime?: number;
  landingCount?: number;

  gpsBaseStation?: string;
  staticDuration?: number;
  corsConnection?: string;
  ppkStatus?: PpkStatus;

  weather?: string;
  windSpeed?: number;
  temperature?: number;

  location: OperationLocation;
  customFields?: Record<string, string>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
export type EquipmentCondition = "mukemmel" | "iyi" | "orta" | "kotu";

export interface CheckoutEntry {
  id: string;
  personId: string;
  personName: string;
  checkoutDate: string;
  returnDate?: string;
  operationId?: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber?: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  ownership: OwnershipType;
  condition?: EquipmentCondition;
  currentHolder?: string;
  purchaseDate?: string;
  insuranceExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  firmwareVersion?: string;
  lastCalibration?: string;
  nextCalibration?: string;
  notes?: string;
  accessories?: string[];
  flightHours?: number;
  batteryCount?: number;
  totalBatteryCycles?: number;
  checkoutLog?: CheckoutEntry[];
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
  specialties?: string[];
  certifications?: string[];
  currentOperationId?: string;
  phone?: string;
  email?: string;
}

// --- Depolama ---
export type StorageType = "sunucu" | "nas" | "harici_disk" | "bulut";

export interface StorageFolder {
  id: string;
  storageId: string;
  path: string;
  name: string;
  sizeGB?: number;
  operationId?: string;
  createdAt: string;
  description?: string;
}

export interface StorageUnit {
  id: string;
  name: string;
  type: StorageType;
  totalCapacityTB: number;
  usedCapacityTB: number;
  ip?: string;
  mountPath?: string;
  path?: string;
  notes?: string;
  folders?: StorageFolder[];
}

// --- Audit Log ---
export type AuditAction = "ekledi" | "guncelledi" | "sildi";
export type AuditTarget =
  | "operasyon"
  | "ekipman"
  | "yazilim"
  | "personel"
  | "depolama"
  | "ucus_defteri"
  | "bakim";

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
  | "reports"
  | "settings";

// --- Rapor ---
export type ReportPeriod = "haftalik" | "aylik" | "yillik" | "ozel";
export type ReportType = "ozet" | "ekipman" | "personel" | "talep";

// --- Label Maps ---
export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  lidar_el: "LiDAR Tarama (El)",
  lidar_arac: "LiDAR Tarama (Araç)",
  drone_fotogrametri: "Drone Fotogrametri",
  oblik_cekim: "Oblik Çekim",
  panorama_360: "360° Panorama",
};

export const OPERATION_STATUS_LABELS: Record<OperationStatus, string> = {
  talep: "Talep",
  planlama: "Planlama",
  saha: "Saha",
  isleme: "İşleme",
  kontrol: "Kontrol",
  teslim: "Teslim",
  iptal: "İptal",
};

export const OPERATION_STATUS_VARIANTS: Record<OperationStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  talep: "info",
  planlama: "warning",
  saha: "success",
  isleme: "warning",
  kontrol: "info",
  teslim: "success",
  iptal: "danger",
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

export const EQUIPMENT_CONDITION_LABELS: Record<EquipmentCondition, string> = {
  mukemmel: "Mükemmel",
  iyi: "İyi",
  orta: "Orta",
  kotu: "Kötü",
};

export const DELIVERABLE_TYPE_LABELS: Record<DeliverableType, string> = {
  ortofoto: "Ortofoto",
  dem: "DEM",
  dsm: "DSM",
  nokta_bulutu: "Nokta Bulutu",
  cad_dwg: "CAD (DWG)",
  cad_dxf: "CAD (DXF)",
  shp: "Shapefile",
  geotiff: "GeoTIFF",
  panorama_360: "360° Panorama",
  video: "Video",
  rapor: "Rapor",
  diger: "Diğer",
};

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  sunucu: "Sunucu",
  fiziksel: "Fiziksel",
  dijital: "Dijital",
  eposta: "E-posta",
};

export const PPK_STATUS_LABELS: Record<PpkStatus, string> = {
  beklemede: "Beklemede",
  tamamlandi: "Tamamlandı",
  hata: "Hata",
};

export const PERMISSION_STATUS_LABELS: Record<PermissionStatus, string> = {
  beklemede: "Beklemede",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
  suresi_doldu: "Süresi Doldu",
};

export const STORAGE_TYPE_LABELS: Record<StorageType, string> = {
  sunucu: "Sunucu",
  nas: "NAS",
  harici_disk: "Harici Disk",
  bulut: "Bulut",
};

export const IHA_TAB_LABELS: Record<IhaTab, string> = {
  dashboard: "Genel Bakış",
  operations: "Operasyonlar",
  inventory: "Envanter",
  reports: "Raporlar",
  settings: "Ayarlar",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  ozet: "Aylık Özet",
  ekipman: "Ekipman Kullanım",
  personel: "Personel Performans",
  talep: "Talep Analizi",
};
