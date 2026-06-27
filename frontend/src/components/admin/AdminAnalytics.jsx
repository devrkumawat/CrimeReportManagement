import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminAnalytics = ({ data }) => {
  // 1. DATA PARSING CORE: Aggregate category densities
  const categoryCounts = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryCounts).map((key) => ({
    name: key,
    value: categoryCounts[key],
  }));

  // 2. DATA PARSING CORE: Aggregate status volumes
  const statusCounts = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: "Pending", value: statusCounts["Pending"] || 0, color: "#f59e0b" },
    { name: "Under Investigation", value: statusCounts["Under Investigation"] || 0, color: "#3b82f6" },
    { name: "Resolved", value: statusCounts["Resolved"] || 0, color: "#10b981" },
    { name: "Rejected", value: statusCounts["Rejected"] || 0, color: "#ef4444" },
  ].filter(item => item.value > 0); // Only render flags currently present in state

  // 3. DATA PARSING CORE: Extract workloads per assigned officer
  const officerWorkloads = data.reduce((acc, item) => {
    if (item.assignedOfficer) {
      const name = item.assignedOfficer.fullName;
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, {});

  const officerData = Object.keys(officerWorkloads).map((key) => ({
    officer: key,
    "Active Cases": officerWorkloads[key],
  })).slice(0, 5); // Limit chart display to top 5 backlogs for view optimization

  // Color palette assignment matrix definitions
  const CLUSTER_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#059669", "#ea580c", "#475569"];

  // Mathematical Calculation Blocks
  const totalComplaints = data.length;
  const resolvedCount = statusCounts["Resolved"] || 0;
  const resolutionRate = totalComplaints > 0 ? ((resolvedCount / totalComplaints) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      
      {/* Dynamic Telemetry Scoreboard Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Filed Complaints</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalComplaints}</p>
          <span className="text-[10px] text-slate-400 block mt-0.5">Global system ledger count</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Case Backlog Queue</p>
          <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {(statusCounts["Pending"] || 0) + (statusCounts["Under Investigation"] || 0)}
          </p>
          <span className="text-[10px] text-amber-500/80 block mt-0.5">Unresolved active desk load</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolution Velocity</p>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{resolutionRate}%</p>
          <span className="text-[10px] text-emerald-500 block mt-0.5">Overall file closure rate</span>
        </div>
      </div>

      {/* Visual Analytics Chart Viewport Grid Panels */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Panel 1: Crime Classification Mix */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Crime Density Distribution</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Volume breakdown matching specific crime classifications</p>
          </div>
          <div className="h-64 mt-4 text-[10px] font-medium">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" name="Complaints" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">Insufficient metrics to plot array lines.</div>
            )}
          </div>
        </div>

        {/* Panel 2: Case Lifecycle Status Mix */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Resolution Lifecycle Status</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Proportional audit allocation states mapping files</p>
          </div>
          <div className="h-64 mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-[10px]">
            {statusData.length > 0 ? (
              <>
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-2">
                  {statusData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-50 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 border rounded shadow-3xs">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-slate-400 italic">Insufficient metrics to plot lifecycle curves.</div>
            )}
          </div>
        </div>

        {/* Panel 3: Officer Workloads Load Balancing Monitor */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Officer Workload Allocation Core</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Monitoring system allocation balances across active officers</p>
          </div>
          <div className="h-60 mt-4 text-[10px] font-medium">
            {officerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officerData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={true} horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                  <YAxis type="category" dataKey="officer" stroke="#94a3b8" width={90} />
                  <Tooltip />
                  <Bar dataKey="Active Cases" fill="#7c3aed" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">No assigned officers tracked inside current dataset parameters.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;