const CyberSafetyTips = () => {
  const tips = [
    {
      category: "Authentication Security",
      title: "Enforce Strong Multi-Factor Controls",
      advice: "Always utilize time-based tokens (TOTP) via authenticator apps rather than standard SMS codes. Ensure unique, high-entropy passphrases for all database, root, and administrative accounts.",
      tag: "Critical",
      tagColor: "text-red-700 bg-red-50 border-red-100",
    },
    {
      category: "Social Engineering",
      title: "Identify Phishing & Mimicry Vectors",
      advice: "Verify domain security certificates and cryptographic signatures before clicking external links. Official justice agencies will never request login credentials or private encryption keys via email.",
      tag: "Prevention",
      tagColor: "text-amber-700 bg-amber-50 border-amber-100",
    },
    {
      category: "Data Integrity",
      title: "Secure Local Evidence Stores",
      advice: "When preparing digital files for crime submissions, maintain original unaltered file paths, keep cryptographic hashes (MD5/SHA-256) of media assets, and avoid renaming raw evidence items.",
      tag: "Procedural",
      tagColor: "text-blue-700 bg-blue-50 border-blue-100",
    },
  ];

  return (
    <section id="safety-tips" className="bg-white py-8 sm:py-10 border-b border-slate-200">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-8">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Public Safety Advisory
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Cyber Safety & Awareness
          </h2>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">
            Proactive security strategies verified by digital defense units to shield your personal data footprints and preserve the validity of submitted evidence.
          </p>
        </div>

        {/* Noticeboard Layout Matrix */}
        <div className="grid gap-6 md:grid-cols-3">
          {tips.map((tip) => (
            <div 
              key={tip.title}
              className="border border-slate-200 bg-slate-50/30 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:border-blue-400 hover:bg-white"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {tip.category}
                  </span>
                  <span className={`text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-md border ${tip.tagColor}`}>
                    {tip.tag}
                  </span>
                </div>
                
                {/* Content */}
                <h3 className="text-base font-bold tracking-tight text-slate-900 mb-2">
                  {tip.title}
                </h3>
                <p className="text-xs leading-5 text-slate-600">
                  {tip.advice}
                </p>
              </div>

              {/* Explicit Action/Footer Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-blue-600 text-xs font-medium">
                <span>Review Protocol</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CyberSafetyTips;