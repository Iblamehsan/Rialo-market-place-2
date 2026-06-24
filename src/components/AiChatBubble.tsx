import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Sparkles, Send, Loader } from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "What is Rialo?",
  "How does passive yield accrue?",
  "Are asset fractions minted as NFTs?",
  "What are unverified user listings?",
  "How do I check my transactions?",
];

export default function AiChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Welcome to Rialo! I am your AI Concierge. Ask me anything about fractionalized luxury RWAs, continuous yield farms, on-chain NFT deeds, or platform security.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Append user message
    const userMsg: Message = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.error || "I ran into a small hurdle compiling your query. Please make sure my GEMINI_API_KEY is configured in your Secrets panel.",
          },
        ]);
      }
    } catch (error) {
      console.error("AI Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Unable to establish secure uplink with Rialo AI mainframe. Please check your internet connection.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end select-none font-sans">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] h-[500px] bg-white rounded-3xl border border-zinc-200/80 shadow-2xl overflow-hidden flex flex-col animate-fade-in">
          {/* Header */}
          <div className="bg-zinc-950 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                  Rialo AI Concierge
                </h3>
                <span className="flex items-center gap-1 text-[8px] text-zinc-400 font-mono">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini Core Online
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 scrollbar-thin bg-[#FAF9F6]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-zinc-950 text-white font-medium"
                      : "bg-white text-zinc-800 border border-zinc-200/50 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 border border-zinc-200/50 shadow-sm flex items-center gap-2 text-zinc-400 text-xs">
                  <Loader className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>AI Concierge is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested chips container */}
          {messages.length < 4 && (
            <div className="px-4 py-2 bg-[#FAF9F6] border-t border-zinc-100/50">
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
                Suggested Q&A
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="text-[10px] font-semibold bg-white hover:bg-zinc-100 border border-zinc-200/60 rounded-xl px-2.5 py-1 text-zinc-600 transition shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 bg-white border-t border-zinc-100 flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about NFTs, Yield, Listings..."
              disabled={isLoading}
              className="flex-grow bg-zinc-50 border border-zinc-200/60 rounded-xl px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 bg-zinc-950 hover:bg-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-300 text-white flex items-center justify-center rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-zinc-950 hover:bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-2xl border border-zinc-800 hover:border-emerald-400 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer relative group ring-4 ring-emerald-500/10 hover:ring-emerald-500/20"
        title="Rialo AI Concierge"
      >
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse"></span>
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />}
      </button>
    </div>
  );
}
