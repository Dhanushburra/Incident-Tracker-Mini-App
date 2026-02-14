import { Route, Routes, Navigate } from "react-router-dom";

import { IncidentListPage } from "./pages/IncidentListPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { CreateIncidentPage } from "./pages/CreateIncidentPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/incidents" replace />} />
      <Route path="/incidents" element={<IncidentListPage />} />
      <Route path="/incidents/new" element={<CreateIncidentPage />} />
      <Route path="/incidents/:id" element={<IncidentDetailPage />} />
    </Routes>
  );
}

