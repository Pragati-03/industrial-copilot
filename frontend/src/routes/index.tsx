import { Routes, Route } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { Dashboard } from "@/pages/Dashboard";
import { Documents } from "@/pages/Documents";
import { KnowledgeGraph } from "@/pages/KnowledgeGraph";
import { Copilot } from "@/pages/Copilot";
import { Maintenance } from "@/pages/Maintenance";
import { Compliance } from "@/pages/Compliance";
import { NotFound } from "@/pages/NotFound";
import { Analytics } from "@/pages/Analytics";

/**
 * All application routes are declared here in one place.
 * `AppShell` provides the persistent sidebar/topbar layout for every
 * route nested under it.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="documents" element={<Documents />} />
        <Route path="knowledge-graph" element={<KnowledgeGraph />} />
        <Route path="copilot" element={<Copilot />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}