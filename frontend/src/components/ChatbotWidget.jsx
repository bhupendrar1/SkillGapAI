import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2, ChevronDown, BookOpen } from 'lucide-react';
import { sendChatMessage, getChatHistory } from '../services/api';

export default function ChatbotWidget({ analysisContext, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'assistant',
      message: 'Hello! I am your **SkillGap AI Coach**.\n\nI can answer questions about your detected skill gaps, explain your match score formula, or build custom learning roadmaps for Docker, AWS, React, etc.\n\nHow can I help you today?'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load past history when opened if logged in
  useEffect(() => {
    if (isOpen && currentUser) {
      getChatHistory().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setMessages(res.data);
        }
      });
    }
  }, [isOpen, currentUser]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      message: text.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    const res = await sendChatMessage({
      message: text.trim(),
      analysisContext: analysisContext || null
    });

    setIsLoading(false);

    if (res.success) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          message: res.data.reply
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          message: 'Sorry, I encountered an issue connecting to the coach service. Please ensure the backend is active.'
        }
      ]);
    }
  };

  const quickPrompts = [
    'Why was my match score calculated like this?',
    'How do I learn Docker from scratch?',
    'Give me 3 technical interview questions for my gaps',
    'Recommend a 3-week study roadmap'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border border-white" />
          </div>
          <span>Ask AI Coach</span>
          <span className="hidden sm:inline-block text-[10px] bg-blue-500/80 px-2 py-0.5 rounded-full font-mono">
            Ground-Truth AI
          </span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="bg-white rounded-3xl w-[360px] sm:w-[420px] h-[540px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs">SkillGap AI Coach</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400">Context-Aware Career & Gap Advisor</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            {messages.map((m, idx) => {
              const isAssistant = m.sender === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      isAssistant
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                        : 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {m.message}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs py-1">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Coach is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="whitespace-nowrap bg-white text-slate-700 hover:text-blue-700 hover:border-blue-300 border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors shadow-2xs shrink-0 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about skills, score formula, or roadmaps..."
              className="flex-grow text-xs p-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

