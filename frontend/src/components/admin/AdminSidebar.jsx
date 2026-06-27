import React from "react";

const AdminSidebar = ({ activeView, setActiveView }) => {
  const handleLogout = () => {
    localStorage.removeItem("justiceeye_token");
    localStorage.removeItem("justiceeye_user");
    window.location.href = "/login";
  };

  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: "📊" }, // Added landing view button
    { id: "reports", label: "Incident Ledger", icon: "📁" },
    { id: "police", label: "Police Force Management", icon: "👮" },
    { id: "users", label: "Citizen Directory", icon: "👥" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between fixed left-0 top-0 shadow-lg border-r border-slate-800 z-40">
      <div className="p-5">
        <div className="mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-sm font-black tracking-wider text-blue-400 uppercase">JusticeEye</h2>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Command Operations Center</p>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeView === item.id 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;