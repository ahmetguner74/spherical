// ============================================
// CBS İHA Birimi - Type Definitions (v2)
// ============================================

// --- Operasyon Ana Kategori ---
export type OperationMainCategory = "iha" | "lidar";

// --- Operasyon Alt Tipi ---
export type OperationSubType =
  | "ortofoto"
  | "oblik"
  | "panorama_360"
  | "el_tarama"
  | "arac_tarama";

// --- Operasyon Tipi (geriye uyumluluk + yeni) ---
export type OperationType =
  | OperationMainCategory
  | "lidar_el"
  | "lidar_arac"
  | "drone_fotogrametri"
  | "oblik_cekim"
  | "panorama_360";

// --- Ana Kategori Tanımları ---
export const MAIN_CATEGORIES: { key: OperationMainCategory; label: string; icon: string }[] = [
  { key: "iha", label: "İHA", icon: "🛩️" },
  { key: "lidar", label: "LİDAR", icon: "📡" },
];

// --- Alt Kategori Tanımları ---
export const SUB_CATEGORIES: Record<OperationMainCategory, { key: OperationSubType; label: string; icon: string }[]> = {
  iha: [
    { key: "ortofoto", label: "Ortofoto", icon: "🗺️" },
    { key: "oblik", label: "Oblik", icon: "📐" },
    { key: "panorama_360", label: "360° Küre", icon: "🌐" },
  ],
  lidar: [
    { key: "el_tarama", label: "El ile Tarama", icon: "📡" },
    { key: "arac_tarama", label: "Araba ile Tarama", icon: "🚗" },
  ],
};

// --- Alt Kategori Etiketleri ---
export const SUB_TYPE_LABELS: Record<OperationSubType, string> = {
  ortofoto: "Ortofoto",
  oblik: "Oblik Çekim",
  panorama_360: "360° Küre",
  el_tarama: "El ile Tarama",
  arac_tarama: "Araba ile Tarama",
};

// --- Eski tip → yeni sisteme dönüşüm ---
export function legacyTypeToNew(type: OperationType): { mainCategory: OperationMainCategory; subTypes: OperationSubType[] } {
  switch (type) {
    case "iha": return { mainCategory: "iha", subTypes: [] };
    case "lidar": return { mainCategory: "lidar", subTypes: [] };
    case "drone_fotogrametri": return { mainCategory: "iha", subTypes: ["ortofoto"] };
    case "oblik_cekim": return { mainCategory: "iha", subTypes: ["oblik"] };
    case "panorama_360": return { mainCategory: "iha", subTypes: ["panorama_360"] };
    case "lidar_el": return { mainCategory: "lidar", subTypes: ["el_tarama"] };
    case "lidar_arac": return { mainCategory: "lidar", subTypes: ["arac_tarama"] };
    default: return { mainCategory: "iha", subTypes: [] };
  }
}

/** Operasyon tipini okunabilir metin olarak döndürür */
export function formatOperationType(op: { type: OperationType; subTypes?: OperationSubType[] }): string {
  if (op.type === "iha" || op.type === "lidar") {
    const label = op.type === "iha" ? "İHA" : "LİDAR";
    if (op.subTypes && op.subTypes.length > 0) {
      return `${label} - ${op.subTypes.map((s) => SUB_TYPE_LABELS[s]).join(", ")}`;
    }
    return label;
  }
  return OPERATION_TYPE_LABELS[op.type] ?? op.type;
}

// --- Operasyon Durumu ---
export type OperationStatus =
  | "talep"
  | "planlama"
  | "saha"
  | "isleme"
  | "kontrol"
  | "teslim"
  | "iptal";

// --- Durum Grubu (3'lü sadeleştirme) ---
// Kullanıcı arayüzünde kanban/filtre için: Yapılacak / Yapılıyor / Yapıldı
export type OperationStatusGroup = "yapilacak" | "yapiliyor" | "yapildi";

export const OPERATION_STATUS_GROUP_LABELS: Record<OperationStatusGroup, string> = {
  yapilacak: "Yapılacak",
  yapiliyor: "Yapılıyor",
  yapildi: "Yapıldı",
};

