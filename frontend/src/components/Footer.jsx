import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (e, id) => {
    if (location.pathname === "/") {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <footer id="footer" className="bg-slate-900 text-slate-400 pt-12 pb-6 border-t border-slate-800 font-sans">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-10">
        
        <div className="grid gap-10 lg:grid-cols-12 pb-10 border-b border-slate-800/70">
          
          {/* Brand Panel */}
          <div className="lg:col-span-4 flex flex-col items-start space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight">JusticeEye</span>
            </div>
            <p className="text-xs leading-5 text-slate-400 max-w-sm">
              Official encryption-secured digital incident cataloging registry. Certified secure framework processing metrics for municipal clusters and active public protection squads.
            </p>
            <div className="inline-flex items-center gap-2 rounded-md bg-slate-950/60 px-2.5 py-1 text-[10px] font-mono text-blue-400 border border-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM NODE ONLINE: V2026.1.4
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 border-l-2 border-blue-600 pl-2">
              Platform Access
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-blue-400 hover:underline transition-all">System Features</Link></li>
              <li><Link to="/#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="hover:text-blue-400 hover:underline transition-all">How It Works</Link></li>
              <li><Link to="/#faq" onClick={(e) => scrollToSection(e, "faq")} className="hover:text-blue-400 hover:underline transition-all">Information Desk (FAQ)</Link></li>
            </ul>
          </div>

          {/* Contact Details (Form Replaced) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 border-l-2 border-slate-700 pl-2">
              Administration Desk
            </h4>
            <ul className="space-y-3 text-[11px] leading-relaxed">
              <li>
                <span className="block font-semibold text-slate-400 text-[10px] uppercase tracking-wide">Secure HQ</span>
                <span className="text-slate-300">Navsari, Gujarat, India</span>
              </li>
              <li>
                <span className="block font-semibold text-slate-400 text-[10px] uppercase tracking-wide">Direct Line</span>
                <a href="mailto:secure.desk@justiceeye.gov" className="text-blue-400 hover:underline">devrkumawat@gmail.com</a>
              </li>
              <li>
                <span className="block font-semibold text-slate-400 text-[10px] uppercase tracking-wide">Availability</span>
                <span className="text-slate-300">24Hrs Response Window</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Verification Banner */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div className="flex items-center gap-1.5">
            <p>© 2026 JusticeEye. Designed by Dev Kumawat.</p>
          </div>
          <p className="text-center md:text-right text-[10px] text-slate-600 max-w-md font-mono leading-tight">
            CRITICAL ADVISORY: Unauthorized injection parameters or tampering explicitly logged as severe server infringements.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;