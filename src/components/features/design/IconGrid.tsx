"use client";

import { OP_TYPE_ICONS, VEHICLE_EVENT_ICONS } from "@/config/icons";
import {
  IconSun, IconMoon, IconMenu, IconClose, IconPlus, IconTrash, IconEdit,
  IconChevronLeft, IconChevronRight, IconMoreVertical, IconCheck, IconXCircle,
  IconMapPin, IconDesign, IconYapilacak, IconYapiliyor, IconYapildi,
} from "@/config/icons";
import { OPERATION_TYPE_LABELS, VEHICLE_EVENT_TYPE_LABELS } from "@/types/iha";
import type { LucideIcon } from "lucide-react";

interface IconEntry {
  name: string;
  Icon: LucideIcon;
}

const UI_ICONS: IconEntry[] = [
  { name: "Sun", Icon: IconSun },
  { name: "Moon", Icon: IconMoon },
  { name: "Menu", Icon: IconMenu },
  { name: "Close", Icon: IconClose },
  { name: "Plus", Icon: IconPlus },
  { name: "Trash", Icon: IconTrash },
  { name: "Edit", Icon: IconEdit },
  { name: "Left", Icon: IconChevronLeft },
  { name: "Right", Icon: IconChevronRight },
  { name: "More", Icon: IconMoreVertical },
  { name: "Check", Icon: IconCheck },
  { name: "XCircle", Icon: IconXCircle },
  { name: "MapPin", Icon: IconMapPin },
  { name: "Design", Icon: IconDesign },
  { name: "Yapılacak", Icon: IconYapilacak },
  { name: "Yapılıyor", Icon: IconYapiliyor },
  { name: "Yapıldı", Icon: IconYapildi },
];

export function IconGrid() {
  const opTypes = Object.entries(OP_TYPE_ICONS) as [string, LucideIcon][];
  const vehicleTypes = Object.entries(VEHICLE_EVENT_ICONS) as [string, LucideIcon][];

  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">İkon Kütüphanesi</h2>
      <p className="text-xs text-[var(--muted-foreground)] mb-4">Lucide Icons — tüm ikonlar <code className="text-[var(--accent)]">@/config/icons</code> dosyasından gelir.</p>

      <div className="space-y-6">
        <IconSection title="Operasyon Tipleri">
          {opTypes.map(([key, Icon]) => (
            <IconCard key={key} name={OPERATION_TYPE_LABELS[key as keyof typeof OPERATION_TYPE_LABELS]} Icon={Icon} />
          ))}
        </IconSection>

        <IconSection title="Araç Etkinlikleri">
          {vehicleTypes.map(([key, Icon]) => (
            <IconCard key={key} name={VEHICLE_EVENT_TYPE_LABELS[key as keyof typeof VEHICLE_EVENT_TYPE_LABELS]} Icon={Icon} />
          ))}
        </IconSection>

        <IconSection title="UI İkonları">
          {UI_ICONS.map((item) => (
            <IconCard key={item.name} name={item.name} Icon={item.Icon} />
          ))}
        </IconSection>
      </div>
    </section>
  );
}

function IconSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">{title}</h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">{children}</div>
    </div>
  );
}

function IconCard({ name, Icon }: { name: string; Icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
      <Icon className="w-5 h-5 text-[var(--foreground)]" />
      <span className="text-[9px] text-[var(--muted-foreground)] text-center leading-tight">{name}</span>
    </div>
  );
}
