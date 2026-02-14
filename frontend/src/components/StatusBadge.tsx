import type { Status } from "../api/incidents";

interface Props {
  status: Status;
}

const statusColors: Record<Status, string> = {
  OPEN: "#b91c1c",
  MITIGATED: "#0369a1",
  RESOLVED: "#15803d"
};

export function StatusBadge({ status }: Props) {
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        color: "white",
        backgroundColor: statusColors[status]
      }}
    >
      {status}
    </span>
  );
}

