"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button, FormInput, FormSelect } from "@/components/ui";
import type { Equipment, CheckoutEntry, TeamMember } from "@/types/iha";

interface EquipmentCheckoutProps {
  equipment: Equipment;
  team: TeamMember[];
  onCheckout: (equipmentId: string, entry: Omit<CheckoutEntry, "id">) => void;
  onReturn: (equipmentId: string, entryId: string) => void;
}

export function EquipmentCheckout({ equipment, team, onCheckout, onReturn }: EquipmentCheckoutProps) {
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [personId, setPersonId] = useState("");
  const [notes, setNotes] = useState("");

  const activeCheckout = (equipment.checkoutLog ?? []).find((c) => !c.returnDate);
  const history = (equipment.checkoutLog ?? []).filter((c) => c.returnDate).slice(0, 5);
  const selectedPerson = team.find((t) => t.id === personId);

  const handleCheckout = () => {
    if (!personId || !selectedPerson) return;
    onCheckout(equipment.id, {
      personId,
      personName: selectedPerson.name,
      checkoutDate: new Date().toISOString().split("T")[0],
      notes: notes || undefined,
    });
    setShowForm(false);
    setPersonId("");
    setNotes("");
  };

  return (
    <div className="space-y-3 pt-3 border-t border-[var(--border)]">
      <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Zimmet Durumu
      </h4>

      {activeCheckout ? (
        <div className="p-3 rounded-lg border border-[var(--feedback-warning)]/30 bg-[var(--feedback-warning-bg)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {activeCheckout.personName}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {activeCheckout.checkoutDate} tarihinden beri
              </p>
              {activeCheckout.notes && (
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{activeCheckout.notes}</p>
              )}
            </div>
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => onReturn(equipment.id, activeCheckout.id)}
              >
                İade Et
              </Button>
            )}
          </div>
        </div>
      ) : equipment.status === "ariza" || equipment.status === "bakim" ? (
        <p className="text-xs text-[var(--feedback-error)] py-2">
          Ekipman {equipment.status === "ariza" ? "arızalı" : "bakımda"} — zimmet verilemez.
        </p>
      ) : showForm ? (
        <div className="p-3 rounded-lg border border-[var(--accent)] bg-[var(--accent)]/5 space-y-3">
          {equipment.ownership === "odunc" && (
            <p className="text-xs text-[var(--feedback-warning)] py-1 px-2 rounded bg-[var(--feedback-warning-bg)]">
              Bu ekipman ödünç alınmış — iade talep edilebilir, dikkatli olun.
            </p>
          )}
          <FormSelect
            label="Kişi"
            required
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
          >
            <option value="">Seçin</option>
            {team.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </FormSelect>
          <FormInput
            label="Not"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Hangi operasyon için?"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCheckout} disabled={!personId}>Zimmetle</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>İptal</Button>
          </div>
        </div>
      ) : isAdmin ? (
        <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
          Zimmet Ver
        </Button>
      ) : null}

      {history.length > 0 && (
        <div>
          <h5 className="text-xs text-[var(--muted-foreground)] mb-1">Son Zimmetler</h5>
          <div className="space-y-1">
            {history.map((entry) => (
              <div key={entry.id} className="text-xs flex justify-between py-1 border-b border-[var(--border)] last:border-0">
                <span className="text-[var(--foreground)]">{entry.personName}</span>
                <span className="text-[var(--muted-foreground)]">
                  {entry.checkoutDate} → {entry.returnDate?.split("T")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
