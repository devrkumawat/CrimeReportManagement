const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "File Secure Report",
      description: "Enter incident details, choose anonymity settings, and attach any digital evidence safely through our encrypted system.",
    },
    {
      number: "02",
      title: "Official Verification",
      description: "Assigned law enforcement officers review the submitted data, verify cross-references, and formally log the official case file.",
    },
    {
      number: "03",
      title: "Track Investigation",
      description: "Monitor live progress updates, receive automated status notifications, and communicate directly with investigators.",
    },
  ];

  return (
    // Tightened section padding from py-12 sm:py-16 to py-8 sm:py-10
    <section id="how-it-works" className="bg-slate-50 py-8 sm:py-10 border-b border-slate-200">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-10">
        
        {/* Section Header with shortened margins */}
        <div className="text-center flex flex-col items-center">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Operational Workflow
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How JusticeEye Operates
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
            A transparent, efficient, and standardized three-step architecture protecting citizens and streamlining law enforcement.
          </p>
        </div>

        {/* Steps Grid - Reduced top margin from mt-10 to mt-6 */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-start bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              
              {/* Top Row */}
              <div className="flex items-center justify-between w-full mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-sm font-bold text-white tracking-wider">
                  {step.number}
                </span>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-[44px] left-full w-6 border-t-2 border-dashed border-slate-300 z-10" />
                )}
              </div>

              {/* Step Content */}
              <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-xs leading-5 text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;