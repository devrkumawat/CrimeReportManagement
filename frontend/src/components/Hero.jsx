import { Link, useNavigate, useLocation } from "react-router-dom";

const Hero = ({ stats }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("justiceeye_token");

  // Helper to handle the loading state safely
  const val = (n) => (n !== undefined && n !== null ? n : "...");

  const statsData = [
    { label: "Total Cases", value: val(stats?.total), color: "slate" },
    { label: "Pending Review", value: val(stats?.pending), color: "amber" },
    { label: "Under Investigation", value: val(stats?.investigating), color: "blue" },
    { label: "Resolved Cases", value: val(stats?.resolved), color: "green" },
  ];

  const handleLearnMore = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#how-it-works");
    }
  };

  const StatTile = ({ label, value, color }) => {
    const themes = {
      slate: { bg: "bg-slate-50 border-slate-100", num: "text-slate-900", label: "text-slate-500" },
      amber: { bg: "bg-amber-50/50 border-amber-100", num: "text-amber-600", label: "text-amber-700" },
      blue: { bg: "bg-blue-50/50 border-blue-100", num: "text-blue-600", label: "text-blue-700" },
      green: { bg: "bg-green-50/50 border-green-100", num: "text-green-600", label: "text-green-700" },
    };
    const theme = themes[color] || themes.slate;
    return (
      <div className={`rounded-xl border ${theme.bg} p-4 transition hover:shadow-sm`}>
        <p className={`text-xs font-medium ${theme.label}`}>{label}</p>
        <h4 className={`mt-1 text-2xl font-bold ${theme.num} tracking-tight`}>{value}</h4>
      </div>
    );
  };

  return (
    <section className="bg-slate-50 py-8 sm:py-12 border-b border-slate-200">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-10 w-full">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-start max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              JusticeEye Platform
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
              Digital Crime Reporting <span className="block text-blue-600 mt-1">& Case Tracking System</span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 max-w-md">
              Securely report incidents, track investigations, and connect with authorities through a modern, transparent digital platform.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 w-full sm:w-auto">
              <Link to="/report" className="w-full sm:w-auto text-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                Register Complaint
              </Link>
              <button onClick={handleLearnMore} className="w-full sm:w-auto text-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Learn More
              </button>
            </div>
          </div>
          
          {/* Live Stats Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Live System Overview</h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {statsData.map((stat, index) => <StatTile key={index} {...stat} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;