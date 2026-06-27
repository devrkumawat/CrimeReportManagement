import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Report from "../pages/Report";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import Home from "../pages/Home";
import IncidentDetails from "../pages/IncidentDetails";
import OfficerDashboard from "../pages/OfficerDashboard"; // <-- 1. Import your new workspace

/**
 * PUBLIC ROUTE GUARD
 * Prevents logged-in users from accessing the Login/Register pages.
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("justiceeye_token");
  const user = JSON.parse(localStorage.getItem("justiceeye_user"));

  if (token && user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "police") return <Navigate to="/officer/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Home Channel */}
      <Route path="/" element={<Home />} />
      
      {/* Guarded Auth Channels */}
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />
      
      {/* Citizen Portals */}
      <Route path="/report" element={<Report />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Administrative Headquarters Viewport */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Police / Officer Workspace Node */}
      {/* 3. Registered route footprint so the application can resolve this path */}
      <Route path="/officer/dashboard" element={<OfficerDashboard />} />

      {/* Incident Details Node */}
      <Route path="/incident/:id" element={<IncidentDetails />} />
      
      {/* Catch-all for undefined routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;