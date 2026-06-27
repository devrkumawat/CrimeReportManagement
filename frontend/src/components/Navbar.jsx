import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast engine for the logout notification

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Read current session details directly from browser memory
  const token = localStorage.getItem("justiceeye_token");
  const storedUser = localStorage.getItem("justiceeye_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Reusable smooth scroll engine for homepage anchor nodes
  const scrollToSection = (e, id) => {
    setMenuOpen(false);
    if (location.pathname === "/") {
      e.preventDefault();
      document.getElementById(id).scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
  };

  // Live session logout routine
  const handleLogoutRoutine = () => {
    setMenuOpen(false);
    
    // 1. Clear out stored session identity tokens
    localStorage.removeItem("justiceeye_token");
    localStorage.removeItem("justiceeye_user");
    
    // 2. Flash a friendly animated notification card
    toast.success("Logged out successfully. See you again!");

    // 3. Bounce user cleanly back to safety home view and refresh states
    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1500);
  };

  const activeLinkStyle = ({ isActive }) =>
    `transition text-sm font-medium ${
      isActive ? "text-blue-600 font-semibold" : "text-slate-700 hover:text-blue-600"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-2.5 md:px-10">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">JusticeEye</h1>
            <p className="text-[10px] text-slate-500 hidden sm:block">Crime Reporting System</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <NavLink className={activeLinkStyle} to="/">Home</NavLink>
          
          <Link className="transition text-sm font-medium text-slate-700 hover:text-blue-600" to="/#features" onClick={(e) => scrollToSection(e, "features")}>
            Features
          </Link>
          
          {/* Swapped token check: Shows options dynamically if logged in */}
          {token && (
            <>
              <NavLink className={activeLinkStyle} to="/dashboard">Dashboard</NavLink>
              <NavLink className={activeLinkStyle} to="/report">File a Report</NavLink>
            </>
          )}
          
          <Link className="transition text-sm font-medium text-slate-700 hover:text-blue-600" to="/#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")}>
            How It Works
          </Link>
          
          <Link className="transition text-sm font-medium text-slate-700 hover:text-blue-600" to="/#faq" onClick={(e) => scrollToSection(e, "faq")}>
            FAQ
          </Link>

          <Link className="transition text-sm font-medium text-slate-700 hover:text-blue-600" to="/#footer" onClick={(e) => scrollToSection(e, "footer")}>
            Contact
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {!token ? (
            <>
              <Link to="/login" className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                Login
              </Link>
              <Link to="/register" className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm">
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 max-w-35px truncate">
                  👋 {user.fullName}
                </span>
              )}
              <button onClick={handleLogoutRoutine} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition shadow-sm">
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden rounded-md p-1.5 text-slate-700 hover:bg-slate-100 focus:outline-none">
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-3.5">
            <NavLink onClick={() => setMenuOpen(false)} className={activeLinkStyle} to="/">Home</NavLink>
            
            <Link className="transition text-sm font-medium text-slate-700 hover:text-blue-600" to="/#features" onClick={(e) => scrollToSection(e, "features")}>
              Features
            </Link>
            
            {token && (
              <>
                <NavLink onClick={() => setMenuOpen(false)} className={activeLinkStyle} to="/dashboard">Dashboard</NavLink>
                <NavLink onClick={() => setMenuOpen(false)} className={activeLinkStyle} to="/report">File a Report</NavLink>
              </>
            )}
            
            <Link className="transition text-sm font-medium text-slate-700 hover:text-blue-600" to="/#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")}>
              How It Works
            </Link>
            
            <Link className="transition text-sm font-medium text-slate-700 hover:text-blue-600" to="/#faq" onClick={(e) => scrollToSection(e, "faq")}>
              FAQ
            </Link>

            <Link className="transition text-sm font-medium text-slate-700 hover:text-blue-600" to="/#footer" onClick={(e) => scrollToSection(e, "footer")}>
              Contact
            </Link>

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              {!token ? (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 text-center transition">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white text-center hover:bg-blue-700 transition">
                    Register
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  {user && (
                    <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 p-2 rounded-lg text-center font-mono">
                      User: {user.fullName}
                    </span>
                  )}
                  <button onClick={handleLogoutRoutine} className="w-full rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 text-center hover:bg-red-100 transition">
                    Logout (Terminate link)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;