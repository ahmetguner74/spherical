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
  // Markdown toolbar
  Bold as IconBold,
  Italic as IconItalic,
  Heading2 as IconHeading,
  List as IconList,
  Link as IconLink,
  Quote as IconQuote,
  Code as IconCode,
} from "lucide-react";

// ─── GitHub SVG (Lucide'da yok) ───

import { createElement } from "react";

interface IconProps {
  className?: string;
}

const GITHUB_PATH = "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z";

export function IconGitHub({ className }: IconProps) {
  return createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className,
  }, createElement("path", { d: GITHUB_PATH }));
}

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
