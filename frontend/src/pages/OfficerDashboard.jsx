import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import EvidenceViewer from "../components/EvidenceViewer.jsx";

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [assignedCases, setAssignedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [officerName, setOfficerName] = useState("");
  const [metrics, setMetrics] = useState({ pending: 0, investigating: 0, resolved: 0 });

  // Inspection Drawer Core States
  const [selectedCase, setSelectedCase] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [finalStatement, setFinalStatement] = useState("");
  const [finalReport, setFinalReport] = useState(null);

  const fetchOfficerCases = async () => {
    try {
      const token = localStorage.getItem("justiceeye_token");
      const response = await fetch("/api/v1/incidents/my-assignments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setAssignedCases(data.incidents || []);
        calculateMetrics(data.incidents || []);
      }
    } catch (err) {
      console.error("Error loading assigned cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (cases) => {
    const counts = cases.reduce(
      (acc, curr) => {
        if (curr.status === "Pending") acc.pending++;
        if (curr.status === "Under Investigation") acc.investigating++;
        if (curr.status === "Resolved") acc.resolved++;
        return acc;
      },
      { pending: 0, investigating: 0, resolved: 0 }
    );
    setMetrics(counts);
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("justiceeye_user"));
    if (!userData || userData.role !== "police") {
      navigate("/login");
      return;
    }
    setOfficerName(userData.fullName || "Officer");
    fetchOfficerCases();
  }, [navigate]);

  const exportToExcel = () => {
    if (assignedCases.length === 0) return;

    // 1. Define explicit row column headers
    const headers = [
      "Tracking ID",
      "Incident Title",
      "Category",
      "Current Status",
      "Complainant Name",
      "Complainant Email",
      "Complainant Mobile",
      "Location Coordinates",
      "Occurrence Date",
      "Concluding Remarks / Action Statement"
    ];

    // 2. Map dataset rows (SheetJS natively safely handles text commas and string encoding!)
    const rows = assignedCases.map((incident) => [
      incident.trackingId || "N/A",
      incident.title || "",
      incident.category || "N/A",
      incident.status || "N/A",
      incident.userId?.fullName || "Anonymous / Tipster",
      incident.userId?.email || "N/A",
      incident.userId?.mobileNumber || "N/A",
      incident.location || "",
      incident.date ? new Date(incident.date).toLocaleDateString() : "N/A",
      incident.finalStatement || ""
    ]);

    // 3. Assemble clean structural sheet objects
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    
    // 4. Mount sheet into your workbook frame
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assigned Ledger Files");

    // 5. Fire direct binary file transmission download request to client stream
    XLSX.writeFile(workbook, `JusticeEye_Assigned_Cases_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleOpenCase = (incident) => {
    setSelectedCase(incident);
    setFormStatus(incident.status);
    setFinalStatement(incident.finalStatement || "");
    setFinalReport(null);
  };

  const handleUpdateCase = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    const formData = new FormData();
    formData.append("status", formStatus);
    formData.append("finalStatement", finalStatement);
    if (finalReport) {
      formData.append("finalReport", finalReport);
    }

    try {
      const token = localStorage.getItem("justiceeye_token");
      const response = await fetch(`/api/v1/incidents/resolve/${selectedCase._id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setSelectedCase(null);
        fetchOfficerCases();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to save data modifications.");
      }
    } catch (err) {
      console.error("System connection error:", err);
      alert("Communication failure with main network server.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("justiceeye_token");
    localStorage.removeItem("justiceeye_user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative">
      {/* Top Banner Navbar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">🛡️</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">JusticeEye Officer Workspace</h1>
            <p className="text-[10px] text-slate-400">Station Identity Desk: {officerName}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-200 border border-slate-700 hover:border-red-900 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all">
          Log Out
        </button>
      </header>

      {/* Main Metric & Ledger Container */}
      <main className="flex-1 mx-auto max-w-screen-2xl w-full p-4 md:p-8 space-y-6">
        
        {/* Metrics Rows */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Actions</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-slate-900">{metrics.pending}</span>
              <span className="text-xs text-amber-600 font-medium">Awaiting Audit</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Investigations</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-blue-600">{metrics.investigating}</span>
              <span className="text-xs text-slate-500 font-medium">In Progress</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved Folders</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-emerald-600">{metrics.resolved}</span>
              <span className="text-xs text-slate-500 font-medium">Completed Files</span>
            </div>
          </div>
        </div>

        {/* Master Case Table Ledger */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your Assigned Case Queue</h2>
              <p className="text-xs text-slate-500">Select an item below to open the complete details, view raw evidence files, or append closing statements.</p>
            </div>
            
            {/* EXCEL GENERATOR INTERACTIVE BUTTON */}
            {assignedCases.length > 0 && (
              <button
                type="button"
                onClick={exportToExcel}
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all self-start sm:self-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export Ledger to Excel (.xlsx)
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-500 font-medium">Retrieving operational data files...</div>
          ) : assignedCases.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">No active complaints are currently routed to your account ID.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Tracking ID</th>
                    <th className="px-5 py-3">Incident Title</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Current Status</th>
                    <th className="px-5 py-3 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {assignedCases.map((incident) => (
                    <tr key={incident._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-700">{incident.trackingId}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">{incident.title}</td>
                      <td className="px-5 py-3.5 text-slate-600">{incident.category}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                          incident.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          incident.status === "Under Investigation" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          incident.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => handleOpenCase(incident)} className="bg-slate-900 hover:bg-blue-600 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition">
                          Open File →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* COMPREHENSIVE INTELLIGENCE INTERACTION DRAWER MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 max-h-[94vh] flex flex-col overflow-hidden animate-fadeIn">
            
            {/* Modal Title Banner Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-xs text-blue-600">MASTER DOSSIER CONTEXT: {selectedCase.trackingId}</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedCase.title}</h3>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm transition">✕</button>
            </div>

            {/* Continuous Full Detail Display Form Panel */}
            <form onSubmit={handleUpdateCase} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              
              {/* DETAIL CARD 1: Complete Civilian Complainant Profile */}
              <div className="bg-blue-50/40 border border-blue-100/70 rounded-xl p-4 space-y-2">
                <span className="block font-bold text-blue-900 text-[10px] uppercase tracking-wider">Complainant Profile Identity</span>
                <div className="grid gap-4 sm:grid-cols-3 text-slate-800">
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Citizens Name</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedCase.userId?.fullName || "Anonymous Tip / Legacy Log"}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Contact Mobile</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedCase.userId?.mobileNumber || "Unavailable"}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Verified Email</span>
                    <p className="text-slate-700 font-bold truncate mt-0.5">{selectedCase.userId?.email || "Unavailable"}</p>
                  </div>
                </div>
              </div>

              {/* DETAIL CARD 2: Case Parameters & Timeline Matrices */}
              <div className="grid gap-4 sm:grid-cols-3 bg-slate-50 border border-slate-200/50 rounded-xl p-4">
                <div>
                  <span className="block font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Reported Category</span>
                  <p className="font-bold text-slate-800">{selectedCase.category}</p>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Occurrence Date</span>
                  <p className="font-bold text-slate-800">
                    {selectedCase.date ? new Date(selectedCase.date).toLocaleDateString() : "Missing"}
                  </p>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Assigned Officer</span>
                  <p className="font-bold text-slate-800">{selectedCase.assignedOfficer?.fullName || "Your Desk"}</p>
                </div>
              </div>

              {/* DETAIL CARD 3: Complete Narrative Report Text */}
              <div>
                <span className="block font-bold text-slate-400 text-[10px] uppercase mb-1 tracking-wider">Detailed Statement Report</span>
                <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200/50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {selectedCase.description || "No core descriptive text provided."}
                </p>
              </div>

              {/* DETAIL CARD 4: Live Core Evidence Component Mirror */}
              <div>
                <span className="block font-bold text-slate-400 text-[10px] uppercase mb-1 tracking-wider">Submitted Evidence Vault</span>
                <div className="border border-slate-200/60 rounded-xl p-2 bg-slate-50/50">
                  <EvidenceViewer evidenceUrls={selectedCase.evidence || []} />
                </div>
              </div>

              {/* DETAIL CARD 5: Location Context Map Block */}
              <div className="bg-slate-900 rounded-xl p-4 text-white">
                <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-wider">Location Context Coordinates</span>
                <p className="text-xs font-mono text-blue-400 flex items-center gap-1">📍 {selectedCase.location || "No address logged."}</p>
              </div>

              {/* WORKFLOW MATRIX SECTION: Operational Controls & Dropdown Status Modifiers */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">Officer Action Center</h4>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="block font-bold text-slate-400 text-[10px] uppercase mb-1 tracking-wider">Modify Deployment Action</span>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      <option value="Pending">Pending Action</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Resolved">Resolved / Closed Case</option>
                      <option value="Rejected">Rejected / Dismissed Case</option>
                    </select>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-400 text-[10px] uppercase mb-1 tracking-wider">Active Folder Status Badge</span>
                    <span className="block text-center bg-slate-100 border border-slate-200/40 rounded-xl p-2.5 font-black uppercase text-[10px] text-slate-600">
                      {selectedCase.status}
                    </span>
                  </div>
                </div>

                {/* Dynamic field configurations displayed cleanly for Final Resolution or Case Rejection profiles */}
                {(formStatus === "Resolved" || formStatus === "Rejected") && (
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 animate-slideUp">
                    <div>
                      <label className="block font-bold text-slate-400 text-[10px] uppercase mb-1 tracking-wider">
                        Official Concluding Statement (Transmitted instantly to citizen ledger)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={finalStatement}
                        onChange={(e) => setFinalStatement(e.target.value)}
                        placeholder={formStatus === "Resolved" ? "Provide clean step-by-step resolution remarks for the citizen dashboard view..." : "State clear official reason metrics regarding complaint file rejection, discrepancies or dismissal..."}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 leading-relaxed text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-400 text-[10px] uppercase mb-1 tracking-wider">
                        Attach Official Signed Closure Report / Document <span className="text-slate-400 lowercase font-normal">(optional)</span>
                      </label>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => setFinalReport(e.target.files[0])}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 cursor-pointer text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Interactive Form Footnotes */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                <button type="button" onClick={() => setSelectedCase(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">
                  Close View
                </button>
                <button type="submit" disabled={updateLoading} className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold shadow-md transition">
                  {updateLoading ? "Transmitting Logs..." : "Commit Status Changes"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;