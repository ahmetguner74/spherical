// Merkezi İkon Yönetimi — Lucide Icons
// Tüm ikonlar buradan import edilir. Bileşenler doğrudan lucide-react kullanmaz.

import type { LucideIcon } from "lucide-react";
import type { OperationType, OperationMainCategory, OperationSubType, VehicleEventType } from "@/types/iha";

// ─── Re-exports (tekil kullanım) ───
export {
  Sun as IconSun,
  Moon as IconMoon,
  Menu as IconMenu,
  X as IconClose,
  Plus as IconPlus,
  Trash2 as IconTrash,
  Pencil as IconEdit,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
  MoreVertical as IconMoreVertical,
  MoreHorizontal as IconMore,
  Check as IconCheck,
  XCircle as IconXCircle,
  MapPin as IconMapPin,
  Palette as IconDesign,
  ClipboardList as IconYapilacak,
  RefreshCw as IconYapiliyor,
  CheckCircle as IconYapildi,
  // Nav ikonları
  LayoutDashboard as IconDashboard,
  Map as IconMap,
  ClipboardList as IconOperations,
  FileText as IconPermissions,
  Package as IconInventory,
  Users as IconPersonnel,
  BookOpen as IconInfoBank,
  BarChart3 as IconReports,
  Settings as IconSettings,
  // Durum ikonları
  Clock as IconClock,
  CheckCircle2 as IconCheckCircle,
  AlertCircle as IconAlert,
  AlertTriangle as IconWarning,
  // İşlem ikonları
  Copy as IconCopy,
  Download as IconDownload,
  Upload as IconUpload,
  Search as IconSearch,
  Filter as IconFilter,
  Calendar as IconCalendar,
  FileUp as IconFileUp,
  Paperclip as IconFiles,
  Plane as IconPlane,
  Ruler as IconRuler,
  Undo2 as IconUndo,
  Loader2 as IconLoader,
  GraduationCap as IconAkademi,
  Play as IconPlay,
  Image as IconImage,
  ArrowLeft as IconArrowLeft,
  ArrowRight as IconArrowRight,
  Type as IconType,
  Circle as IconCircle,
  Square as IconSquare,
  ArrowUpRight as IconArrowDiag,
  // Hava durumu
  Cloud as IconCloud,
  Wind as IconWind,
  Thermometer as IconThermometer,
  Droplet as IconDroplet,
  Eye as IconEye,
  CloudRain as IconCloudRain,
  CloudSnow as IconCloudSnow,
  Zap as IconZap,
  CloudSun as IconCloudSun,
  CloudFog as IconCloudFog,
  RefreshCcw as IconRefresh,
  ChevronDown as IconChevronDown,
  ChevronUp as IconChevronUp,
  // Auth
  LogOut as IconLogOut,
  UserCircle as IconUserCircle,
} from "lucide-react";

// ─── Operasyon tipi ikon mapping ───
import {
  Radar, Car, Plane, Triangle, Globe,
  Map as MapIcon,
  Search, Wrench, Shield, CircleDot,
  Monitor,
} from "lucide-react";

export const OP_TYPE_ICONS: Record<OperationType, LucideIcon> = {
  iha: Plane,
  lidar: Radar,
  ofis: Monitor,
  lidar_el: Radar,
  lidar_arac: Car,
  drone_fotogrametri: Plane,
  oblik_cekim: Triangle,
  panorama_360: Globe,
};

// ─── Ana kategori ikon mapping (TypeSelector için) ───
export const MAIN_CATEGORY_ICONS: Record<OperationMainCategory, LucideIcon> = {
  iha: Plane,
  lidar: Radar,
  ofis: Monitor,
};

// ─── Alt tip ikon mapping (TypeSelector için) ───
export const OP_SUBTYPE_ICONS: Record<OperationSubType, LucideIcon> = {
  ortofoto: MapIcon,
  oblik: Triangle,
  panorama_360: Globe,
  el_tarama: Radar,
  arac_tarama: Car,
};

// ─── Araç etkinlik tipi ikon mapping ───
export const VEHICLE_EVENT_ICONS: Record<VehicleEventType, LucideIcon> = {
  muayene: Search,
  bakim: Wrench,
  sigorta: Shield,
  lastik: CircleDot,
  genel: Car,
};
