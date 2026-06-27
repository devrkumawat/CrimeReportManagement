import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import EvidenceViewer from "../components/EvidenceViewer.jsx";

const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleGoBack = () => {
    const userSession = localStorage.getItem("justiceeye_user");
    const user = userSession ? JSON.parse(userSession) : null;
    if (user?.role === "admin") navigate("/admin", { replace: true });
    else navigate("/dashboard", { replace: true });
  };

  useEffect(() => {
    const fetchIncident = async () => {
      const token = localStorage.getItem("justiceeye_token");
      try {
        const response = await fetch(`/api/v1/incidents/details/${id}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setIncident(data);
      } catch (err) {
        toast.error(err.message);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchIncident();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        <button onClick={handleGoBack} className="text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 flex items-center gap-1">
          ← Return to Dashboard
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Case Ref: {incident.trackingId}</p>
              <h1 className="text-2xl font-black text-slate-900">{incident.title}</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
              incident.status === "Resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {incident.status}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            {[
              { label: "Category", value: incident.category },
              { label: "Reported On", value: new Date(incident.date).toLocaleDateString() },
              { label: "Officer", value: incident.assignedOfficer?.fullName || "Unassigned" },
              { label: "Evidence Count", value: incident.evidence?.length || 0 }
            ].map((stat, idx) => (
              <div key={idx} className="p-4 text-center">
                <span className="block text-[9px] uppercase font-bold text-slate-400 mb-1">{stat.label}</span>
                <span className="text-xs font-semibold text-slate-700">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Detailed Report</h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed">{incident.description}</p>
            </div>

            {/* Evidence Section */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Submitted Evidence</h3>
              <EvidenceViewer evidenceUrls={incident.evidence} />
            </div>
            
            {/* Location Map Placeholder */}
            <div className="bg-slate-900 rounded-xl p-6 text-white">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-2">Location Context</h3>
              <p className="text-sm font-mono text-blue-400">📍 {incident.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default IncidentDetails;