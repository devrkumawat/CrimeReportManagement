import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // 1. Initialize user state from storage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("justiceeye_user");
    return storedUser ? JSON.parse(storedUser) : { fullName: "User", isEmailVerified: false };
  });

  const token = localStorage.getItem("justiceeye_token");

  // 2. NEW: SYNC-ON-MOUNT (Forces fresh data from DB)
  useEffect(() => {
    const syncUserStatus = async () => {
      if (!token) return;
      try {
        const response = await fetch("/api/v1/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const freshUser = await response.json();
          // Overwrite stale local storage with the database truth
          localStorage.setItem("justiceeye_user", JSON.stringify(freshUser));
          // Update local state to force UI update (removes Unverified pill)
          setUser(freshUser);
        }
      } catch (err) {
        console.error("Sync failed:", err);
      }
    };
    syncUserStatus();
  }, [token]);

  // Existing Fetch Complaints Effect
  useEffect(() => {
    const fetchUserComplaints = async () => {
      if (!token) { navigate("/login"); return; }
      try {
        const response = await fetch("/api/v1/incidents/my-reports", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setComplaints(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserComplaints();
  }, [navigate, token]);
    const isAccountVerified = user.isEmailVerified;

    const getStatusColor = (status) => {
      switch (status) {
        case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
        case "Under Investigation": return "bg-blue-50 text-blue-700 border-blue-200";
        case "Resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        default: return "bg-slate-50 text-slate-700 border-slate-200";
      }
    };

    return (
      <div className="bg-slate-50 min-h-screen py-8 font-sans relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Dashboard Top Header Layout Node */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {user.fullName}</h1>
                
                {isAccountVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2.5 py-0.5 shadow-xs">
                    🛡️ Verified Profile
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black px-2.5 py-0.5 animate-pulse">
                    ⚠️ Unverified Email
                  </span>
                )}
              </div>
              
              {/* Context action link bar for non-verified user profiles */}
              
            </div>
            <button
              onClick={() => navigate("/report")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all self-start sm:self-auto"
            >
              File New Complaint
            </button>
          </div>

          {/* Dynamic Loading Framework */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center bg-white border border-slate-200 rounded-2xl p-12 shadow-sm mt-8">
              <span className="block text-xl mb-2">📁</span>
              <h3 className="text-sm font-bold text-slate-900">No active complaints found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">You haven't filed any official cases inside our database logs yet.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {complaints.map((item) => (
                <div key={item._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider font-semibold">{item.trackingId}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded mt-1.5">{item.category}</span>
                    <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">{item.description}</p>
                  </div>
                  
                  <div>
                    {item.assignedOfficer && (
                      <div className="mt-4 p-2.5 rounded-xl border flex items-center justify-between text-[10px] bg-blue-50/40 text-blue-800 border-blue-100/70">
                        <span className="font-semibold">👤 Dispatch: <strong className="font-bold text-slate-900">{item.assignedOfficer.fullName}</strong></span>
                        <span className="font-mono font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-100">{item.assignedOfficer.badgeId}</span>
                      </div>
                    )}

                    {/* UPGRADED CARD FOOTER: Added dynamic interactive single-ledger router action toggle link */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] text-slate-400 font-medium">
                      <span className="truncate max-w-35" title={item.location}>📍 {item.location}</span>
                      <button
                        onClick={() => navigate(`/incident/${item._id}`)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer bg-transparent border-none p-0"
                      >
                        Open Case File →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* POPUP CONTAINER MODAL */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 w-full max-w-sm space-y-4">
              <div className="text-center">
                <span className="text-2xl">📧</span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-2 uppercase tracking-wide">Email Verification Gate</h3>
                <p className="text-xs text-slate-400 mt-1">Provide the 6-digit verification sequence code string routed onto your registered email inbox.</p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <input 
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-Digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full tracking-widest text-center text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-300"
                />

                <div className="flex gap-2.5">
                  <button 
                    type="button"
                    onClick={() => { setShowOtpModal(false); setOtpCode(""); }}
                    className="w-1/2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-2 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="w-1/2 rounded-xl bg-blue-600 text-white font-bold py-2 text-xs hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isVerifyingOtp ? "Validating..." : "Verify Email"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Dashboard;