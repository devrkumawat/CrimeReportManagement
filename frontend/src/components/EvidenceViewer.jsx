import React from "react";

const EvidenceViewer = ({ evidenceUrls }) => {
  if (!evidenceUrls || evidenceUrls.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic bg-slate-50 border border-slate-200 rounded-xl p-4">
        No digital media proof attachments found for this file.
      </p>
    );
  }

  // Detects file signatures to choose the correct layout player
  const getFileType = (url) => {
    if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return "image";
    if (url.match(/\.(mp4|webm|ogg|mov)$/i)) return "video";
    if (url.match(/\.(pdf)$/i)) return "pdf";
    return "document";
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        🔒 Secure Evidence Vault ({evidenceUrls.length} File{evidenceUrls.length > 1 ? "s" : ""})
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidenceUrls.map((url, idx) => {
          const type = getFileType(url);

          return (
            <div 
              key={idx} 
              className="group border border-slate-200 rounded-xl overflow-hidden bg-slate-900 shadow-2xs hover:border-blue-500 transition-all flex flex-col justify-between"
              style={{ minHeight: "130px" }}
            >
              <div className="w-full grow flex items-center justify-center bg-slate-950 overflow-hidden">
                {type === "image" && (
                  <img 
                    src={url} 
                    alt="Evidence asset file portfolio" 
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                )}

                {type === "video" && (
                  <video className="w-full h-24 object-cover" controls preload="metadata">
                    <source src={url} />
                  </video>
                )}

                {type === "pdf" && (
                  <div className="flex flex-col items-center py-4 text-slate-300">
                    <span className="text-2xl">📄</span>
                    <span className="text-[10px] font-mono mt-1 text-slate-400">PDF Document</span>
                  </div>
                )}

                {type === "document" && (
                  <div className="flex flex-col items-center py-4 text-slate-300">
                    <span className="text-2xl">📁</span>
                    <span className="text-[10px] font-mono mt-1 text-slate-400">Attached Asset</span>
                  </div>
                )}
              </div>

              <div className="bg-white border-t border-slate-100 p-2 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-mono">Item #{idx + 1}</span>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-blue-600 px-2 py-0.5 rounded font-bold transition-all"
                >
                  View Full ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvidenceViewer;