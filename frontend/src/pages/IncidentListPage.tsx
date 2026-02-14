import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import {
  listIncidents,
  type Incident,
  type Severity,
  type Status
} from "../api/incidents";
import { FiltersBar } from "../components/FiltersBar";
import { IncidentTable } from "../components/IncidentTable";

const DEFAULT_LIMIT = 20;

export function IncidentListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  // Parse params
  const limit = Number(searchParams.get("limit") || DEFAULT_LIMIT);
  const cursor = searchParams.get("cursor") || undefined;
  const search = searchParams.get("search") || "";
  const severity = (searchParams.get("severity") || "") as Severity | "";
  const status = (searchParams.get("status") || "") as Status | "";
  const service = searchParams.get("service") || "";

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<{
    items: Incident[];
    nextCursor: string | null;
    hasMore: boolean;
  }>({
    queryKey: ["incidents", { limit, cursor, search, severity, status, service }],
    queryFn: () =>
      listIncidents({
        limit,
        cursor,
        search: search || undefined,
        severity: severity || undefined,
        status: status || undefined,
        service: service || undefined
      }),
    placeholderData: keepPreviousData // Replaces keepPreviousData: true in v5
  });

  const loading = isLoading || isFetching;
  const errorMessage = isError ? (error as Error).message : null;

  // Shared helper to update URL without losing existing unrelated params
  const updateParams = (updates: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });
    setSearchParams(nextParams);
  };

  const handleFilterChange = (next: {
    search: string;
    severity: Severity | "";
    status: Status | "";
    service: string;
    limit: number;
  }) => {
    setCursorHistory([]); // Reset pagination on filter change
    updateParams({
      search: next.search,
      severity: next.severity,
      status: next.status,
      service: next.service,
      limit: next.limit !== DEFAULT_LIMIT ? String(next.limit) : undefined,
      cursor: undefined // Clear cursor when filters change
    });
  };

  const handleNext = () => {
    if (!data?.nextCursor) return;
    setCursorHistory((prev) => [...prev, cursor ?? ""]);
    updateParams({ cursor: data.nextCursor });
  };

  const handlePrevious = () => {
    if (cursorHistory.length === 0) return;
    const newHistory = [...cursorHistory];
    const previousCursor = newHistory.pop();
    setCursorHistory(newHistory);
    updateParams({ cursor: previousCursor || undefined });
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }}
      >
        <h1>Incidents</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => refetch()}>Refresh</button>
          <Link to="/incidents/new">
            <button>Create incident</button>
          </Link>
        </div>
      </header>

      <FiltersBar
        search={search}
        severity={severity}
        status={status}
        service={service}
        limit={limit}
        onChange={handleFilterChange}
      />

      <IncidentTable
        incidents={data?.items ?? []}
        loading={loading}
        error={errorMessage}
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button 
          onClick={handlePrevious} 
          disabled={cursorHistory.length === 0 || loading}
        >
          Previous
        </button>
        <span>
          Sorted by newest; showing {data?.items.length ?? 0} incidents
        </span>
        <button
          onClick={handleNext}
          disabled={!data?.hasMore || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}