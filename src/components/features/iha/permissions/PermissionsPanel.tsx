"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { PermissionForm } from "./PermissionForm";
import { PermissionCard } from "./PermissionCard";
import type { FlightPermission } from "@/types/iha";
import { PERMISSION_STATUS_LABELS } from "@/types/iha";

export function PermissionsPanel() {
  const {
    flightPermissions,
    operations,
    addFlightPermission,
    updateFlightPermission,
    deleteFlightPermission,
  } = useIhaStore();

  const [selectedPerm, setSelectedPerm] = useState<FlightPermission | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const active = flightPermissions.filter((fp) => fp.status === "onaylandi");
  const other = flightPermissions.filter((fp) => fp.status !== "onaylandi");

  const handleAdd = () => {
    setSelectedPerm(undefined);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSelect = (perm: FlightPermission) => {
    setSelectedPerm(perm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<FlightPermission, "id" | "createdAt">) => {
    if (selectedPerm) {
      updateFlightPermission(selectedPerm.id, data);
    } else {
      addFlightPermission(data);
    }
    setIsModalOpen(false);
  };

  const getOpTitle = (opId?: string) =>
    opId ? operations.find((op) => op.id === opId)?.title : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Uçuş İzinleri (SHGM)
          </h2>
          <Badge variant="success">{active.length} aktif</Badge>
        </div>
        <Button onClick={handleAdd} size="sm">+ Yeni İzin</Button>
      </div>

      {flightPermissions.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <p className="text-sm">Henüz uçuş izni kaydı yok.</p>
          <p className="text-xs mt-1">HSD belgelerini sisteme ekleyin.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-2">
                Aktif İzinler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {active.map((perm) => (
                  <PermissionCard
                    key={perm.id}
                    permission={perm}
                    operationTitle={getOpTitle(perm.operationId)}
                    onClick={() => handleSelect(perm)}
                  />
                ))}
              </div>
            </div>
          )}

          {other.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                Diğer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {other.map((perm) => (
                  <PermissionCard
                    key={perm.id}
                    permission={perm}
                    operationTitle={getOpTitle(perm.operationId)}
                    onClick={() => handleSelect(perm)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
          {selectedPerm && !isEditing
            ? `İzin: ${selectedPerm.hsdNumber ?? selectedPerm.id}`
            : selectedPerm
              ? "İzin Düzenle"
              : "Yeni Uçuş İzni"}
        </h2>

        {isEditing || !selectedPerm ? (
          <PermissionForm
            permission={selectedPerm}
            operations={operations}
            onSave={handleSave}
            onCancel={() => {
              if (selectedPerm) setIsEditing(false);
              else setIsModalOpen(false);
            }}
          />
        ) : (
          <PermissionDetail
            permission={selectedPerm}
            operationTitle={getOpTitle(selectedPerm.operationId)}
            onEdit={() => setIsEditing(true)}
            onDelete={() => {
              deleteFlightPermission(selectedPerm.id);
              setIsModalOpen(false);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function PermissionDetail({
  permission,
  operationTitle,
  onEdit,
  onDelete,
}: {
  permission: FlightPermission;
  operationTitle?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge
          variant={
            permission.status === "onaylandi"
              ? "success"
              : permission.status === "reddedildi"
                ? "danger"
                : "warning"
          }
        >
          {PERMISSION_STATUS_LABELS[permission.status]}
        </Badge>
        {permission.hsdNumber && (
          <span className="text-xs text-[var(--muted-foreground)] font-mono">
            {permission.hsdNumber}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Başlangıç</span>
          <p className="text-[var(--foreground)]">{permission.startDate}</p>
        </div>
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Bitiş</span>
          <p className="text-[var(--foreground)]">{permission.endDate}</p>
        </div>
        {permission.maxAltitude && (
          <div>
            <span className="text-xs text-[var(--muted-foreground)]">Max Yükseklik</span>
            <p className="text-[var(--foreground)]">{permission.maxAltitude}m AGL</p>
          </div>
        )}
        {operationTitle && (
          <div>
            <span className="text-xs text-[var(--muted-foreground)]">Operasyon</span>
            <p className="text-[var(--foreground)]">{operationTitle}</p>
          </div>
        )}
      </div>

      {permission.polygonCoordinates.length > 0 && (
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">İzin Bölgesi ({permission.polygonCoordinates.length} nokta)</span>
          <div className="mt-1 space-y-0.5">
            {permission.polygonCoordinates.map((coord, i) => (
              <p key={i} className="text-xs text-[var(--foreground)] font-mono">
                {i + 1}. {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
              </p>
            ))}
          </div>
        </div>
      )}

      {permission.coordinationContacts && (
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Koordinasyon İrtibat</span>
          <p className="text-sm text-[var(--foreground)] whitespace-pre-line">{permission.coordinationContacts}</p>
        </div>
      )}

      {permission.conditions && (
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">İzin Koşulları</span>
          <p className="text-sm text-[var(--foreground)] whitespace-pre-line">{permission.conditions}</p>
        </div>
      )}

      {permission.notes && (
        <div>
          <span className="text-xs text-[var(--muted-foreground)]">Notlar</span>
          <p className="text-sm text-[var(--foreground)]">{permission.notes}</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button onClick={onEdit}>Düzenle</Button>
        <Button variant="danger" onClick={onDelete}>Sil</Button>
      </div>
    </div>
  );
}
