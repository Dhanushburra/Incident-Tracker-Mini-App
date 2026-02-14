import type { Severity } from "../api/incidents";

interface Props {
  severity: Severity;
}

const severityColors: Record<Severity, string> = {
  SEV1: "#b91c1c",
  SEV2: "#ea580c",
  SEV3: "#ca8a04",
  SEV4: "#15803d"
};

export function SeverityBadge({ severity }: Props) {
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 600,
        color: "white",
        backgroundColor: severityColors[severity]
      }}
    >
      {severity}
    </span>
  );
}

