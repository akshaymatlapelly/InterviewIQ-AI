import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(4); // Default to opening the 5th item (0-indexed) like in the screenshot

  const faqs = [
    {
      q: "How does the AI mock interview work?",
      a: "Our AI interviewer asks questions matching your targeted role, listens to spoken responses via browser speech-to-text, analyzes verbal speed/pauses, and generates scoring reports instantly."
    },
    {
      q: "How accurate is the resume analysis?",
      a: "The ATS scanner matches your resume text directly against job descriptions, identifying key skill gaps and keyword coverage with high accuracy."
    },
    {
      q: "How many interviews can I take per day?",
      a: "Standard users are allowed 2 mock sessions daily, while professional tier candidates can run up to 10 proctored rounds per day."
    },
    {
      q: "Is my data secure?",
      a: "Yes! Audio is transcribed locally using standard web speech models. User profiles and resume details are private and secure."
    },
    {
      q: "Can I download my feedback reports?",
      a: "Yes! After each interview, you receive a detailed AI feedback report that you can download as a PDF for your records."
    }
  ];

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#0b0c16]/10 border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-2">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 font-extrabold">Questions</span>
          </h2>
        </div>

        {/* Custom Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="bg-[#0e0f1d]/90 border border-white/5 rounded-xl transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:text-white"
                >
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    {faq.q}
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-violet-400' : ''
                    }`} 
                  />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-40 border-t border-white/5' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <div className="px-6 py-5 text-xs text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export default FAQSection;
