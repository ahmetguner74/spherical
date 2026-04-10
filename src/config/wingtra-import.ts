// Wingtra Uçuş Takibi — İlk 13 Kayıt (Excel'den aktarım)
// Geçmiş veri, tüm kayıtlar "teslim" durumunda

export interface WingtraImportRecord {
  date: string;         // YYYY-MM-DD
  pafta: string;        // H21C02C, "uğur çöplük" vb.
  ilce: string;         // nilüfer, gemlik
  alanKm2?: number;     // 5.9171
  gsd?: string;         // "3.5"
  ruzgar?: string;      // "2-4", "4-7"
  yazilim?: string;     // "1.8.2"
  operatorler: string[]; // ["Ahmet Güner", "Fatih Ordu"]
  ekAciklama?: string;
}

export const WINGTRA_FIRST_13: WingtraImportRecord[] = [
  { date: "2023-03-24", pafta: "H21C02C", ilce: "Nilüfer", alanKm2: 5.9171, gsd: "3.5", ruzgar: "2-4", yazilim: "1.8.2", operatorler: ["Ahmet Güner", "Fatih Ordu"] },
  { date: "2023-03-27", pafta: "H21C07A", ilce: "Nilüfer", alanKm2: 5.9171, gsd: "3.5", ruzgar: "4-7", yazilim: "1.8.2", operatorler: ["Ahmet Güner", "Fatih Ordu"] },
  { date: "2023-03-27", pafta: "H21C07B", ilce: "Nilüfer", alanKm2: 5.9171, gsd: "3.5", ruzgar: "4-7", yazilim: "1.8.2", operatorler: ["Ahmet Güner", "Fatih Ordu"] },
  { date: "2023-03-30", pafta: "H21C03A", ilce: "Nilüfer", alanKm2: 5.9171, gsd: "3.5", ruzgar: "5-7.5", yazilim: "1.8.2", operatorler: ["Ahmet Güner", "Fatih Ordu"] },
  { date: "2023-03-30", pafta: "H21C03D", ilce: "Nilüfer", alanKm2: 5.9171, gsd: "3.5", ruzgar: "5-7.5", yazilim: "1.8.2", operatorler: ["Ahmet Güner", "Fatih Ordu"] },
  { date: "2023-04-13", pafta: "H22A14D", ilce: "Gemlik", gsd: "5", ruzgar: "2-5", yazilim: "1.8.2", operatorler: ["Ahmet Güner", "Fatih Ordu"], ekAciklama: "İşlenmiş olabilir!" },
  { date: "2023-04-13", pafta: "H22A14C", ilce: "Gemlik", gsd: "5", ruzgar: "2-5", yazilim: "1.8.2", operatorler: ["Ahmet Güner", "Fatih Ordu"], ekAciklama: "İşlenmiş olabilir!" },
  { date: "2023-04-14", pafta: "H22A14A", ilce: "Gemlik", gsd: "5", ruzgar: "2-4", yazilim: "1.8.2", operatorler: ["Ahmet Güner", "Fatih Ordu"] },
  { date: "2023-04-14", pafta: "H22A14B", ilce: "Gemlik", gsd: "5", ruzgar: "2-4", yazilim: "1.8.2", operatorler: ["Ahmet Güner", "Fatih Ordu"] },
  { date: "2023-05-15", pafta: "H21C09B", ilce: "Nilüfer", gsd: "3.5", ruzgar: "2-4", yazilim: "1.8.3", operatorler: ["Fatih Ordu"] },
  { date: "2023-05-16", pafta: "Uğur Çöplük", ilce: "Nilüfer", gsd: "2.7", ruzgar: "2-4", yazilim: "1.8.3", operatorler: ["Fatih Ordu"] },
  { date: "2023-05-16", pafta: "Uğur Demirtaş Çalı", ilce: "Nilüfer", gsd: "2.7", ruzgar: "2-4", yazilim: "1.8.3", operatorler: ["Fatih Ordu"] },
  { date: "2023-05-23", pafta: "H21C03C", ilce: "Nilüfer", gsd: "3.5", ruzgar: "2-4", yazilim: "1.8.3", operatorler: ["Ahmet Güner", "Fatih Ordu"] },
];
