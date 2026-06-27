const WhyJusticeEye = () => {
  const points = [
    {
      title: "Your Data is Always Safe",
      description: "We use high-grade security to protect your statements and evidence files, ensuring your information stays private and untouched.",
    },
    {
      title: "Your Privacy Matters",
      description: "We keep your personal information secure and strictly private. Only the specific officers handling your case can ever access your details.",
    },
    {
      title: "Direct Help, No Waiting",
      description: "We cut out the middleman. Your reports are sent straight to the right local authorities so that action can be taken quickly.",
    },
    {
      title: "Clear, Simple Tracking",
      description: "Every report gets a unique ID, giving you a simple way to check exactly what is happening with your case at any time.",
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 border-b border-slate-200">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-10">
        <div className="grid gap-10 lg:grid-cols-3 items-start">
          
          <div className="lg:sticky lg:top-24 flex flex-col items-start max-w-md">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Why Choose JusticeEye?
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl leading-tight">
              A Platform You Can Count On
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              We built JusticeEye to make reporting crime easier, safer, and much more transparent for everyone.
            </p>
          </div>

          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
            {points.map((point) => (
              <div 
                key={point.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/30 p-6 transition-all duration-200 hover:border-blue-400 hover:bg-white"
              >
                <h3 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                  {point.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {point.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyJusticeEye;