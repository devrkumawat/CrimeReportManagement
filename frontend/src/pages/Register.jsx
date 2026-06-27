import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (accountData.password !== accountData.confirmPassword) {
      return setErrorMessage("Passwords do not match. Please re-check.");
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: accountData.fullName,
          email: accountData.email,
          mobileNumber: accountData.mobileNumber,
          password: accountData.password,
          role: "citizen"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccessMessage("Account created successfully! Redirecting you to the home page...");
      localStorage.setItem("justiceeye_token", data.token);
      localStorage.setItem("justiceeye_user", JSON.stringify(data.user));

      setTimeout(() => {
        navigate("/");
        window.location.reload(); 
      }, 2000);

    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 grow font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        
        <div className="text-center mb-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Citizen Account</h1>
          <p className="text-xs text-slate-500 mt-1">Sign up to file reports and track your complaints securely</p>
        </div>

        {errorMessage && <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-medium">Error: {errorMessage}</div>}
        {successMessage && <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-600 font-medium">Success: {successMessage}</div>}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              disabled={isLoading}
              value={accountData.fullName}
              onChange={handleChange}
              placeholder="Dev Kumawat"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={isLoading}
              value={accountData.email}
              onChange={handleChange}
              placeholder="dev.kumawat@example.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="mobileNumber" className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              required
              pattern="[0-9]{10}"
              disabled={isLoading}
              value={accountData.mobileNumber}
              onChange={handleChange}
              placeholder="e.g., 9876543210"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                disabled={isLoading}
                value={accountData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                disabled={isLoading}
                value={accountData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-type password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading && <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-white" />}
            {isLoading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">Sign In here</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;