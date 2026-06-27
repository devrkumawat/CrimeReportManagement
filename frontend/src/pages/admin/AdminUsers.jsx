import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminUsers = ({ data }) => {
  const [showCharts, setShowCharts] = useState(false); // Controls the user analytics viewport layout state

  const exportToExcel = () => {
    const formatted = data.map(user => ({
      "Citizen Identity": user.fullName,
      "Email Address": user.email,
      "Verification Status": user.isEmailVerified ? "Verified profile" : "Unverified profile", // NEW: Injected into Excel sheet array
      "Mobile Contact Link": user.mobileNumber || "N/A",
      "Profile Creation Date": new Date(user.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Citizen Directory");
    XLSX.writeFile(workbook, "JusticeEye_Citizen_Database.xlsx");
  };

  // 1. ANALYTICS PARSING: Group registration growth timeline by month/year dates
  const growthTimeline = data.reduce((acc, user) => {
    const month = new Date(user.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const growthData = Object.keys(growthTimeline).map(key => ({
    period: key,
    "Registered Citizens": growthTimeline[key]
  }));

  // 2. ANALYTICS PARSING: Count verification setup status balances (NEW)
  const verifiedCount = data.filter(user => user.isEmailVerified).length;
  const unverifiedCount = data.length - verifiedCount;
  
  const verificationData = [
    { name: "🛡️ Verified Profiles", value: verifiedCount, color: "#10b981" }, // Emerald 500
    { name: "⚠️ Unverified Mail", value: unverifiedCount, color: "#f43f5e" }   // Rose 500
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Citizen Profile Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">Directory listing of all citizens registered to file reports within the national justice logging application layers.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button 
            onClick={() => setShowCharts(!showCharts)} 
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors shadow-2xs cursor-pointer border ${
              showCharts 
                ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-900" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {showCharts ? "📋 View Data Table" : "📊 View Registry Analytics"}
          </button>
          
          <button onClick={exportToExcel} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors self-start sm:self-auto cursor-pointer">
            📥 Export Citizens to Excel
          </button>
        </div>
      </div>

      {/* RENDER SWITCHBOARD OVERLAY */}
      {showCharts ? (
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Timeline Linear Registry Velocity Growth Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs md:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Onboarding Velocity Timeline</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Historical overview tracing citizen database enrollment volumes</p>
            </div>
            <div className="h-60 mt-4 text-[10px] font-medium">
              {growthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="period" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Registered Citizens" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic">Insufficient metadata metrics.</div>
              )}
            </div>
          </div>

          {/* NEW: Verification Profile Clearance Density Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Security Cleared Volume</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Ratio breakdown of identity-verified user segments</p>
            </div>
            <div className="h-44 mt-2">
              {verificationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={verificationData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                      {verificationData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic">No variables found.</div>
              )}
            </div>
            <div className="space-y-1.5 text-[10px] mt-2">
              {verificationData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 bg-white px-1.5 border rounded">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Data Log Matrix Table Grid Row Blocks View */
        <div className="overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-187.5">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th className="p-4">Citizen Identity</th>
                <th className="p-4">Digital Mail Address</th>
                <th className="p-4">Clearance Status</th> {/* NEW: Added table column header segment */}
                <th className="p-4">Registered Contact</th>
                <th className="p-4 text-right">Account Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {data.map(user => (
                <tr key={user._id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900">👤 {user.fullName}</td>
                  <td className="p-4 font-mono text-slate-600">{user.email}</td>
                  
                  {/* NEW: Verification dynamic indicator pill flags */}
                  <td className="p-4">
                    {user.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black px-2 py-0.5 shadow-3xs">
                        🛡️ Verified Profile
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-black px-2 py-0.5">
                        ⚠️ Unverified Mail
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-slate-600">{user.mobileNumber || "Not Linked"}</td>
                  <td className="p-4 text-right text-slate-400 font-medium">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-medium bg-white">No active citizen profile accounts tracked in database nodes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;