// Rol & İzin Yönetimi — Tek Doğruluk Kaynağı
// Yeni izin eklemek: Permission type'a ekle → ROLE_PERMISSIONS'da ata → bileşende can() ile kontrol et

/** Kullanıcı rolleri — profiles.role ile birebir eşleşir */
export type UserRole = "super_admin" | "admin" | "viewer";

/** Granüler izin tanımları */
export type Permission =
  // Operasyonlar
  | "operations.create" | "operations.edit" | "operations.delete"
  // Envanter
  | "inventory.create" | "inventory.delete" | "inventory.checkout"
  // Personel
  | "personnel.create" | "personnel.delete"
  // Uçuş izinleri
  | "permissions.create" | "permissions.edit" | "permissions.delete"
  // Çıktılar
  | "deliverables.delete"
  // Dosya ekleri
  | "attachments.delete"
  // Bakım
  | "maintenance.delete"
  // Araç etkinlikleri
  | "vehicle_events.delete"
  // Uçuş kayıtları
  | "flight_logs.delete"
  // Bilgi bankası
  | "infobank.delete"
  // Depolama
  | "storage.edit" | "storage.delete"
  // Ayarlar
  | "settings.view" | "settings.users"
  // Raporlar
  | "reports.audit"
  // Sistem
  | "system.changelog";

/** Rol → izin eşlemesi */
const ROLE_PERMISSIONS: Record<UserRole, readonly (Permission | "*")[]> = {
  // Süper admin: her şey
  super_admin: ["*"],

  // Admin: tam CRUD (kullanıcı yönetimi hariç)
  admin: [
    "operations.create", "operations.edit", "operations.delete",
    "inventory.create", "inventory.delete", "inventory.checkout",
    "personnel.create", "personnel.delete",
    "permissions.create", "permissions.edit", "permissions.delete",
    "deliverables.delete",
    "attachments.delete",
    "maintenance.delete",
    "vehicle_events.delete",
    "flight_logs.delete",
    "infobank.delete",
    "storage.edit", "storage.delete",
    "settings.view",
    "reports.audit",
  ],

  // Görüntüleyici: sadece okuma (hiçbir yazma izni yok)
  viewer: [],
};

/** İzin kontrolü */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes("*") || perms.includes(permission);
}

/** Rol etiketleri (UI'da gösterilecek) */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Süper Admin",
  admin: "Admin",
  viewer: "Görüntüleyici",
};

/** Tüm roller (sıralı — dropdown'larda kullanılır) */
export const ALL_ROLES: readonly UserRole[] = ["super_admin", "admin", "viewer"];
