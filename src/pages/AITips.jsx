import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '../api/base44Client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import ReactMarkdown from 'react-markdown';
import { 
  Lightbulb, 
  Send, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Flame, 
  Volume2 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AITips() {
  // ── ChatGPT Chat States ──────────────────────────────────────────────────
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Career Coach. Ask me any interview prep or career question, and I will give you a quick 1-2 line tip!' }
  ]);
  const [question, setQuestion] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingChat]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || loadingChat) return;

    const userMsg = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoadingChat(true);

    try {
      // Build conversation context
      const chatHistory = messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`).join('\n');
      
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert technical recruiting coach and career advisor.
Answer the candidate's career question.
Strict Constraint: Provide a response of EXACTLY one or two sentences (1-2 lines) only. Do not exceed 2 sentences.

Previous chat history:
${chatHistory}

New Question: ${userMsg}`
      });

      const responseText = (res.text || res || "I could not resolve an advice response at this time.").trim();
      
      // Ensure the response is short and punchy
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (err) {
      console.error("Coach chat error:", err);
      toast.error("Failed to query career coach.");
    } finally {
      setLoadingChat(false);
    }
  };

  const prepTips = [
    {
      title: "STAR Method",
      desc: "Answer questions using: Situation (setup) ➜ Task (goal) ➜ Action (what you did) ➜ Result (final outcome).",
      icon: MessageSquare,
      color: "text-violet-400"
    },
    {
      title: "Resume Keywords",
      desc: "Use strong action words (like 'Created', 'Designed', 'Launched') instead of passive words ('helped with', 'worked on').",
      icon: FileText,
      color: "text-cyan-400"
    },
    {
      title: "Speaking Speed",
      desc: "Speak slowly and clearly, aiming for 130-150 words per minute. Pause when needed instead of saying 'um' or 'ah'.",
      icon: Volume2,
      color: "text-emerald-400"
    },
    {
      title: "Unanswered Questions",
      desc: "If you don't know an answer, don't worry! Explain your basic design thinking and how you would search for the solution.",
      icon: Flame,
      color: "text-rose-400"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-4 pb-16">
      
      {/* Header */}
      <div className="space-y-1.5 border-b border-white/5 pb-4">
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          Career Coaching & Tips <Lightbulb className="text-slate-400 w-6 h-6 animate-pulse" />
        </h2>
        <p className="text-sm text-slate-400">Master your mock preparation guidelines or consult our interactive AI Career Advisor directly.</p>
      </div>

      {/* Grid of Simplified default tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prepTips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div key={tip.title} className="glass p-5 rounded-xl border border-white/5 flex gap-4 hover:border-white/10 hover:bg-white/3 transition-all duration-200">
              <div className="p-2.5 h-10 w-10 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center shrink-0">
                <Icon className={`w-5 h-5 ${tip.color}`} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">{tip.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ChatGPT-style Advisor Chat Card */}
      <div className="glass border border-white/8 rounded-2xl overflow-hidden shadow-2xl bg-[#0b0c16]/90 flex flex-col h-[500px]">
        {/* Chat Header */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-violet-500/5 to-blue-500/5 px-6 py-4 border-b border-white/5">
          <Sparkles className="text-violet-400 w-5 h-5 animate-pulse" />
          <div>
            <h3 className="text-sm font-black text-white">Ask the AI Career Coach</h3>
            <p className="text-[10px] text-slate-500">Formulates instant, actionable 1-2 sentence career replies</p>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-lg ${
                m.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-none'
                  : 'bg-[#15162a] border border-white/5 text-slate-200 rounded-bl-none'
              }`}>
                {m.role === 'assistant' ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span>{m.content}</span>
                )}
              </div>
            </div>
          ))}
          {loadingChat && (
            <div className="flex justify-start">
              <div className="bg-[#15162a] border border-white/5 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-400 flex items-center gap-2 shadow-lg">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                <span>Coach is thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleAsk} className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything, e.g., 'How do I introduce myself?' or 'CV tips'..."
            className="flex-1 text-xs"
            disabled={loadingChat}
          />
          <Button type="submit" disabled={loadingChat || !question.trim()} className="px-4 bg-violet-600 hover:bg-violet-500">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
