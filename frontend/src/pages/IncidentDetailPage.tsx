import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getIncident, updateIncident, type Incident, type Status } from "../api/incidents";
import { SeverityBadge } from "../components/SeverityBadge";
import { StatusBadge } from "../components/StatusBadge";

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const incidentId = Number(id);

  const { data, isLoading, isError, error } = useQuery<Incident>({
    queryKey: ["incident", incidentId],
    queryFn: () => getIncident(incidentId),
    enabled: !Number.isNaN(incidentId)
  });

  const [status, setStatus] = useState<Status | "">("");
  const [owner, setOwner] = useState("");
  const [summary, setSummary] = useState("");

  const mutation = useMutation({
    mutationFn: (payload: { status?: Status; owner?: string; summary?: string }) =>
      updateIncident(incidentId, payload),
    onSuccess: updated => {
      queryClient.setQueryData(["incident", incidentId], updated);
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    }
  });

  if (Number.isNaN(incidentId)) {
    return <div>Invalid incident id.</div>;
  }

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading incident…</div>;
  }

  if (isError || !data) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "red" }}>{(error as Error)?.message ?? "Failed to load incident"}</p>
        <button onClick={() => navigate("/incidents")}>Back to list</button>
      </div>
    );
  }

  const effectiveStatus = status || data.status;
  const effectiveOwner = owner || data.owner || "";
  const effectiveSummary = summary || data.summary || "";

  const handleSave = () => {
    const payload: { status?: Status; owner?: string; summary?: string } = {};
    if (status && status !== data.status) payload.status = status;
    if (owner !== (data.owner || "")) payload.owner = owner;
    if (summary !== (data.summary || "")) payload.summary = summary;
    if (Object.keys(payload).length === 0) return;
    mutation.mutate(payload);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <button onClick={() => navigate("/incidents")} style={{ marginBottom: 16 }}>
        ← Back to list
      </button>

      <h1 style={{ marginBottom: 8 }}>{data.title}</h1>
      <p style={{ marginBottom: 4 }}>
        <strong>Service:</strong> {data.service}
      </p>
      <p style={{ marginBottom: 4 }}>
        <strong>Severity:</strong> <SeverityBadge severity={data.severity} />
      </p>
      <p style={{ marginBottom: 4 }}>
        <strong>Status:</strong> <StatusBadge status={effectiveStatus} />
      </p>

      <p style={{ marginBottom: 4 }}>
        <strong>Created:</strong> {new Date(data.created_at).toLocaleString()}
      </p>
      <p style={{ marginBottom: 16 }}>
        <strong>Updated:</strong> {new Date(data.updated_at).toLocaleString()}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Status
          <select
            value={effectiveStatus}
            onChange={e => setStatus(e.target.value as Status)}
            style={{ marginLeft: 8 }}
          >
            <option value="OPEN">OPEN</option>
            <option value="MITIGATED">MITIGATED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </label>

        <label>
          Owner
          <input
            type="text"
            value={effectiveOwner}
            onChange={e => setOwner(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 6 }}
          />
        </label>

        <label>
          Summary
          <textarea
            value={effectiveSummary}
            onChange={e => setSummary(e.target.value)}
            rows={6}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 6 }}
          />
        </label>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={mutation.isLoading}>
          {mutation.isLoading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

