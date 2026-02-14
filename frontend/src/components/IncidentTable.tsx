import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import type { Incident } from "../api/incidents";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";

interface Props {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
}

export function IncidentTable({ incidents, loading, error }: Props) {
  const navigate = useNavigate();

  const content = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={7} style={{ textAlign: "center", padding: 16 }}>
            Loading incidents...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={7} style={{ color: "red", padding: 16 }}>
            {error}
          </td>
        </tr>
      );
    }

    if (incidents.length === 0) {
      return (
        <tr>
          <td colSpan={7} style={{ padding: 16 }}>
            No incidents match the current filters.
          </td>
        </tr>
      );
    }

    return incidents.map(incident => (
      <tr
        key={incident.id}
        onClick={() => navigate(`/incidents/${incident.id}`)}
        style={{ cursor: "pointer" }}
      >
        <td>{incident.title}</td>
        <td>{incident.service}</td>
        <td>
          <SeverityBadge severity={incident.severity} />
        </td>
        <td>
          <StatusBadge status={incident.status} />
        </td>
        <td>{incident.owner ?? "-"}</td>
        <td>{new Date(incident.created_at).toLocaleString()}</td>
        <td>{new Date(incident.updated_at).toLocaleString()}</td>
      </tr>
    ));
  }, [incidents, loading, error, navigate]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Service</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Created</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>{content}</tbody>
      </table>
    </div>
  );
}

