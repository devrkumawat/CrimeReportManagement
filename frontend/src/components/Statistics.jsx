const Statistics = ({ analyticalStats }) => {
  const metrics = [
    {
      value: analyticalStats?.resolutionRate ?? "94%",
      label: "Cases Resolved",
      description: "The percentage of reports that our team successfully verified and resolved for citizens this year.",
      accentClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      value: analyticalStats?.responseTime ?? "15m",
      label: "Avg. Response Time",
      description: "The average time it takes for our system to route your report to the right team after you hit submit.",
      accentClass: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      value: analyticalStats?.activeUnits ?? "180+",
      label: "Active Locations",
      description: "The number of police stations and local authorities actively connected to the JusticeEye network.",
      accentClass: "text-slate-900 bg-slate-100 border-slate-200",
    },
  ];

  return (
    <section id="statistics" className="bg-slate-50 py-8 sm:py-10 border-b border-slate-200">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-10">
        
        <div className="grid gap-8 lg:grid-cols-3 items-center">
          
          <div className="flex flex-col items-start max-w-md">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              System Performance
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Real-Time Impact Metrics
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              We believe in being open about how we work. Here is how JusticeEye is helping authorities respond faster and more effectively to public reports.
            </p>
          </div>

          <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div 
                key={metric.label}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm min-h-45"
              >
                <div>
                  <span className={`inline-block text-2xl font-bold tracking-tight px-3 py-1 rounded-xl border ${metric.accentClass}`}>
                    {metric.value}
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-slate-900 tracking-tight">
                    {metric.label}
                  </h3>
                </div>
                <p className="mt-2 text-[11px] leading-4 text-slate-500">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Statistics;