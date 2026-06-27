import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Report = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [evidenceFiles, setEvidenceFiles] = useState([]);

  // Autocomplete UI states
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: "",
    location: "",
    description: "",
  });

  // Close the location dropdown automatically if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enforce session presence on component mount
  useEffect(() => {
    const token = localStorage.getItem("justiceeye_token");
    if (!token) {
      toast.error("Please log in first to file an official complaint.", {
        toastId: "login-gate-error",
      });
      navigate("/login");
    }
  }, [navigate]);

  // Auto-detect user's location via IP Geolocation API
  const autoDetectLocation = async () => {
    setIsDetecting(true);
    setSuggestions([]);
    setShowDropdown(false);
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) throw new Error("Location service unavailable.");

      const data = await response.json();

      if (data.city && data.region) {
        setFormData((prev) => ({
          ...prev,
          location: `${data.city}, ${data.region}, India`,
        }));
        toast.success(`Detected location: ${data.city}, ${data.region}`);
      } else {
        throw new Error("Could not parse location data.");
      }
    } catch (err) {
      toast.error("Failed to auto-detect location. Please type it manually.");
    } finally {
      setIsDetecting(false);
    }
  };

  // 1. Add a useRef to track the timeout for debouncing
  const debounceTimer = useRef(null);

  // 2. Updated Fetch Function with User-Agent & Error Handling
  const fetchLocationSuggestions = async (query) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Clear previous timer to prevent excessive API calls
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=5&addressdetails=1`,
          {
            headers: {
              // CRITICAL: Nominatim REQUIRES a custom User-Agent
              "User-Agent": "JusticeEye-App-v1 (justiceeye.gov.in)",
            },
          }
        );

        if (response.status === 429) {
          toast.error("Too many searches. Please wait a moment.");
          return;
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setSuggestions(data);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Location Fetch Error:", error);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 800); // Wait 800ms after user stops typing
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "location") {
      fetchLocationSuggestions(value);
    }
  };

  const handleSelectSuggestion = (placeName) => {
    setFormData((prev) => ({ ...prev, location: placeName }));
    setSuggestions([]);
    setShowDropdown(false);
  };

  // UPGRADED: Buffers multiple highlighted file entities safely into your array pipeline
  const handleFileSelect = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Safety limit matching our backend threshold parameter maximum
      if (evidenceFiles.length + selectedFiles.length > 5) {
        toast.warning("Filing constraint: You can attach a maximum of 5 evidence files.");
        return;
      }

      setEvidenceFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  // UPGRADED: Allows users to remove a file from the staging queue before submission
  const removeFileFromQueue = (indexToRemove) => {
    setEvidenceFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // UPGRADED: Processes structural content parameters into binary form packets
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("justiceeye_token");

    try {
      // 1. Core adjustment: Initialize native multipart form engine data carrier
      const multipartPayload = new FormData();

      // 2. Append text fields 
      multipartPayload.append("title", formData.title);
      multipartPayload.append("category", formData.category);
      multipartPayload.append("date", formData.date);
      multipartPayload.append("location", formData.location);
      multipartPayload.append("description", formData.description);

      // 3. Loop and append file objects to the key name 'evidence' expected by Multer
      evidenceFiles.forEach((file) => {
        multipartPayload.append("evidence", file);
      });

      const response = await fetch("/api/v1/incidents/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: multipartPayload, // Dispatched form payload array replacing standard raw JSON
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit your report.");
      }

      toast.success(`Complaint registered! Tracking ID: ${data.trackingId}`);
      if (data.dispatchNotice) {
        toast.info(data.dispatchNotice, { autoClose: 5000 });
      }

      // Reset layout configurations on success
      setFormData({
        title: "",
        category: "",
        date: "",
        location: "",
        description: "",
      });
      setEvidenceFiles([]);

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-6 sm:py-8 grow flex items-center font-sans">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-10 w-full">

        <div className="mb-6 pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            File an Official Complaint
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Please fill in the fields below accurately. Your submitted details will be safely logged into our secure tracking network.
          </p>
        </div>

        <form onSubmit={handleSubmitReport} className="grid gap-6 lg:grid-cols-3 items-start">

          {/* Left Fields Container */}
          <div className="lg:col-span-2 space-y-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-slate-700 mb-1">
                Complaint Title / Brief Subject
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                disabled={isLoading}
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Online financial scam via fake payment link"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="category" className="block text-xs font-bold text-slate-700 mb-1">
                  Type of Crime
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  disabled={isLoading}
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
                >
                  <option value="">Select Category</option>
                  <option value="Cybercrime">Cyber Crime / Online Fraud</option>
                  <option value="Theft">Theft / Burglary</option>
                  <option value="Assault">Physical Offense / Assault</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Fraud">Financial Fraud</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-xs font-bold text-slate-700 mb-1">
                  When did it happen?
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  required
                  disabled={isLoading}
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
                />
              </div>

              {/* Location Input with suggestions */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="location" className="block text-xs font-bold text-slate-700">
                    Where did it happen?
                  </label>
                  <button
                    type="button"
                    disabled={isDetecting || isLoading}
                    onClick={autoDetectLocation}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 focus:outline-none transition-colors"
                  >
                    {isDetecting ? "Detecting..." : "📍 Auto-Detect"}
                  </button>
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  autoComplete="off"
                  disabled={isLoading}
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Type an Indian city or area..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
                />

                {showDropdown && suggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100">
                    {suggestions.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectSuggestion(item.display_name)}
                        className="px-3 py-2 text-[11px] text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors truncate"
                        title={item.display_name}
                      >
                        📍 {item.display_name}
                      </li>
                    ))}
                  </ul>
                )}

                {isSearchingLocation && (
                  <span className="absolute right-3 bottom-2.5 text-[10px] text-slate-400 animate-pulse">Searching...</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Description of the Incident
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                disabled={isLoading}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please describe exactly what happened in simple words..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Sidebar Layout Options */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Attach Proof / Evidence (Max 5)
              </h2>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center relative bg-slate-50/30 hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  multiple // UPGRADED: Allows users to choose multiple assets from native storage explore overlays
                  accept="image/*,video/*,application/pdf"
                  disabled={isLoading}
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="block text-xs font-semibold text-slate-700">Upload Photos, Videos or Documents</span>
                <span className="block text-[9px] text-slate-400 mt-1">Accepts images, videos, and PDFs</span>
              </div>

              {/* UPGRADED: Real-time staged upload queue list display */}
              {evidenceFiles.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pt-1 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Staged Queue ({evidenceFiles.length}/5):</p>
                  {evidenceFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px] font-mono text-slate-600">
                      <span className="truncate max-w-36.25" title={file.name}>📎 {file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFileFromQueue(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold px-1"
                        title="Remove file from staging array"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading && <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-white" />}
              {isLoading ? "Submitting..." : "Submit Official Complaint"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Report;