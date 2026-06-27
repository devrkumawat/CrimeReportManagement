import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx"; // Hooking directly into your pre-installed npm Excel utility package

const AdminPolice = ({ data, token, refresh }) => {
  const dropdownRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  
  // API Search UI States for Jurisdiction Mapping
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [form, setForm] = useState({ 
    fullName: "", 
    email: "", 
    mobileNumber: "", 
    password: "",
    jurisdiction: "" 
  });

  // Automatically collapse the map suggestions dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // NEW: Refactored Native Excel (.xlsx) Binary Export Engine
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      toast.warn("No active field officer records available to export.");
      return;
    }

    try {
      // 1. Map raw database documents into key-value pairs which act as columns
      const sheetRows = data.map(officer => ({
        "Full Name": officer.fullName,
        "Badge ID": officer.badgeId || "N/A",
        "Jurisdiction Zone": officer.jurisdiction || "Unassigned Zone",
        "Official Email": officer.email,
        "Mobile Contact Number": officer.mobileNumber,
        "Registration Date": new Date(officer.createdAt).toLocaleDateString()
      }));

      // 2. Convert mapped rows into an Excel sheet layout object
      const worksheet = XLSX.utils.json_to_sheet(sheetRows);

      // 3. Generate a brand new global spreadsheet workbook file structure
      const workbook = XLSX.utils.book_new();

      // 4. Attach sheet to workbook container and title the internal spreadsheet tab
      XLSX.utils.book_append_sheet(workbook, worksheet, "Active Officers Ledger");

      // 5. Trigger binary stream generation and download file locally
      XLSX.writeFile(workbook, "JusticeEye_Police_Registry_2026.xlsx");

      toast.success("Excel spreadsheet spreadsheet downloaded successfully!");
    } catch (error) {
      console.error("Excel Generation Error Logs:", error);
      toast.error("Failed to compile native Excel spreadsheet workbook.");
    }
  };

  // Live OpenStreetMap Nominatim Suggestion Engine
  const fetchLocationSuggestions = async (query) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=5&addressdetails=1`
      );
      
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSuggestions(data);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      setSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "jurisdiction") {
      fetchLocationSuggestions(value);
    }
  };

  const handleSelectSuggestion = (placeName) => {
    setForm((prev) => ({ ...prev, jurisdiction: placeName }));
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingOfficer ? `/api/v1/admin/police/${editingOfficer._id}` : "/api/v1/admin/police";
    
    try {
      const res = await fetch(url, {
        method: editingOfficer ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message);

      toast.success(resData.message);
      setShowModal(false);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Purge this official police terminal profile?")) return;
    try {
      const res = await fetch(`/api/v1/admin/police/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      toast.success("Officer purged from records ledger.");
      refresh();
    } catch {
      toast.error("Purge event allocation error.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Police Force Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage regional station authorization blocks and automated badge tracking numbers.</p>
        </div>
        
        {/* Action Toolbar Hub */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto w-full sm:w-auto">
          <button 
            onClick={exportToExcel}
            className="flex-1 sm:flex-initial rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
          >
            📊 Export Excel Sheet
          </button>
          <button 
            onClick={() => { 
              setEditingOfficer(null); 
              setForm({ fullName: "", email: "", mobileNumber: "", password: "", jurisdiction: "" }); 
              setShowModal(true); 
            }} 
            className="flex-1 sm:flex-initial rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
          >
            ➕ Onboard Officer
          </button>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-187.5">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
              <th className="p-4">Officer Details</th>
              <th className="p-4">Badge ID</th>
              <th className="p-4">Jurisdiction Assignment Block</th>
              <th className="p-4">Official Communication</th>
              <th className="p-4 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {data.map(officer => (
              <tr key={officer._id} className="hover:bg-slate-50/40 transition-colors">
                <td className="p-4 font-bold text-slate-900">⭐ {officer.fullName}</td>
                <td className="p-4 font-mono font-bold text-blue-600 bg-blue-50/30 rounded-lg px-2 py-1 inline-block mt-3 ml-2 text-[11px] border border-blue-100/40">{officer.badgeId}</td>
                <td className="p-4 text-slate-600 font-semibold truncate max-w-55" title={officer.jurisdiction}>📍 {officer.jurisdiction || "Unassigned Zone"}</td>
                <td className="p-4">
                  <span className="block font-medium">{officer.email}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Tel: {officer.mobileNumber}</span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button 
                    onClick={() => { 
                      setEditingOfficer(officer); 
                      setForm({ 
                        fullName: officer.fullName, 
                        email: officer.email, 
                        mobileNumber: officer.mobileNumber, 
                        password: "",
                        jurisdiction: officer.jurisdiction || ""
                      }); 
                      setShowModal(true); 
                    }} 
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Modify
                  </button>
                  <button onClick={() => handleDelete(officer._id)} className="text-rose-600 font-bold hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400 font-medium bg-white">No active field officers registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">{editingOfficer ? "Modify Officer Parameters" : "Onboard Police Terminal"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {editingOfficer && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">System Badge ID (Immutable)</label>
                  <input type="text" disabled value={editingOfficer.badgeId} className="w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-xl px-3 py-2 text-xs font-mono font-bold" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Full Identity Name</label>
                <input type="text" name="fullName" required value={form.fullName} onChange={handleInputChange} placeholder="e.g. Om Patil" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <label htmlFor="jurisdiction" className="block text-[10px] font-bold text-slate-500 mb-1">
                  Assigned Jurisdiction Location
                </label>
                <input
                  type="text"
                  id="jurisdiction"
                  name="jurisdiction"
                  required
                  autoComplete="off"
                  value={form.jurisdiction}
                  onChange={handleInputChange}
                  placeholder="Type an area or sector name..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {showDropdown && suggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100">
                    {suggestions.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectSuggestion(item.display_name)}
                        className="px-3 py-2 text-[10px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors truncate"
                        title={item.display_name}
                      >
                        📍 {item.display_name}
                      </li>
                    ))}
                  </ul>
                )}
                
                {isSearchingLocation && (
                  <span className="absolute right-3 bottom-2 text-[9px] text-slate-400 animate-pulse">Searching maps...</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Official Email Address</label>
                <input type="email" name="email" required value={form.email} onChange={handleInputChange} placeholder="ompatil@gmail.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Contact Mobile Number</label>
                <input type="text" name="mobileNumber" required value={form.mobileNumber} onChange={handleInputChange} placeholder="e.g. 9876543210" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              {!editingOfficer && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">System Security Password</label>
                  <input type="password" name="password" required value={form.password} onChange={handleInputChange} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPolice;