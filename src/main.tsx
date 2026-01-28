import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./app/App.tsx";
import AdminLogin from "./app/pages/admin/Login.tsx";
import AdminDashboard from "./app/pages/admin/Dashboard.tsx";
import { AuthProvider } from "./app/contexts/AuthContext.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
  