"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { toast } from "@/components/ui/Toast";
import { useIhaStore } from "../shared/ihaStore";
import { FORM19_DEFAULTS } from "@/config/form19Defaults";
import { metersToNm } from "@/lib/coordinates";
import { ApplicantSection, FlightInfoSection, ZoneSection, DescriptionSection } from "./form-sections";
import type { FlightPermission, FlightPermissionCoordinate, FlightZoneType, PermissionStatus, TakeoffLandingPoint } from "@/types/iha";

interface PermissionFormProps {
  permission?: FlightPermission;
  onSave: (data: Omit<FlightPermission, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export function PermissionForm({ permission, onSave, onCancel }: PermissionFormProps) {
  const { equipment, team } = useIhaStore();
  const today = new Date().toISOString().slice(0, 10);

  // --- State (flat object, güncellenecek) ---
  const [form, setForm] = useState({
    status: permission?.status ?? "taslak" as PermissionStatus,
    hsdNumber: permission?.hsdNumber ?? "",
    // Başvuru sahibi
    applicantOrg: permission?.applicantOrg ?? FORM19_DEFAULTS.applicantOrg,
    applicantDepartment: permission?.applicantDepartment ?? FORM19_DEFAULTS.applicantDepartment,
    applicantAddress: permission?.applicantAddress ?? FORM19_DEFAULTS.applicantAddress,
    applicantPhone: permission?.applicantPhone ?? "",
    applicantEmail: permission?.applicantEmail ?? "",
    insurancePolicyNo: permission?.insurancePolicyNo ?? "",
    // İHA
    equipmentId: permission?.equipmentId ?? "",
    ihaRegistrationNo: permission?.ihaRegistrationNo ?? "",
    ihaClass: permission?.ihaClass ?? "",
    // Pilot
    pilotId: permission?.pilotId ?? "",
    pilotLicenseNo: permission?.pilotLicenseNo ?? "",
    // Uçuş
    flightPurpose: permission?.flightPurpose ?? "",
    startDate: permission?.startDate ?? "",
    endDate: permission?.endDate ?? "",
    startTimeUtc: permission?.startTimeUtc ?? "",
    endTimeUtc: permission?.endTimeUtc ?? "",
    altitudeFeet: permission?.altitudeFeet ?? 0,
    altitudeMeters: permission?.altitudeMeters ?? 0,
    // Bölge
    regionCity: permission?.regionCity ?? FORM19_DEFAULTS.regionCity,
    regionDistrict: permission?.regionDistrict ?? "",
    regionArea: permission?.regionArea ?? "",
    zoneType: permission?.zoneType ?? "polygon" as FlightZoneType,
    polygonCoordinates: permission?.polygonCoordinates ?? [] as FlightPermissionCoordinate[],
    circleCenterLat: permission?.circleCenter?.lat?.toString() ?? "",
    circleCenterLng: permission?.circleCenter?.lng?.toString() ?? "",
    circleRadius: permission?.circleRadius ?? 0,
    circleRadiusNm: permission?.circleRadius ? metersToNm(permission.circleRadius) : 0,
    routeCoordinates: permission?.routeCoordinates ?? [] as FlightPermissionCoordinate[],
    routeWidth: permission?.routeWidth ?? 0,
    routeWidthNm: permission?.routeWidth ? metersToNm(permission.routeWidth) : 0,
    // Kalkış / İniş
    takeoffPoints: permission?.takeoffPoints ?? [] as TakeoffLandingPoint[],
    landingPoints: permission?.landingPoints ?? [] as TakeoffLandingPoint[],
    // Açıklamalar
    description: permission?.description ?? "",
    applicantPersonId: permission?.applicantPersonId ?? "",
    applicantPersonTitle: permission?.applicantPersonTitle ?? "",
    applicationDate: permission?.applicationDate ?? today,
    conditions: permission?.conditions ?? "",
    coordinationContacts: permission?.coordinationContacts ?? "",
    notes: permission?.notes ?? "",
  });

  const update = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.startDate || !form.endDate) {
      toast("Başlangıç ve bitiş tarihleri zorunlu", "error");
      return;
    }
    if (form.endDate < form.startDate) {
      toast("Bitiş tarihi başlangıç tarihinden sonra olmalı", "error");
      return;
    }
    onSave({
      status: form.status as PermissionStatus,
      hsdNumber: form.hsdNumber || undefined,
      applicantOrg: form.applicantOrg || undefined,
      applicantDepartment: form.applicantDepartment || undefined,
      applicantAddress: form.applicantAddress || undefined,
      applicantPhone: form.applicantPhone || undefined,
      applicantEmail: form.applicantEmail || undefined,
      insurancePolicyNo: form.insurancePolicyNo || undefined,
      equipmentId: form.equipmentId || undefined,
      ihaRegistrationNo: form.ihaRegistrationNo || undefined,
      ihaClass: (form.ihaClass || undefined) as FlightPermission["ihaClass"],
      pilotId: form.pilotId || undefined,
      pilotLicenseNo: form.pilotLicenseNo || undefined,
      flightPurpose: (form.flightPurpose || undefined) as FlightPermission["flightPurpose"],
      startDate: form.startDate,
      endDate: form.endDate,
      startTimeUtc: form.startTimeUtc || undefined,
      endTimeUtc: form.endTimeUtc || undefined,
      altitudeFeet: form.altitudeFeet || undefined,
      altitudeMeters: form.altitudeMeters || undefined,
      regionCity: form.regionCity || undefined,
      regionDistrict: form.regionDistrict || undefined,
      regionArea: form.regionArea || undefined,
      zoneType: form.zoneType as FlightZoneType,
      polygonCoordinates: form.polygonCoordinates,
      circleCenter: form.zoneType === "circle" && form.circleCenterLat && form.circleCenterLng
        ? { lat: parseFloat(form.circleCenterLat), lng: parseFloat(form.circleCenterLng) }
        : undefined,
      circleRadius: form.zoneType === "circle" ? form.circleRadius || undefined : undefined,
      routeCoordinates: form.zoneType === "route" ? form.routeCoordinates : undefined,
      routeWidth: form.zoneType === "route" ? form.routeWidth || undefined : undefined,
      takeoffPoints: form.takeoffPoints.length ? form.takeoffPoints : undefined,
      landingPoints: form.landingPoints.length ? form.landingPoints : undefined,
      description: form.description || undefined,
      applicantPersonId: form.applicantPersonId || undefined,
      applicantPersonTitle: form.applicantPersonTitle || undefined,
      applicationDate: form.applicationDate || undefined,
      conditions: form.conditions || undefined,
      coordinationContacts: form.coordinationContacts || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <ApplicantSection
        applicantOrg={form.applicantOrg}
        applicantDepartment={form.applicantDepartment}
        applicantAddress={form.applicantAddress}
        applicantPhone={form.applicantPhone}
        applicantEmail={form.applicantEmail}
        insurancePolicyNo={form.insurancePolicyNo}
        equipmentId={form.equipmentId}
        ihaRegistrationNo={form.ihaRegistrationNo}
        ihaClass={form.ihaClass}
        pilotId={form.pilotId}
        pilotLicenseNo={form.pilotLicenseNo}
        equipment={equipment}
        team={team}
        onUpdate={update}
      />

      <FlightInfoSection
        status={form.status as PermissionStatus}
        hsdNumber={form.hsdNumber}
        flightPurpose={form.flightPurpose}
        startDate={form.startDate}
        endDate={form.endDate}
        startTimeUtc={form.startTimeUtc}
        endTimeUtc={form.endTimeUtc}
        altitudeFeet={form.altitudeFeet}
        altitudeMeters={form.altitudeMeters}
        onUpdate={update}
      />

      <ZoneSection
        regionCity={form.regionCity}
        regionDistrict={form.regionDistrict}
        regionArea={form.regionArea}
        zoneType={form.zoneType as FlightZoneType}
        polygonCoordinates={form.polygonCoordinates}
        circleCenter={{ lat: form.circleCenterLat, lng: form.circleCenterLng }}
        circleRadiusNm={form.circleRadiusNm}
        routeCoordinates={form.routeCoordinates}
        routeWidthNm={form.routeWidthNm}
        takeoffPoints={form.takeoffPoints}
        landingPoints={form.landingPoints}
        onUpdate={update}
      />

      <DescriptionSection
        description={form.description}
        applicationDate={form.applicationDate}
        conditions={form.conditions}
        coordinationContacts={form.coordinationContacts}
        notes={form.notes}
        onUpdate={update}
      />

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-[var(--surface)] py-3">
        <Button type="submit" disabled={!form.startDate || !form.endDate}>
          {permission ? "Güncelle" : "Kaydet"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>İptal</Button>
      </div>
    </form>
  );
}
