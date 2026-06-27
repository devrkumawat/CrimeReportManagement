import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: State for monitoring password cleartext toggle visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: credentials.identifier,
          email: credentials.identifier,
          password: credentials.password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid login details.");
      }

      setSuccessMessage(`Welcome back, ${data.user.fullName}!`);
      localStorage.setItem("justiceeye_token", data.token);
      localStorage.setItem("justiceeye_user", JSON.stringify(data.user));

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (data.user.role === "police") {
          navigate("/officer/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        window.location.reload();
      }, 1000);

    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfigs = {
    citizen: {
      label: "Email Address or Mobile Number",
      placeholder: "dev.kumawat@example.com or 9876543210",
      desc: "Log in to check your complaint status, file a new report, or manage your anonymous tips.",
    },
    police: {
      label: "Officer Badge ID or Email",
      placeholder: "e.g., MH-12-P-9874 or amit.kumar@police.gov.in",
      desc: "Secure portal access for verified police officers to manage cases and log incident updates.",
    },
    admin: {
      label: "Admin Email or Username",
      placeholder: "",
      desc: "Master controller access to view site activity logs, update settings, and manage user permissions.",
    },
  };

  const currentConfig = roleConfigs[selectedRole];

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 grow font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

        <div className="text-center mb-5">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mb-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">JusticeEye Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Please select your account role to sign in</p>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl flex w-full border border-slate-200/40 mb-4">
          {["citizen", "police", "admin"].map((role) => (
            <button
              key={role}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setSelectedRole(role);
                setCredentials({ identifier: "", password: "" });
                setErrorMessage("");
                setShowPassword(false); // Reset visibility selection on swap
              }}
              className={`flex-1 text-center py-2 rounded-lg text-xs font-bold capitalize transition-all ${selectedRole === role ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {role}
            </button>
          ))}
        </div>

        {errorMessage && <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-medium">{errorMessage}</div>}
        {successMessage && <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-600 font-medium">{successMessage}</div>}

        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 mb-4">
          <p className="text-[11px] leading-relaxed text-slate-600">
            <span className="font-bold text-slate-800 uppercase text-[9px] tracking-wider block mb-0.5">Portal Selected: {selectedRole} Account</span>
            {currentConfig.desc}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{currentConfig.label}</label>
            <input
              type="text"
              name="identifier"
              required
              disabled={isLoading}
              value={credentials.identifier}
              onChange={handleChange}
              placeholder={currentConfig.placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            {/* Added relative positioning context to anchor the toggler icon container inside the inputs structure */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                disabled={isLoading}
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${selectedRole === "citizen" ? "bg-blue-600" : selectedRole === "police" ? "bg-slate-900" : "bg-emerald-600"
              }`}
          >
            {isLoading ? "Verifying..." : `Log In as ${selectedRole}`}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
          New citizen user? <Link to="/register" className="font-bold text-blue-600 hover:underline">Create an Account here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;