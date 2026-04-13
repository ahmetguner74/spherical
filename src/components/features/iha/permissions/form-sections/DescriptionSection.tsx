"use client";

import { FormInput, FormTextarea } from "@/components/ui";

interface DescriptionSectionProps {
  description: string;
  applicationDate: string;
  conditions: string;
  coordinationContacts: string;
  notes: string;
  onUpdate: (field: string, value: string) => void;
}

export function DescriptionSection({
  description, applicationDate,
  conditions, coordinationContacts, notes,
  onUpdate,
}: DescriptionSectionProps) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Açıklamalar (Sayfa 2)" />

      <FormTextarea
        label="Açıklama Metni"
        value={description}
        onChange={(e) => onUpdate("description", e.target.value)}
        rows={4}
        placeholder="Uçuş yapma gerekliliğini açıklayın..."
      />

      <FormInput
        label="Başvuru Tarihi"
        type="date"
        value={applicationDate}
        onChange={(e) => onUpdate("applicationDate", e.target.value)}
      />

      <FormTextarea
        label="Koordinasyon İrtibat"
        value={coordinationContacts}
        onChange={(e) => onUpdate("coordinationContacts", e.target.value)}
        rows={2}
        placeholder="Uçuş öncesi aranması gereken kişi/kurumlar"
      />

      <FormTextarea
        label="İzin Koşulları"
        value={conditions}
        onChange={(e) => onUpdate("conditions", e.target.value)}
        rows={2}
        placeholder="SHGM'nin belirttiği koşullar"
      />

      <FormTextarea
        label="Notlar"
        value={notes}
        onChange={(e) => onUpdate("notes", e.target.value)}
        rows={2}
      />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="pt-2 border-t border-[var(--border)]">
      <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{title}</h4>
    </div>
  );
}
