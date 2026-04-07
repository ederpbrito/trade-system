import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, RequireAuth } from "../domains/identity";
import { CockpitPage } from "../domains/cockpit/ui/CockpitPage";
import { ExperimentsPage } from "../domains/experiments/ui/ExperimentsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cockpit" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/cockpit"
        element={
          <RequireAuth>
            <CockpitPage />
          </RequireAuth>
        }
      />
      <Route
        path="/experiments"
        element={
          <RequireAuth>
            <ExperimentsPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/cockpit" replace />} />
    </Routes>
  );
}
