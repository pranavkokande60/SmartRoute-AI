import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, User, Database, ShieldCheck,
  HelpCircle, Trash2, ArrowRight, CornerDownLeft, RefreshCw,
  Clock, GitFork, Package, TrendingUp, AlertTriangle
} from 'lucide-react';
import { api } from '../api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sourceMetric?: string;
  dataPoints?: any;
  suggestedFollowups?: string[];
  timestamp: string;
}

export const AIAssistantTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: (
        "Hello! I am your SmartRoute AI Logistics Assistant. " +
        "You can ask me questions about Nassau Candy's actual logistics operations, shipping performance, " +
        "carrier modes, factory corridors, and live customer orders.\n\n" +
        "All my responses are generated using safe, read-only analytics queries directly against the verified database."
      ),
      sourceMetric: "SmartRoute AI Safe Analytics Engine",
      suggestedFollowups: [
        "What is the average lead time?",
        "Which factory has the highest average lead time?",
        "Show me the top 5 inefficient routes.",
        "How many high-risk new orders are there?",
        "Which ship mode is fastest?",
        "How many shipments were made to California?",
        "Which region has the most shipments?"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendQuery = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askAssistant(q);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        sourceMetric: res.source_metric,
        dataPoints: res.data_points,
        suggestedFollowups: res.suggested_followups,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "Sorry, I encountered an issue accessing the logistics database. Please check your query or try again.",
        sourceMetric: "System Error Handler",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: "Conversation cleared. How can I assist you with your logistics data?",
        sourceMetric: "SmartRoute AI Analytics Engine",
        suggestedFollowups: [
          "What is the average lead time?",
          "Which factory has the highest average lead time?",
          "Show me the top 5 inefficient routes.",
          "How many shipments were made to California?"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-sky-400" />
            AI Logistics Assistant
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask analytical questions about actual historical shipments, route bottlenecks, factory performance, and active orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Read-Only Analytics Only</span>
          </div>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold border border-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0 select-none">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
          Try asking:
        </span>
        <button
          onClick={() => handleSendQuery("What is the average lead time?")}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-400 whitespace-nowrap transition-colors"
        >
          ⏱️ Average Lead Time
        </button>
        <button
          onClick={() => handleSendQuery("Which factory has the highest average lead time?")}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-400 whitespace-nowrap transition-colors"
        >
          🏭 Highest Lead-Time Factory
        </button>
        <button
          onClick={() => handleSendQuery("Show me the top 5 inefficient routes.")}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-400 whitespace-nowrap transition-colors"
        >
          ⚠️ Top 5 Inefficient Routes
        </button>
        <button
          onClick={() => handleSendQuery("Which ship mode is fastest?")}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-400 whitespace-nowrap transition-colors"
        >
          ⚡ Fastest Ship Mode
        </button>
        <button
          onClick={() => handleSendQuery("How many shipments were made to California?")}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-400 whitespace-nowrap transition-colors"
        >
          📍 California Shipments
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                isUser
                  ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-sky-400'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div className={`max-w-2xl rounded-2xl p-4 space-y-2.5 shadow-lg ${
                isUser
                  ? 'bg-indigo-600 text-white font-medium text-xs leading-relaxed rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed rounded-tl-none'
              }`}>
                {/* Formatted Text */}
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Verified Source Pill */}
                {msg.sourceMetric && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                      <Database className="w-3 h-3 text-sky-400" />
                      <span>{msg.sourceMetric}</span>
                    </span>
                    <span className="text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>
                )}

                {/* Suggested Follow-up Questions */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                      Suggested Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowups.map((fu, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendQuery(fu)}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-indigo-300 hover:text-white transition-all text-left flex items-center gap-1 group"
                        >
                          <span>{fu}</span>
                          <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>Querying verified logistics records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="shrink-0 flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about SmartRoute logistics data (e.g., 'What is the average lead time?')..."
          className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-white placeholder-slate-500 px-3 py-2 focus:outline-none focus:ring-0 font-medium"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white disabled:opacity-40 shadow-lg shadow-sky-600/20 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
