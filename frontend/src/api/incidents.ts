import { apiClient } from "./client";

export type Severity = "SEV1" | "SEV2" | "SEV3" | "SEV4";
export type Status = "OPEN" | "MITIGATED" | "RESOLVED";

export interface Incident {
  id: number;
  title: string;
  service: string;
  severity: Severity;
  status: Status;
  owner: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentListResponse {
  items: Incident[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ListIncidentsParams {
  limit?: number;
  cursor?: string | null;
  search?: string;
  severity?: Severity | "";
  status?: Status | "";
  service?: string;
}

export async function listIncidents(params: ListIncidentsParams): Promise<IncidentListResponse> {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.search) query.set("search", params.search);
  if (params.severity) query.set("severity", params.severity);
  if (params.status) query.set("status", params.status);
  if (params.service) query.set("service", params.service);

  const qs = query.toString();
  const url = `/api/incidents${qs ? `?${qs}` : ""}`;
  return apiClient.get<IncidentListResponse>(url);
}

export async function getIncident(id: number): Promise<Incident> {
  return apiClient.get<Incident>(`/api/incidents/${id}`);
}

export interface CreateIncidentPayload {
  title: string;
  service: string;
  severity: Severity;
  status?: Status;
  owner?: string | null;
  summary?: string | null;
}

export async function createIncident(payload: CreateIncidentPayload): Promise<Incident> {
  return apiClient.post<Incident>("/api/incidents", payload);
}

export interface UpdateIncidentPayload {
  title?: string;
  service?: string;
  severity?: Severity;
  status?: Status;
  owner?: string | null;
  summary?: string | null;
}

export async function updateIncident(id: number, payload: UpdateIncidentPayload): Promise<Incident> {
  return apiClient.patch<Incident>(`/api/incidents/${id}`, payload);
}