/** Detaylı durum → 3'lü grup eşleşmesi */
export function getStatusGroup(status: OperationStatus): OperationStatusGroup {
  if (status === "talep" || status === "planlama") return "yapilacak";
  if (status === "saha" || status === "isleme" || status === "kontrol") return "yapiliyor";
  return "yapildi"; // teslim, iptal
}

/** Grup → varsayılan durum (grup seçilince hangi status'e setlenir) */
export const GROUP_DEFAULT_STATUS: Record<OperationStatusGroup, OperationStatus> = {
  yapilacak: "talep",
  yapiliyor: "saha",
  yapildi: "teslim",
};

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
  subTypes?: OperationSubType[];
  requester: string;
  status: OperationStatus;
  location: OperationLocation;
  paftalar?: string[];
  customFields?: Record<string, string>;
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
  startTime?: string;
  endTime?: string;
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
export type PersonnelStatus = "aktif" | "izinli" | "pasif";

export type PilotLicenseClass = "IHA-0" | "IHA-1" | "IHA-2" | "IHA-3";

export interface PilotLicense {
  licenseClass: PilotLicenseClass;
  licenseNumber?: string;
  expiryDate?: string;
  documentUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  tcKimlikNo?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  profession?: string;
  skills?: string[];
  specialties?: string[];
  certifications?: string[];
  status: PersonnelStatus;
  leaveStart?: string;
  leaveEnd?: string;
  pilotLicense?: PilotLicense;
  profilePhotoUrl?: string;
  currentOperationId?: string;
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

// --- Bakım Kaydı ---
export type MaintenanceType = "bakim" | "onarim" | "kalibrasyon" | "guncelleme";

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  date: string;
  description: string;
  cost?: number;
  performedBy?: string;
  nextDueDate?: string;
  createdAt: string;
}

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  bakim: "Bakım",
  onarim: "Onarım",
  kalibrasyon: "Kalibrasyon",
  guncelleme: "Güncelleme",
};

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
  | "permissions"
  | "map"
  | "inventory"
  | "personnel"
  | "infoBank"
  | "reports"
  | "settings";

// --- Bilgi Bankası ---
export type InfoCategory = "hesap" | "lisans" | "ag" | "sigorta" | "arac" | "diger";

export interface InfoField {
  key: string;
  value: string;
  isSecret?: boolean;
}

export interface InfoEntry {
  id: string;
  title: string;
  category: InfoCategory;
  fields: InfoField[];
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export const INFO_CATEGORY_LABELS: Record<InfoCategory, string> = {
  hesap: "Hesap & Şifreler",
  lisans: "Lisans & Aktivasyon",
  ag: "Ağ & Donanım",
  sigorta: "Sigorta",
  arac: "Araç Bilgileri",
  diger: "Diğer",
};

// --- Rapor ---
export type ReportPeriod = "haftalik" | "aylik" | "yillik" | "ozel";
export type ReportType = "ozet" | "ekipman" | "personel" | "talep";

// --- Label Maps ---
export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  iha: "İHA",
  lidar: "LİDAR",
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
  permissions: "Uçuş İzinleri",
  map: "Harita",
  inventory: "Envanter",
  personnel: "Personel",
  infoBank: "Bilgi Bankası",
  reports: "Raporlar",
  settings: "Ayarlar",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  ozet: "Aylık Özet",
  ekipman: "Ekipman Kullanım",
  personel: "Personel Performans",
  talep: "Talep Analizi",
};

// --- Araç Etkinlikleri ---
export type VehicleEventType = "muayene" | "bakim" | "sigorta" | "lastik" | "genel";

export interface VehicleEvent {
  id: string;
  equipmentId?: string;
  equipmentName?: string;
  title: string;
  eventType: VehicleEventType;
  eventDate: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
}

export const VEHICLE_EVENT_TYPE_LABELS: Record<VehicleEventType, string> = {
  muayene: "Muayene",
  bakim: "Bakım",
  sigorta: "Sigorta",
  lastik: "Lastik",
  genel: "Genel",
};

export const VEHICLE_EVENT_TYPE_ICONS: Record<VehicleEventType, string> = {
  muayene: "🔍",
  bakim: "🔧",
  sigorta: "🛡️",
  lastik: "🛞",
  genel: "🚗",
};
