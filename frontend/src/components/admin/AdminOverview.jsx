import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const AdminOverview = ({ counts, setActiveView, reportsData = [], usersData = [], policeData = [] }) => {
  
  // 1. DATA WRANGLING: Process status distribution for the summary dial
  const statusCounts = reportsData.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const statusPieData = [
    { name: "Pending", value: statusCounts["Pending"] || 0, color: "#f59e0b" },
    { name: "Under Investigation", value: statusCounts["Under Investigation"] || 0, color: "#3b82f6" },
    { name: "Resolved", value: statusCounts["Resolved"] || 0, color: "#10b981" },
    { name: "Rejected", value: statusCounts["Rejected"] || 0, color: "#ef4444" },
  ].filter(item => item.value > 0);

  // 2. DATA WRANGLING: Process crime categorization density
  const categoryCounts = reportsData.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryCounts).map(key => ({
    name: key,
    "Incidents": categoryCounts[key]
  })).slice(0, 5); // Smooth layout management

  // 3. CALCULATE MATHEMATICAL METRICS
  const activeCases = (statusCounts["Pending"] || 0) + (statusCounts["Under Investigation"] || 0);
  const successRate = counts.complaints > 0 ? (((statusCounts["Resolved"] || 0) / counts.complaints) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Title Banner */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Administrative Intelligence Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time nationwide telemetry, emergency dispatch registries, and verification audits.</p>
      </div>

      {/* Primary Metrics Interactive Summary Matrix Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Incidents */}
        <div 
          onClick={() => setActiveView("reports")} 
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Complaints</span>
            <span className="text-xl group-hover:scale-110 transition-transform">📋</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{counts.complaints}</p>
          <span className="text-[10px] text-blue-600 font-medium block mt-1">View dynamic case table →</span>
        </div>

        {/* Card 2: Active Load Balance Queue */}
        <div 
          onClick={() => setActiveView("reports")} 
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Backlog</span>
            <span className="text-xl group-hover:scale-110 transition-transform">⚡</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 font-mono">{activeCases}</p>
          <span className="text-[10px] text-slate-400 block mt-1">Unresolved desk queue files</span>
        </div>

        {/* Card 3: Registered Officers */}
        <div 
          onClick={() => setActiveView("police")} 
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Officers</span>
            <span className="text-xl group-hover:scale-110 transition-transform">🛡️</span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{counts.police}</p>
          <span className="text-[10px] text-purple-600 font-medium block mt-1">Manage task forces →</span>
        </div>

        {/* Card 4: Registered Citizen Base */}
        <div 
          onClick={() => setActiveView("users")} 
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Citizens</span>
            <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2 font-mono">{counts.users}</p>
          <span className="text-[10px] text-slate-400 block mt-1">System global user registry</span>
        </div>

      </div>

      {/* Secondary Row Graphic Telemetry Visualizer Core Blocks */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Panel A: Incident Densities Distribution (Bar Visualizer) */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Classification Concentration Density</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Top primary classifications currently reported to network servers</p>
          </div>
          <div className="h-60 mt-4 text-[10px] font-semibold">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="Incidents" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic font-normal">No database files captured yet.</div>
            )}
          </div>
        </div>

        {/* Panel B: Resolution Lifecycles Pie Ring Wheel Diagram */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Case Status Proportions</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Overall execution state velocity breakdown: <span className="font-bold text-emerald-600 font-mono">{successRate}% Closed</span></p>
          </div>
          
          <div className="h-40 flex items-center justify-center mt-2">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={4} dataKey="value">
                    {statusPieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 italic text-[11px] font-normal">Empty data pool.</div>
            )}
          </div>

          <div className="space-y-1.5 text-[10px] mt-2">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-1 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-600">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 bg-white px-1.5 border rounded shadow-3xs">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminOverview;