import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./app/App.tsx";
import StartProject from "./app/pages/StartProject.tsx";
import AdminLogin from "./app/pages/admin/Login.tsx";
import AdminDashboard from "./app/pages/admin/Dashboard.tsx";
import { AuthProvider } from "./app/contexts/AuthContext.tsx";
import { AnalyticsProvider } from "./app/components/AnalyticsProvider.tsx";
import { Toaster } from "./app/components/ui/sonner.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <AnalyticsProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/start-project" element={<StartProject />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </AnalyticsProvider>
    </AuthProvider>
  </BrowserRouter>
);
  