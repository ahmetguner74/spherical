import type { OperationType } from "@/types/iha";

export interface WorkflowStep {
  id: string;
  label: string;
  description?: string;
}

export const WORKFLOW_STEPS: Partial<Record<OperationType, WorkflowStep[]>> = {
  iha: [
    { id: "talep", label: "Talep alındı", description: "Yazılı/sözlü/iç planlama" },
    { id: "izin", label: "Uçuş izni (SHGM)", description: "HSD belgesi alındı" },
    { id: "saha", label: "Sahaya gidildi" },
    { id: "ucus", label: "Uçuş yapıldı" },
    { id: "veri", label: "Veri aktarıldı" },
    { id: "isleme", label: "Veri işlendi" },
    { id: "cikti", label: "Çıktılar üretildi" },
    { id: "teslim", label: "Teslim edildi" },
  ],
  lidar: [
    { id: "gps_statik", label: "GPS statik oturum başlatıldı" },
    { id: "tarama", label: "Tarama yapıldı" },
    { id: "gps_kayit", label: "GPS kaydedildi" },
    { id: "ppk", label: "PPK işlendi" },
    { id: "cikti", label: "Çıktılar alındı" },
    { id: "teslim", label: "Teslim edildi" },
  ],
  drone_fotogrametri: [
    { id: "talep", label: "Talep alındı", description: "Yazılı/sözlü/iç planlama" },
    { id: "izin", label: "Uçuş izni (SHGM)", description: "HSD belgesi alındı" },
    { id: "saha", label: "Sahaya gidildi", description: "İniş/kalkış noktası seçildi" },
    { id: "irtibat", label: "Koordinasyon irtibatı", description: "HSD irtibatları arandı" },
    { id: "plan", label: "Uçuş planı çizildi", description: "Alan, GSD, yükseklik" },
    { id: "ucus", label: "Uçuş yapıldı", description: "Sorti tamamlandı" },
    { id: "veri", label: "Veri aktarıldı", description: "SD kart → bilgisayar" },
    { id: "rinex", label: "RINEX indirildi", description: "BUSAGA'dan tarih+saat" },
    { id: "ppk", label: "PPK işlendi", description: "Hassas koordinat elde edildi" },
    { id: "fotogrametri", label: "Fotogrametri işlendi", description: "Metashape/Pix4D" },
    { id: "cikti", label: "Çıktılar üretildi", description: "Ortofoto, DEM, nokta bulutu" },
    { id: "upload", label: "Sunucuya yüklendi", description: "COPC formatı" },
    { id: "teslim", label: "Teslim edildi" },
  ],
  lidar_el: [
    { id: "gps_statik", label: "GPS statik oturum başlatıldı" },
    { id: "tarama", label: "Taramalar yapıldı", description: "20 dk'lık taramalar" },
    { id: "gps_kayit", label: "GPS kaydedildi", description: "RTK + statik data" },
    { id: "upload_drive", label: "Drive'a yüklendi", description: "Lixel Studio için" },
    { id: "rinex", label: "StaticToRinex dönüşümü" },
    { id: "ppk", label: "PPK işlendi", description: "Navigation + veriler" },
    { id: "cikti", label: "Çıktılar alındı", description: "Nokta bulutu + panorama" },
    { id: "teslim", label: "Teslim edildi" },
  ],
  lidar_arac: [
    { id: "gps_statik", label: "GPS statik oturum başlatıldı" },
    { id: "kit_kurulum", label: "Araç kiti kuruldu", description: "Xgrids araç montajı" },
    { id: "tarama", label: "Araç taraması yapıldı", description: "GPS 5km içinde" },
    { id: "gps_kayit", label: "GPS kaydedildi" },
    { id: "upload_drive", label: "Drive'a yüklendi" },
    { id: "rinex", label: "StaticToRinex dönüşümü" },
    { id: "ppk", label: "PPK işlendi" },
    { id: "cikti", label: "Çıktılar alındı", description: "Nokta bulutu" },
    { id: "teslim", label: "Teslim edildi" },
  ],
  oblik_cekim: [
    { id: "talep", label: "Talep alındı" },
    { id: "izin", label: "Uçuş izni (SHGM)" },
    { id: "saha", label: "Sahaya gidildi" },
    { id: "ucus", label: "Oblik çekim yapıldı", description: "M300 + Share 102S" },
    { id: "veri", label: "Veri aktarıldı" },
    { id: "isleme", label: "3D model işlendi", description: "iTwin Capture / Metashape" },
    { id: "cikti", label: "3D şehir modeli üretildi" },
    { id: "teslim", label: "Teslim edildi" },
  ],
  panorama_360: [
    { id: "talep", label: "Talep alındı" },
    { id: "saha", label: "Sahaya gidildi" },
    { id: "cekim", label: "Panoramik çekim yapıldı", description: "DJI Matrice 4E" },
    { id: "veri", label: "Veri aktarıldı" },
    { id: "isleme", label: "Panorama işlendi" },
    { id: "upload", label: "Sunucuya yüklendi" },
    { id: "teslim", label: "Teslim edildi" },
  ],
};
