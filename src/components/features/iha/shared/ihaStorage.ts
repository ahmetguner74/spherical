import { supabase } from "@/lib/supabase";
import type {
  Operation, FlightLog, FlightPermission, Equipment,
  Software, TeamMember, StorageUnit, StorageFolder,
  MaintenanceRecord, AuditEntry, Deliverable, CheckoutEntry,
  OperationLocation, Attachment,
} from "@/types/iha";

// ============================================
// Helpers
// ============================================

function locationToRow(loc: OperationLocation) {
  return {
    location_il: loc.il,
    location_ilce: loc.ilce,
    location_mahalle: loc.mahalle ?? null,
    location_pafta: loc.pafta ?? null,
    location_ada: loc.ada ?? null,
    location_parsel: loc.parsel ?? null,
    location_lat: loc.lat ?? null,
    location_lng: loc.lng ?? null,
    location_alan: loc.alan ?? null,
    location_alan_birimi: loc.alanBirimi ?? "m2",
  };
}

function rowToLocation(row: Record<string, unknown>): OperationLocation {
  return {
    il: (row.location_il as string) ?? "",
    ilce: (row.location_ilce as string) ?? "",
    mahalle: (row.location_mahalle as string) ?? undefined,
    pafta: (row.location_pafta as string) ?? undefined,
    ada: (row.location_ada as string) ?? undefined,
    parsel: (row.location_parsel as string) ?? undefined,
    lat: (row.location_lat as number) ?? undefined,
    lng: (row.location_lng as number) ?? undefined,
    alan: (row.location_alan as number) ?? undefined,
    alanBirimi: (row.location_alan_birimi as string as OperationLocation["alanBirimi"]) ?? undefined,
  };
}

// ============================================
// Operations
// ============================================

export async function fetchOperations(): Promise<Operation[]> {
  const { data, error } = await supabase
    .from("iha_operations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const ops: Operation[] = (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    type: r.type,
    requester: r.requester ?? "",
    status: r.status,
    priority: r.priority,
    location: rowToLocation(r),
    assignedTeam: r.assigned_team ?? [],
    assignedEquipment: r.assigned_equipment ?? [],
    permissionId: r.permission_id ?? undefined,
    dataStoragePath: r.data_storage_path ?? undefined,
    dataSize: r.data_size ?? undefined,
    outputDescription: r.output_description ?? undefined,
    deliverables: [],
    flightLogIds: [],
    completionPercent: r.completion_percent ?? 0,
    startDate: r.start_date ?? undefined,
    endDate: r.end_date ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    createdBy: r.created_by ?? undefined,
  }));

  // Deliverables ayrı tablodan
  for (const op of ops) {
    const { data: dels } = await supabase
      .from("iha_deliverables")
      .select("*")
      .eq("operation_id", op.id);
    op.deliverables = (dels ?? []).map((d) => ({
      id: d.id,
      type: d.type,
      description: d.description,
      deliveryMethod: d.delivery_method,
      deliveredTo: d.delivered_to ?? undefined,
      deliveredAt: d.delivered_at ?? undefined,
      filePath: d.file_path ?? undefined,
    }));
  }

  return ops;
}

