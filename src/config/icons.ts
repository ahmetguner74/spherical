// Merkezi İkon Yönetimi — Lucide Icons
// Tüm ikonlar buradan import edilir. Bileşenler doğrudan lucide-react kullanmaz.

import type { LucideIcon } from "lucide-react";
import type { OperationType, VehicleEventType } from "@/types/iha";

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
  Download as IconDownload,
  Upload as IconUpload,
  Search as IconSearch,
  Filter as IconFilter,
  Calendar as IconCalendar,
  FileUp as IconFileUp,
  Paperclip as IconFiles,
  Plane as IconPlane,
  Ruler as IconRuler,
} from "lucide-react";

// ─── Operasyon tipi ikon mapping ───
import {
  Radar, Car, Plane, Triangle, Globe,
  Search, Wrench, Shield, CircleDot,
} from "lucide-react";

export const OP_TYPE_ICONS: Record<OperationType, LucideIcon> = {
  iha: Plane,
  lidar: Radar,
  lidar_el: Radar,
  lidar_arac: Car,
  drone_fotogrametri: Plane,
  oblik_cekim: Triangle,
  panorama_360: Globe,
};

// ─── Araç etkinlik tipi ikon mapping ───
export const VEHICLE_EVENT_ICONS: Record<VehicleEventType, LucideIcon> = {
  muayene: Search,
  bakim: Wrench,
  sigorta: Shield,
  lastik: CircleDot,
  genel: Car,
};
