import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// UNIFIED IMPORT PATHS: All components sourced from the central admin folder
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminOverview from "../components/admin/AdminOverview.jsx";
import AdminReports from "./admin/AdminReports.jsx";
import AdminPolice from "./admin/AdminPolice.jsx";
import AdminUsers from "./admin/AdminUsers.jsx";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  const [reportsData, setReportsData] = useState([]);
  const [policeData, setPoliceData] = useState([]);
  const [usersData, setUsersData] = useState([]);

  const token = localStorage.getItem("justiceeye_token");
  const userSession = localStorage.getItem("justiceeye_user");
  const loggedInUser = userSession ? JSON.parse(userSession) : null;

  const syncAdminWorkspace = async () => {
    try {
      const [reportsRes, policeRes, usersRes] = await Promise.all([
        fetch("/api/v1/incidents/all", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/v1/admin/police", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/v1/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [reports, police, users] = await Promise.all([
        reportsRes.json(),
        policeRes.json(),
        usersRes.json()
      ]);

      setReportsData(Array.isArray(reports) ? reports : []);
      setPoliceData(Array.isArray(police) ? police : []);
      setUsersData(Array.isArray(users) ? users : []);
    } catch (err) {
      toast.error("Failed to sync administrative records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // SECURITY GUARD: Using replace: true prevents the "Back" button redirect loop
    if (!token || !loggedInUser || loggedInUser.role !== "admin") {
      toast.error("Unauthorized Access: Administrative privileges required.");
      navigate("/login", { replace: true });
      return;
    }
    syncAdminWorkspace();
  }, [token, navigate]);

  const dashboardCounts = {
    complaints: reportsData.length,
    police: policeData.length,
    users: usersData.length
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex">
      <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 pl-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            </div>
          ) : (
            <>
              {activeView === "overview" && (
                <AdminOverview 
                  counts={dashboardCounts} 
                  setActiveView={setActiveView} 
                  reportsData={reportsData} 
                  usersData={usersData} 
                  policeData={policeData} 
                />
              )}
              {activeView === "reports" && <AdminReports data={reportsData} />}
              {activeView === "police" && <AdminPolice data={policeData} token={token} refresh={syncAdminWorkspace} />}
              {activeView === "users" && <AdminUsers data={usersData} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;