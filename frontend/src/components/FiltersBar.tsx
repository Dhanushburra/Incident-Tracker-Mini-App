import { useEffect, useState } from "react";

import type { Severity, Status } from "../api/incidents";

interface Props {
  search: string;
  severity: Severity | "";
  status: Status | "";
  service: string;
  limit: number;
  onChange: (next: {
    search: string;
    severity: Severity | "";
    status: Status | "";
    service: string;
    limit: number;
  }) => void;
}

export function FiltersBar(props: Props) {
  const [searchInput, setSearchInput] = useState(props.search);

  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput !== props.search) {
        props.onChange({
          search: searchInput,
          severity: props.severity,
          status: props.status,
          service: props.service,
          limit: props.limit
        });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput, props]);

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
      <input
        type="text"
        placeholder="Search by title, summary, service..."
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        style={{ flex: 1, minWidth: 200, padding: 6 }}
      />
      <select
        value={props.severity}
        onChange={e =>
          props.onChange({
            ...props,
            search: searchInput,
            severity: (e.target.value || "") as Severity | ""
          })
        }
      >
        <option value="">All severities</option>
        <option value="SEV1">SEV1</option>
        <option value="SEV2">SEV2</option>
        <option value="SEV3">SEV3</option>
        <option value="SEV4">SEV4</option>
      </select>
      <select
        value={props.status}
        onChange={e =>
          props.onChange({
            ...props,
            search: searchInput,
            status: (e.target.value || "") as Status | ""
          })
        }
      >
        <option value="">All statuses</option>
        <option value="OPEN">OPEN</option>
        <option value="MITIGATED">MITIGATED</option>
        <option value="RESOLVED">RESOLVED</option>
      </select>
      <input
        type="text"
        placeholder="Service"
        value={props.service}
        onChange={e =>
          props.onChange({
            ...props,
            search: searchInput,
            service: e.target.value
          })
        }
        style={{ width: 150, padding: 6 }}
      />
      <select
        value={props.limit}
        onChange={e =>
          props.onChange({
            ...props,
            search: searchInput,
            limit: Number(e.target.value)
          })
        }
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  );
}

