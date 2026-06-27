import React, { useEffect } from "react"; // 1. Ensure useEffect is imported
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  const location = useLocation();
  
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.slice(1);
      const element = document.getElementById(targetId);
      
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  const userSession = localStorage.getItem("justiceeye_user");
  const user = userSession ? JSON.parse(userSession) : null;
  const isAdmin = user?.role === "admin";
  const isPolice = user?.role === "police";

  const isDashboardRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/police") || location.pathname.startsWith("/officer");
  const isStaffIncidentView = location.pathname.startsWith("/incident/") && (isAdmin || isPolice);
  const hideLayout = isDashboardRoute || isStaffIncidentView;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {!hideLayout && <Navbar />}
      <div className="grow flex flex-col w-full">
        <AppRoutes />
      </div>
      {!hideLayout && <Footer />}
      
      <ScrollToTop />
    </div>
  );
};

export default App;