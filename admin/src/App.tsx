import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Cursor } from "./components/Cursor";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminOverview } from "./pages/AdminOverview";
import { ShipmentsManager } from "./pages/ShipmentsManager";
import { DisruptionsManager } from "./pages/DisruptionsManager";
import { EmissionFactorsManager } from "./pages/EmissionFactorsManager";
import { AuditLogsPage } from "./pages/AuditLogsPage";

function AdminContent() {
  const location = useLocation();

  return (
    <div className="admin-app-root">
      <Cursor />
      <AdminHeader />
      <div className="admin-layout-container">
        <AdminSidebar />
        <main className="admin-workspace">
          <div key={location.pathname} className="admin-genie-transition">
            <Routes>
              <Route path="/" element={<AdminOverview />} />
              <Route path="/shipments" element={<ShipmentsManager />} />
              <Route path="/disruptions" element={<DisruptionsManager />} />
              <Route path="/emission-factors" element={<EmissionFactorsManager />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="*" element={<AdminOverview />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AdminContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
