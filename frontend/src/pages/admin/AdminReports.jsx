import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import AdminAnalytics from "../../components/admin/AdminAnalytics"; // IMPORT THE CHARTS FROM THE SAME FOLDER

const AdminReports = ({ data }) => {
  const navigate = useNavigate();
  const [showCharts, setShowCharts] = useState(false); // NEW: Controls the analytics toggle state

  const exportToExcel = () => {
    const formatted = data.map(item => ({
      "Tracking ID": item.trackingId,
      "Complaint Title": item.title,
      "Category": item.category,
      "Location": item.location,
      "Filing Date": new Date(item.createdAt).toLocaleDateString(),
      "Status": item.status,
      "Citizen Name": item.userId?.fullName || "N/A",
      "Citizen Email": item.userId?.email || "N/A",
      "Citizen Phone": item.userId?.mobileNumber || "N/A",
      "Assigned Officer": item.assignedOfficer?.fullName || "Unassigned",
      "Officer Badge ID": item.assignedOfficer?.badgeId || "N/A",
      "Officer Sector": item.assignedOfficer?.jurisdiction || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints Ledger");
    XLSX.writeFile(workbook, "JusticeEye_Global_Complaints.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Header Panel Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Incident Matrix Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">Global ledger auditing every system complaint submitted to the national network data nodes.</p>
        </div>
        
        {/* INTERACTIVE CONTROLS CONTAINER */}
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button 
            onClick={() => setShowCharts(!showCharts)} 
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors shadow-2xs cursor-pointer border ${
              showCharts 
                ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-900" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {showCharts ? "📋 View Data Table" : "📊 View Visual Charts"}
          </button>
          
          <button 
            onClick={exportToExcel} 
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            📥 Export to Excel
          </button>
        </div>
      </div>

      {/* RENDER CONDITIONAL SWITCHBOARD MULTIPLEXER */}
      {showCharts ? (
        <AdminAnalytics data={data} /> // Renders our high-fidelity analytics view matching your dataset
      ) : (
        <div className="overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-212.5">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th className="p-4">Tracking ID</th>
                <th className="p-4">Incident Summary</th>
                <th className="p-4">Reporting Citizen</th>
                <th className="p-4">Assigned Officer</th>
                <th className="p-4">Filing Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {data.map(item => (
                <tr key={item._id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-400 text-[10px]">{item.trackingId}</td>
                  <td className="p-4">
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <span className="block font-bold text-slate-900">{item.title}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">📍 {item.location} | {item.category}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/incident/${item._id}`)}
                        className="rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 px-2.5 py-1 text-[10px] font-bold transition-all shadow-3xs whitespace-nowrap cursor-pointer"
                      >
                        View File ↗
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="block font-medium text-slate-900">{item.userId?.fullName || "Deleted User"}</span>
                    <span className="block text-[10px] text-slate-400">{item.userId?.email || "N/A"}</span>
                  </td>
                  <td className="p-4">
                    {item.assignedOfficer ? (
                      <>
                        <span className="block font-bold text-slate-900">⭐ {item.assignedOfficer.fullName}</span>
                        <span className="block font-mono text-[10px] text-blue-600 mt-0.5">{item.assignedOfficer.badgeId}</span>
                      </>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100/60 italic">
                        ⚠️ Auto-Dispatch Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      item.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      item.status === "Under Investigation" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      item.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-100" :
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium bg-white">No complaints logged inside our file data streams.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReports;