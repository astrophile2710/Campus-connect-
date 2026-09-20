import React, { useState } from 'react';
import { HelpCircle, PhoneCall, ShieldAlert, ChevronDown, ChevronUp, Building } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the SLA resolution timeframe work on SRM campus?',
    a: 'Every complaint registered on the SRM Campus Connect portal gets an official SLA clock based on priority: Urgent (Mess & Safety - 12 Hours), High (Hostel Plumbing & Electrical - 24 Hours), Medium (IT Wi-Fi & Academic Re-checking - 48 Hours), and Low (General Maintenance - 72 Hours). The Warden and Dean of Student Welfare (DSW) monitor SLA countdowns.',
  },
  {
    q: 'Can I submit a confidential or anonymous complaint using my RA Roll Number?',
    a: 'Yes. Toggling the "Submit Anonymously" option strips your RA Roll Number, Name, and Email from the officer view. An encrypted tracking code (e.g., CC-2024-105) is generated so you can monitor progress safely.',
  },
  {
    q: 'What is the procedure for Anti-Ragging complaints at SRM?',
    a: 'Ragging is strictly prohibited on campus under UGC guidelines. Students can file confidential anti-ragging complaints directly on this portal or call the National Anti-Ragging Helpline immediately at 1800-180-5522 (Toll Free).',
  },
  {
    q: 'How do I escalate an unresolved hostel or mess issue?',
    a: 'If a complaint remains pending past its SLA due date without caretaker or officer notes, click the "Escalate Ticket" button on your complaint details page to alert the Chief Hostel Warden and SRM DSW Office.',
  },
  {
    q: 'Who re-checks mid-term exam marks discrepancies?',
    a: 'Academic & Examination grievances are routed directly to the Controller of Examinations and subject course instructors at SRM Tech Park, who re-evaluate the answer script and update marks on the student ERP portal.',
  },
];

export const CampusHelpFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm text-center space-y-2">
        <div className="inline-flex p-3 bg-orange-600/20 text-orange-400 rounded-2xl mb-1">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">SRM Campus Grievance & Resolution Guidelines</h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Understand SLA resolution timelines, anonymous submission privacy protections, and Warden escalation paths.
        </p>
      </div>

      {/* Emergency Phone Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl text-rose-200 space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>Anti-Ragging Helpline</span>
          </div>
          <p className="text-lg font-black text-white">1800-180-5522</p>
          <p className="text-[11px] text-rose-300/80">Toll Free 24/7 • UGC Compliance</p>
        </div>

        <div className="bg-orange-950/40 border border-orange-500/30 p-4 rounded-2xl text-orange-200 space-y-2">
          <div className="flex items-center space-x-2 text-orange-400 font-bold text-xs">
            <Building className="w-4 h-4" />
            <span>Dean of Student Welfare (DSW)</span>
          </div>
          <p className="text-lg font-black text-white">+91 94111 00001</p>
          <p className="text-[11px] text-orange-300/80">Admin Block Room 102 (9AM - 5PM)</p>
        </div>

        <div className="bg-purple-950/40 border border-purple-500/30 p-4 rounded-2xl text-purple-200 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
            <PhoneCall className="w-4 h-4" />
            <span>SRM Warden Office</span>
          </div>
          <p className="text-lg font-black text-white">+91 94222 00002</p>
          <p className="text-[11px] text-purple-300/80">Paari & Kalpana Chawla Control Room</p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-400">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-white hover:text-orange-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-orange-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
