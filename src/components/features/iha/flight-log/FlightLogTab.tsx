"use client";

import { useState } from "react";
import { useIhaStore } from "../shared/ihaStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FlightLogTable } from "./FlightLogTable";
import { FlightLogForm } from "./FlightLogForm";
import type { FlightLog } from "@/types/iha";
import { OPERATION_TYPE_LABELS, PPK_STATUS_LABELS } from "@/types/iha";

export function FlightLogTab() {
  const {
    flightLogs,
    operations,
    equipment,
    team,
    addFlightLog,
    updateFlightLog,
    deleteFlightLog,
  } = useIhaStore();

  const [selectedLog, setSelectedLog] = useState<FlightLog | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleAdd = () => {
    setSelectedLog(undefined);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSelect = (log: FlightLog) => {
    setSelectedLog(log);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<FlightLog, "id" | "createdAt" | "updatedAt">) => {
    if (selectedLog) {
      updateFlightLog(selectedLog.id, data);
    } else {
      addFlightLog(data);
    }
    setIsModalOpen(false);
  };

  const sorted = [...flightLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-[var(--muted-foreground)]">
            {flightLogs.length} kayıt
          </span>
        </div>
        <Button onClick={handleAdd} size="sm">
          + Yeni Kayıt
        </Button>
      </div>

      <FlightLogTable logs={sorted} onSelect={handleSelect} />

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
          {selectedLog && !isEditing ? "Uçuş Kaydı" : selectedLog ? "Kayıt Düzenle" : "Yeni Uçuş / Tarama Kaydı"}
        </h2>

        {isEditing || !selectedLog ? (
          <FlightLogForm
            flightLog={selectedLog}
            operations={operations}
            equipment={equipment}
            team={team}
            onSave={handleSave}
            onCancel={() => {
              if (selectedLog) setIsEditing(false);
              else setIsModalOpen(false);
            }}
          />
        ) : (
          <FlightLogDetail
            log={selectedLog}
            onEdit={() => setIsEditing(true)}
            onDelete={() => {
              deleteFlightLog(selectedLog.id);
              setIsModalOpen(false);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function FlightLogDetail({
  log,
  onEdit,
  onDelete,
}: {
  log: FlightLog;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // Labels imported at module level

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Info label="Tarih" value={log.date} />
        <Info label="Tip" value={OPERATION_TYPE_LABELS[log.type]} />
        {log.startTime && <Info label="Başlangıç" value={log.startTime} />}
        {log.endTime && <Info label="Bitiş" value={log.endTime} />}
        {log.duration && <Info label="Süre" value={`${log.duration} dk`} />}
        {log.pilotName && <Info label="Pilot" value={log.pilotName} />}
        {log.equipmentName && <Info label="Ekipman" value={log.equipmentName} />}
      </div>

      {(log.altitude || log.gsd) && (
        <>
          <SectionLabel text="Parametreler" />
          <div className="grid grid-cols-3 gap-3 text-sm">
            {log.altitude && <Info label="Yükseklik" value={`${log.altitude} m`} />}
            {log.gsd && <Info label="GSD" value={`${log.gsd} cm/px`} />}
            {log.photoCount && <Info label="Fotoğraf" value={`${log.photoCount}`} />}
            {log.scanCount && <Info label="Tarama" value={`${log.scanCount}`} />}
            {log.overlapForward && <Info label="İleri Örtüşme" value={`%${log.overlapForward}`} />}
            {log.overlapSide && <Info label="Yan Örtüşme" value={`%${log.overlapSide}`} />}
          </div>
        </>
      )}

      {(log.batteryUsed || log.landingCount) && (
        <>
          <SectionLabel text="Batarya" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            {log.batteryUsed && <Info label="Batarya" value={`${log.batteryUsed} adet`} />}
            {log.landingCount && <Info label="İniş" value={`${log.landingCount}`} />}
          </div>
        </>
      )}

      {(log.gpsBaseStation || log.corsConnection) && (
        <>
          <SectionLabel text="GPS / CORS" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            {log.gpsBaseStation && <Info label="Baz İstasyonu" value={log.gpsBaseStation} />}
            {log.staticDuration && <Info label="Statik Süre" value={`${log.staticDuration} dk`} />}
            {log.corsConnection && <Info label="CORS" value={log.corsConnection} />}
            {log.ppkStatus && <Info label="PPK" value={PPK_STATUS_LABELS[log.ppkStatus]} />}
          </div>
        </>
      )}

      {log.weather && (
        <>
          <SectionLabel text="Hava" />
          <div className="grid grid-cols-3 gap-3 text-sm">
            <Info label="Durum" value={log.weather} />
            {log.windSpeed && <Info label="Rüzgar" value={`${log.windSpeed} km/sa`} />}
            {log.temperature && <Info label="Sıcaklık" value={`${log.temperature}°C`} />}
          </div>
        </>
      )}

      {log.location.il && (
        <>
          <SectionLabel text="Konum" />
          <p className="text-sm text-[var(--foreground)]">
            {[log.location.il, log.location.ilce, log.location.mahalle].filter(Boolean).join(" / ")}
          </p>
          {log.location.pafta && (
            <p className="text-xs text-[var(--muted-foreground)]">
              Pafta: {log.location.pafta}
              {log.location.ada && ` · Ada: ${log.location.ada}`}
              {log.location.parsel && ` · Parsel: ${log.location.parsel}`}
            </p>
          )}
        </>
      )}

      {log.customFields && Object.keys(log.customFields).length > 0 && (
        <>
          <SectionLabel text="Özel Alanlar" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(log.customFields).map(([key, value]) => (
              <Info key={key} label={key} value={value} />
            ))}
          </div>
        </>
      )}

      {log.notes && <Info label="Notlar" value={log.notes} />}

      <div className="flex gap-2 pt-2">
        <Button onClick={onEdit}>Düzenle</Button>
        <Button variant="danger" onClick={onDelete}>Sil</Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      <p className="text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider pt-2 border-t border-[var(--border)]">
      {text}
    </h4>
  );
}
