import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createIncident,
  type CreateIncidentPayload,
  type Incident,
  type Severity,
  type Status
} from "../api/incidents";

const severities: Severity[] = ["SEV1", "SEV2", "SEV3", "SEV4"];
const statuses: Status[] = ["OPEN", "MITIGATED", "RESOLVED"];

export function CreateIncidentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [service, setService] = useState("");
  const [severity, setSeverity] = useState<Severity>("SEV3");
  const [status, setStatus] = useState<Status>("OPEN");
  const [owner, setOwner] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: CreateIncidentPayload) => createIncident(payload),
    onSuccess: (incident: Incident) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      navigate(`/incidents/${incident.id}`);
    },
    onError: err => {
      setError((err as Error).message);
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !service.trim()) {
      setError("Title and service are required.");
      return;
    }
    mutation.mutate({
      title: title.trim(),
      service: service.trim(),
      severity,
      status,
      owner: owner.trim() || undefined,
      summary: summary.trim() || undefined
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <button onClick={() => navigate("/incidents")} style={{ marginBottom: 16 }}>
        ← Back to list
      </button>

      <h1 style={{ marginBottom: 16 }}>Create Incident</h1>

      {error && (
        <p style={{ color: "red", marginBottom: 12 }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Title *
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 6 }}
          />
        </label>

        <label>
          Service *
          <input
            type="text"
            value={service}
            onChange={e => setService(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 6 }}
          />
        </label>

        <label>
          Severity
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value as Severity)}
            style={{ display: "block", marginTop: 4 }}
          >
            {severities.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Status)}
            style={{ display: "block", marginTop: 4 }}
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Owner
          <input
            type="text"
            value={owner}
            onChange={e => setOwner(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 6 }}
          />
        </label>

        <label>
          Summary
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={6}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 6 }}
          />
        </label>

        <button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? "Creating..." : "Create incident"}
        </button>
      </form>
    </div>
  );
}

