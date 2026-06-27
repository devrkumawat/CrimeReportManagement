import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I track the status of my filed complaint?",
      answer: "Every complaint is assigned a unique Tracking ID upon submission. You can view the real-time status of your file (Pending, Under Investigation, or Resolved) directly from your personalized User Dashboard.",
    },
    {
      question: "What is the officer assignment process?",
      answer: "Once a complaint is filed, our system routes it to the nearest municipal cluster based on your reported location. An authorized officer is then assigned to audit your evidence and oversee the investigation.",
    },
    {
      question: "What file formats are supported for evidence?",
      answer: "You can upload images (JPG, PNG), video files (MP4, MOV), and documents (PDF) directly through the Report module. Our system secures these files in our encrypted vault for investigative review.",
    },
    {
      question: "Is my data secure within the JusticeEye system?",
      answer: "Yes. All incident reports, evidence files, and user metadata are encrypted during transmission and stored within our secure database. Access is strictly limited to authorized administrative and law enforcement personnel.",
    },
  ];

  return (
    <section id="faq" className="bg-slate-50 py-8 sm:py-10 border-b border-slate-200">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-10">
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="flex flex-col items-start max-w-md">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Information Desk
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Answers to common queries regarding the filing process, evidence handling, and case tracking within the JusticeEye ecosystem.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between text-left px-5 py-4 font-bold text-sm tracking-tight text-slate-900 hover:bg-slate-50/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" 
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div className={`transition-all duration-200 ease-in-out overflow-hidden ${isOpen ? "max-h-40 border-t border-slate-100" : "max-h-0"}`}>
                    <p className="p-5 text-xs leading-5 text-slate-600 bg-slate-50/20">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;