import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, Loader2 } from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmitModal: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

const PRESET_PROMPTS = [
  'What is the SLA timeframe for hostel plumbing & geyser issues?',
  'How does anonymous grievance submission protect my identity?',
  'How do I escalate an urgent mess food hygiene issue?',
  'Where is the Dean of Student Welfare (DSW) office located?',
];

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSubmitModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Namaste! I am your SRM Campus AI Welfare Assistant. Ask me about campus grievance policies, SLA resolution timelines, anonymous submission rules, or assistance drafting a complaint!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'policy_qa', text: query }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.answer || 'Thank you. I am here to help guide your campus grievance process.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'NICAW Campus Policy Summary:\n\n1. Urgent tickets (Mess Hygiene/Safety) have a 12-hour resolution SLA.\n2. Hostel & Electrical repairs have a 24-48 hour SLA.\n3. Click "Log Complaint" to file an official grievance.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-orange-300">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <h3 className="font-extrabold text-sm text-white">Campus AI Assistant</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-2.5 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-orange-600/20 text-orange-300 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3 rounded-2xl ${
                  m.sender === 'user'
                    ? 'bg-orange-600 text-white rounded-tr-none font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line leading-relaxed'
                }`}
              >
                <p>{m.text}</p>
                <p className="text-[9px] opacity-60 text-right mt-1 font-mono">{m.time}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-orange-400 text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking campus welfare policies...</span>
            </div>
          )}
        </div>

        {/* Quick Presets Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Suggested Questions
          </p>
          <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto">
            {PRESET_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-left text-[11px] bg-slate-900 hover:bg-orange-950/40 text-orange-200 border border-slate-800 hover:border-orange-500/40 p-2 rounded-xl transition-all cursor-pointer line-clamp-1"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI about policies, SLAs, drafting..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