export async function upsertOperation(op: Partial<Operation> & { id?: string }) {
  const row = {
    ...(op.id ? { id: op.id } : {}),
    title: op.title,
    description: op.description,
    type: op.type,
    requester: op.requester,
    status: op.status,
    priority: op.priority,
    ...(op.location ? locationToRow(op.location) : {}),
    assigned_team: op.assignedTeam,
    assigned_equipment: op.assignedEquipment,
    permission_id: op.permissionId ?? null,
    data_storage_path: op.dataStoragePath ?? null,
    data_size: op.dataSize ?? null,
    output_description: op.outputDescription ?? null,
    completion_percent: op.completionPercent ?? 0,
    start_date: op.startDate ?? null,
    end_date: op.endDate ?? null,
    notes: op.notes ?? null,
    created_by: op.createdBy ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("iha_operations")
    .upsert(row)
    .select()
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteOperation(id: string) {
  const { error } = await supabase.from("iha_operations").delete().eq("id", id);
  if (error) throw error;
}

// Deliverables
export async function addDeliverable(operationId: string, del: Omit<Deliverable, "id">) {
  const { data, error } = await supabase
    .from("iha_deliverables")
    .insert({
      operation_id: operationId,
      type: del.type,
      description: del.description,
      delivery_method: del.deliveryMethod,
      delivered_to: del.deliveredTo ?? null,
      delivered_at: del.deliveredAt ?? null,
      file_path: del.filePath ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function removeDeliverable(id: string) {
  const { error } = await supabase.from("iha_deliverables").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// Flight Permissions
// ============================================

export async function fetchFlightPermissions(): Promise<FlightPermission[]> {
  const { data, error } = await supabase
    .from("iha_flight_permissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    operationId: r.operation_id ?? undefined,
    hsdNumber: r.hsd_number ?? undefined,
    status: r.status,
    startDate: r.start_date,
    endDate: r.end_date,
    maxAltitude: r.max_altitude ?? undefined,
    zoneType: r.zone_type ?? "polygon",
    polygonCoordinates: r.polygon_coordinates ?? [],
    circleCenter: r.circle_center ?? undefined,
    circleRadius: r.circle_radius ?? undefined,
    conditions: r.conditions ?? undefined,
    coordinationContacts: r.coordination_contacts ?? undefined,
    applicationDate: r.application_date ?? undefined,
    applicationRef: r.application_ref ?? undefined,
    responsiblePerson: r.responsible_person ?? undefined,
    notes: r.notes ?? undefined,
    metadata: r.metadata ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function upsertFlightPermission(fp: Partial<FlightPermission> & { id?: string }) {
  const row = {
    ...(fp.id ? { id: fp.id } : {}),
    operation_id: fp.operationId ?? null,
    hsd_number: fp.hsdNumber ?? null,
    status: fp.status,
    start_date: fp.startDate,
    end_date: fp.endDate,
    max_altitude: fp.maxAltitude ?? null,
    zone_type: fp.zoneType ?? "polygon",
    polygon_coordinates: fp.polygonCoordinates ?? [],
    circle_center: fp.circleCenter ?? null,
    circle_radius: fp.circleRadius ?? null,
    conditions: fp.conditions ?? null,
    coordination_contacts: fp.coordinationContacts ?? null,
    application_date: fp.applicationDate ?? null,
    application_ref: fp.applicationRef ?? null,
    responsible_person: fp.responsiblePerson ?? null,
    notes: fp.notes ?? null,
    metadata: fp.metadata ?? {},
  };
  const { data, error } = await supabase.from("iha_flight_permissions").upsert(row).select().single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteFlightPermission(id: string) {
  const { error } = await supabase.from("iha_flight_permissions").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// Flight Logs
// ============================================

export async function fetchFlightLogs(): Promise<FlightLog[]> {
  const { data, error } = await supabase
    .from("iha_flight_logs")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    operationId: r.operation_id ?? "",
    type: r.type,
    date: r.date,
    startTime: r.start_time ?? undefined,
    endTime: r.end_time ?? undefined,
    duration: r.duration ?? undefined,
    pilotId: r.pilot_id ?? undefined,
    pilotName: r.pilot_name ?? undefined,
    equipmentId: r.equipment_id ?? undefined,
    equipmentName: r.equipment_name ?? undefined,
    altitude: r.altitude ?? undefined,
    gsd: r.gsd ?? undefined,
    overlapForward: r.overlap_forward ?? undefined,
    overlapSide: r.overlap_side ?? undefined,
    photoCount: r.photo_count ?? undefined,
    scanCount: r.scan_count ?? undefined,
    scanDuration: r.scan_duration ?? undefined,
    batteryUsed: r.battery_used ?? undefined,
    totalFlightTime: r.total_flight_time ?? undefined,
    landingCount: r.landing_count ?? undefined,
    gpsBaseStation: r.gps_base_station ?? undefined,
    staticDuration: r.static_duration ?? undefined,
    corsConnection: r.cors_connection ?? undefined,
    ppkStatus: r.ppk_status ?? undefined,
    weather: r.weather ?? undefined,
    windSpeed: r.wind_speed ?? undefined,
    temperature: r.temperature ?? undefined,
    location: rowToLocation(r),
    customFields: r.custom_fields ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function upsertFlightLog(fl: Partial<FlightLog> & { id?: string }) {
  const row = {
    ...(fl.id ? { id: fl.id } : {}),
    operation_id: fl.operationId || null,
    type: fl.type,
    date: fl.date,
    start_time: fl.startTime ?? null,
    end_time: fl.endTime ?? null,
    duration: fl.duration ?? null,
    pilot_id: fl.pilotId ?? null,
    pilot_name: fl.pilotName ?? null,
    equipment_id: fl.equipmentId ?? null,
    equipment_name: fl.equipmentName ?? null,
    altitude: fl.altitude ?? null,
    gsd: fl.gsd ?? null,
    overlap_forward: fl.overlapForward ?? null,
    overlap_side: fl.overlapSide ?? null,
    photo_count: fl.photoCount ?? null,
    scan_count: fl.scanCount ?? null,
    scan_duration: fl.scanDuration ?? null,
    battery_used: fl.batteryUsed ?? null,
    total_flight_time: fl.totalFlightTime ?? null,
    landing_count: fl.landingCount ?? null,
    gps_base_station: fl.gpsBaseStation ?? null,
    static_duration: fl.staticDuration ?? null,
    cors_connection: fl.corsConnection ?? null,
    ppk_status: fl.ppkStatus ?? null,
    weather: fl.weather ?? null,
    wind_speed: fl.windSpeed ?? null,
    temperature: fl.temperature ?? null,
    ...(fl.location ? locationToRow(fl.location) : {}),
    custom_fields: fl.customFields ?? {},
    notes: fl.notes ?? null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("iha_flight_logs").upsert(row).select().single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteFlightLog(id: string) {
  const { error } = await supabase.from("iha_flight_logs").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// Equipment
// ============================================

export async function fetchEquipment(): Promise<Equipment[]> {
  const { data, error } = await supabase.from("iha_equipment").select("*").order("name");
  if (error) throw error;

  const items: Equipment[] = (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    model: r.model ?? "",
    serialNumber: r.serial_number ?? undefined,
    category: r.category,
    status: r.status,
    ownership: r.ownership,
    condition: r.condition ?? undefined,
    currentHolder: r.current_holder ?? undefined,
    purchaseDate: r.purchase_date ?? undefined,
    insuranceExpiry: r.insurance_expiry ?? undefined,
    lastMaintenanceDate: r.last_maintenance_date ?? undefined,
    nextMaintenanceDate: r.next_maintenance_date ?? undefined,
    firmwareVersion: r.firmware_version ?? undefined,
    lastCalibration: r.last_calibration ?? undefined,
    nextCalibration: r.next_calibration ?? undefined,
    notes: r.notes ?? undefined,
    accessories: r.accessories ?? [],
    flightHours: r.flight_hours ?? undefined,
    batteryCount: r.battery_count ?? undefined,
    totalBatteryCycles: r.total_battery_cycles ?? undefined,
    checkoutLog: [],
  }));

  // Checkout logs
  for (const eq of items) {
    const { data: logs } = await supabase
      .from("iha_checkout_log")
      .select("*")
      .eq("equipment_id", eq.id)
      .order("created_at", { ascending: false });
    eq.checkoutLog = (logs ?? []).map((l) => ({
      id: l.id,
      personId: l.person_id,
      personName: l.person_name,
      checkoutDate: l.checkout_date,
      returnDate: l.return_date ?? undefined,
      operationId: l.operation_id ?? undefined,
      notes: l.notes ?? undefined,
    }));
  }

  return items;
}

export async function upsertEquipment(eq: Partial<Equipment> & { id?: string }) {
  const row = {
    ...(eq.id ? { id: eq.id } : {}),
    name: eq.name,
    model: eq.model ?? "",
    serial_number: eq.serialNumber ?? null,
    category: eq.category,
    status: eq.status,
    ownership: eq.ownership,
    condition: eq.condition ?? null,
    current_holder: eq.currentHolder ?? null,
    purchase_date: eq.purchaseDate ?? null,
    insurance_expiry: eq.insuranceExpiry ?? null,
    last_maintenance_date: eq.lastMaintenanceDate ?? null,
    next_maintenance_date: eq.nextMaintenanceDate ?? null,
    firmware_version: eq.firmwareVersion ?? null,
    last_calibration: eq.lastCalibration ?? null,
    next_calibration: eq.nextCalibration ?? null,
    notes: eq.notes ?? null,
    accessories: eq.accessories ?? [],
    flight_hours: eq.flightHours ?? 0,
    battery_count: eq.batteryCount ?? 0,
    total_battery_cycles: eq.totalBatteryCycles ?? 0,
  };
  const { data, error } = await supabase.from("iha_equipment").upsert(row).select().single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteEquipment(id: string) {
  const { error } = await supabase.from("iha_equipment").delete().eq("id", id);
  if (error) throw error;
}

// Checkout
export async function addCheckoutEntry(equipmentId: string, entry: Omit<CheckoutEntry, "id">) {
  const { error } = await supabase.from("iha_checkout_log").insert({
    equipment_id: equipmentId,
    person_id: entry.personId,
    person_name: entry.personName,
    checkout_date: entry.checkoutDate,
    notes: entry.notes ?? null,
  });
  if (error) throw error;
  await supabase.from("iha_equipment").update({
    status: "kullanımda",
    current_holder: entry.personName,
  }).eq("id", equipmentId);
}

export async function returnEquipment(equipmentId: string, entryId: string) {
  await supabase.from("iha_checkout_log").update({
    return_date: new Date().toISOString(),
  }).eq("id", entryId);
  await supabase.from("iha_equipment").update({
    status: "musait",
    current_holder: null,
  }).eq("id", equipmentId);
}

// ============================================
// Software
// ============================================

export async function fetchSoftware(): Promise<Software[]> {
  const { data, error } = await supabase.from("iha_software").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    version: r.version ?? undefined,
    licenseType: r.license_type,
    licenseExpiry: r.license_expiry ?? undefined,
    installedOn: r.installed_on ?? [],
    notes: r.notes ?? undefined,
  }));
}

export async function upsertSoftware(sw: Partial<Software> & { id?: string }) {
  const row = {
    ...(sw.id ? { id: sw.id } : {}),
    name: sw.name,
    version: sw.version ?? null,
    license_type: sw.licenseType,
    license_expiry: sw.licenseExpiry ?? null,
    installed_on: sw.installedOn ?? [],
    notes: sw.notes ?? null,
  };
  const { data, error } = await supabase.from("iha_software").upsert(row).select().single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteSoftware(id: string) {
  const { error } = await supabase.from("iha_software").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// Seed: Varsayılan verileri Supabase'e yükle
// Upsert kullanır — varsa atlar, yoksa ekler
// ============================================

export async function seedEquipment(): Promise<number> {
  const { SEED_EQUIPMENT } = await import("@/config/iha-seed");
  let added = 0;
  for (const eq of SEED_EQUIPMENT) {
    // Name ile kontrol — UUID sorunu olmaz
    const { data } = await supabase
      .from("iha_equipment")
      .select("id")
      .eq("name", eq.name)
      .maybeSingle();
    if (!data) {
      // id'yi çıkar — Supabase UUID üretsin
      const { id: _id, ...rest } = eq;
      await upsertEquipment(rest);
      added++;
    }
  }
  return added;
}

export async function seedSoftware(): Promise<number> {
  const { SEED_SOFTWARE } = await import("@/config/iha-seed");
  let added = 0;
  for (const sw of SEED_SOFTWARE) {
    const { data } = await supabase
      .from("iha_software")
      .select("id")
      .eq("name", sw.name)
      .maybeSingle();
    if (!data) {
      const { id: _id, ...rest } = sw;
      await upsertSoftware(rest);
      added++;
    }
  }
  return added;
}

// ============================================
// Team
// ============================================

export async function fetchTeam(): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("iha_team").select("*").order("name");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role ?? "",
    skills: r.skills ?? [],
    specialties: r.specialties ?? [],
    certifications: r.certifications ?? [],
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
  }));
}

export async function upsertTeamMember(m: Partial<TeamMember> & { id: string }) {
  const row = {
    id: m.id,
    name: m.name,
    role: m.role ?? "",
    skills: m.skills ?? [],
    specialties: m.specialties ?? [],
    certifications: m.certifications ?? [],
    phone: m.phone ?? null,
    email: m.email ?? null,
  };
  const { error } = await supabase.from("iha_team").upsert(row);
  if (error) throw error;
}

// ============================================
// Storage
// ============================================

export async function fetchStorage(): Promise<StorageUnit[]> {
  const { data, error } = await supabase.from("iha_storage").select("*").order("name");
  if (error) throw error;
  const units: StorageUnit[] = (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    totalCapacityTB: r.total_capacity_tb,
    usedCapacityTB: r.used_capacity_tb,
    ip: r.ip ?? undefined,
    mountPath: r.mount_path ?? undefined,
    path: r.path ?? undefined,
    notes: r.notes ?? undefined,
    folders: [],
  }));

  for (const u of units) {
    const { data: folders } = await supabase
      .from("iha_storage_folders")
      .select("*")
      .eq("storage_id", u.id)
      .order("created_at", { ascending: false });
    u.folders = (folders ?? []).map((f) => ({
      id: f.id,
      storageId: f.storage_id,
      path: f.path,
      name: f.name,
      sizeGB: f.size_gb ?? undefined,
      operationId: f.operation_id ?? undefined,
      createdAt: f.created_at,
      description: f.description ?? undefined,
    }));
  }

  return units;
}

export async function updateStorage(id: string, updates: Partial<StorageUnit>) {
  const row: Record<string, unknown> = {};
  if (updates.usedCapacityTB !== undefined) row.used_capacity_tb = updates.usedCapacityTB;
  if (updates.notes !== undefined) row.notes = updates.notes;
  const { error } = await supabase.from("iha_storage").update(row).eq("id", id);
  if (error) throw error;
}

export async function addStorageFolder(storageId: string, folder: Omit<StorageFolder, "id" | "storageId" | "createdAt">) {
  const { error } = await supabase.from("iha_storage_folders").insert({
    storage_id: storageId,
    path: folder.path,
    name: folder.name,
    size_gb: folder.sizeGB ?? null,
    operation_id: folder.operationId ?? null,
    description: folder.description ?? null,
  });
  if (error) throw error;
}

export async function removeStorageFolder(id: string) {
  const { error } = await supabase.from("iha_storage_folders").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// Audit Log
// ============================================

export async function addAuditEntry(entry: Omit<AuditEntry, "id" | "performedAt">) {
  await supabase.from("iha_audit_log").insert({
    action: entry.action,
    target: entry.target,
    target_id: entry.targetId,
    description: entry.description,
    performed_by: entry.performedBy,
  });
}

// ============================================
// Dosya Ekleri (Attachments)
// ============================================

export async function fetchAttachments(parentTable: string, parentId: string): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from("iha_attachments")
    .select("*")
    .eq("parent_table", parentTable)
    .eq("parent_id", parentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    parentTable: r.parent_table,
    parentId: r.parent_id,
    fileName: r.file_name,
    fileUrl: r.file_url,
    fileType: r.file_type ?? undefined,
    fileSize: r.file_size ?? undefined,
    description: r.description ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function uploadAttachment(
  file: File,
  parentTable: string,
  parentId: string,
  description?: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${parentTable}/${parentId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("iha-files")
    .upload(path, file);
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("iha-files")
    .getPublicUrl(path);

  const { data, error } = await supabase.from("iha_attachments").insert({
    parent_table: parentTable,
    parent_id: parentId,
    file_name: file.name,
    file_url: urlData.publicUrl,
    file_type: ext,
    file_size: file.size,
    description: description ?? null,
  }).select().single();
  if (error) throw error;

  return data.id;
}

export async function deleteAttachment(id: string, fileUrl: string) {
  const path = fileUrl.split("/iha-files/")[1];
  if (path) {
    await supabase.storage.from("iha-files").remove([path]);
  }
  await supabase.from("iha_attachments").delete().eq("id", id);
}
