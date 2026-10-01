import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export type AITutorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTrack?: string;
  trackTitle?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: string;
};

const SUGGESTIONS_BY_TRACK: Record<string, string[]> = {
  dsa: [
    "Explain Two Pointers technique with an example",
    "How does QuickSort choose its pivot and what is its complexity?",
    "What is the difference between BFS and DFS?",
    "Explain Dynamic Programming memoization vs tabulation",
  ],
  databases: [
    "Why are B-Trees used for database indexing instead of Binary Search Trees?",
    "What are ACID properties in DBMS with real-world examples?",
    "How does PostgreSQL handle concurrency and MVCC?",
    "Explain Normalization from 1NF to 3NF simply",
  ],
  frontend: [
    "How does the React Virtual DOM diffing algorithm work?",
    "Explain CSS Flexbox vs CSS Grid and when to use each",
    "What causes unnecessary re-renders in React and how to prevent them?",
    "Explain Promises vs async/await in JavaScript",
  ],
  backend: [
    "How does Node.js handle non-blocking asynchronous I/O with libuv?",
    "Compare REST vs GraphQL vs gRPC architectures",
    "What is horizontal vs vertical scaling in system design?",
    "How does JWT token authentication work and how to store it safely?",
  ],
  languages: [
    "Explain Pointers vs References in C++",
    "How does Java Garbage Collection work (Generational GC)?",
    "Differences between Python List, Tuple, and Set in memory and speed",
    "Explain memory allocation: Stack vs Heap in C/C++",
  ],
  "data-analyst": [
    "Explain SQL window functions (ROW_NUMBER vs RANK vs DENSE_RANK)",
    "What are common Pandas data manipulation patterns for missing data?",
    "Difference between CTE (Common Table Expressions) and Subqueries",
    "How to calculate running totals and moving averages in SQL",
  ],
  aiml: [
    "Explain Overfitting vs Underfitting and techniques to prevent them",
    "How does Gradient Descent optimize neural network weights?",
    "Difference between Supervised, Unsupervised, and Reinforcement Learning",
    "What is Cross-Entropy loss and why is it used for classification?",
  ],
  default: [
    "Explain Two Pointers technique with a practical example",
    "Why are B-Trees preferred for database indexes?",
    "How does the JavaScript Event Loop work under the hood?",
    "How should I structure my preparation for coding interviews?",
  ],
};

export function AITutorModal({
  isOpen,
  onClose,
  initialTrack,
  trackTitle,
}: AITutorModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tutorMutation = trpc.tutor.ask.useMutation();
  const { data: statusData } = trpc.tutor.status.useQuery(undefined, {
    enabled: isOpen,
    staleTime: 60_000,
  });

  const suggestions =
    initialTrack && SUGGESTIONS_BY_TRACK[initialTrack]
      ? SUGGESTIONS_BY_TRACK[initialTrack]
      : SUGGESTIONS_BY_TRACK.default;

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, tutorMutation.isPending]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || tutorMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");

    try {
      const response = await tutorMutation.mutateAsync({
        question: textToSend,
        history: newHistory.map(m => ({ role: m.role, content: m.content })),
        track: initialTrack,
      });

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        model: response.model,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "⚠️ I encountered a temporary connection glitch. Please check your internet or retry your question in a moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-tutor-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-3xl h-[88vh] max-h-[820px] bg-[#FAF7F2] border border-[#DECCA6] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#1C1814]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="px-5 py-4 bg-[#FAF5EE] border-b border-[#DECCA6]/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FAF1DF] to-[#EBD7B0] border border-[#D4AF37]/50 flex items-center justify-center text-[#B45309] shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="ai-tutor-title" className="text-base sm:text-lg font-serif font-bold text-[#1C1814] tracking-tight">
                  UNSTUCK AI Tutor
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#10B981]/10 text-[#065F46] border border-[#10B981]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  Online
                </span>
                {(statusData as any)?.dualEngineEnabled && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#B45309]/10 text-[#7C2D12] border border-[#D4AF37]/40" title="Google Gemini (Primary) + Groq (Failover) active">
                    🛡️ Dual-Engine Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-[#756858] mt-0.5">
                {trackTitle
                  ? `Active Track: ${trackTitle} · Conceptual Explanations & Code`
                  : "Instant help for DSA, Web Dev, Databases & Systems"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Clear Chat */}
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-1.5 text-[#756858] hover:text-[#7C2D12] hover:bg-[#F3EAD9] rounded-lg transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-[#756858] hover:text-[#1C1814] hover:bg-[#F3EAD9] rounded-lg transition-colors ml-1"
              title="Close Tutor (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Chat Messages Body */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FAF1DF] to-[#EBD7B0] border border-[#D4AF37]/50 flex items-center justify-center text-[#B45309] shadow-sm mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#1C1814]">
                How can I help you today?
              </h3>
              <p className="text-xs text-[#756858] mt-1.5 leading-relaxed">
                I'm your UNSTUCK AI Tutor. Ask me any conceptual question, interview doubt,
                code breakdown, or system design trade-off.
              </p>

              {/* Suggestions */}
              <div className="w-full mt-6 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A08866]">
                  Suggested Questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(suggestion)}
                      className="p-2.5 rounded-xl bg-white hover:bg-[#FAF1DF] border border-[#DECCA6]/70 hover:border-[#D4AF37] text-xs text-[#332A22] transition-all duration-150 hover:shadow-xs group flex items-start gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#B45309] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="leading-snug">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[#FAF1DF] border border-[#D4AF37]/40 flex items-center justify-center text-[#B45309] shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "bg-[#7C2D12] text-white rounded-tr-xs"
                      : "bg-[#FAF5EE] text-[#1C1814] border border-[#DECCA6]/80 rounded-tl-xs"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none text-[#1C1814] prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#1C1814] prose-p:my-1.5 prose-pre:bg-[#1E1B18] prose-pre:text-[#F3EAD9] prose-pre:rounded-xl prose-pre:p-3 prose-code:font-mono prose-code:text-xs prose-code:bg-[#EFE5D2] prose-code:text-[#7C2D12] prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  )}

                  {/* Message Footer */}
                  <div
                    className={`flex items-center justify-between gap-3 mt-2.5 pt-2 border-t text-[10px] ${
                      msg.role === "user"
                        ? "border-white/20 text-white/70"
                        : "border-[#DECCA6]/60 text-[#756858]"
                    }`}
                  >
                    <span>
                      {msg.role === "assistant" && msg.model
                        ? `⚡ ${msg.model}`
                        : msg.timestamp}
                    </span>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 hover:text-[#1C1814] transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#10B981]" />
                            <span className="text-[#10B981]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#7C2D12] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {tutorMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#FAF1DF] border border-[#D4AF37]/40 flex items-center justify-center text-[#B45309] shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#FAF5EE] border border-[#DECCA6]/80 rounded-2xl rounded-tl-xs p-4 flex items-center gap-2.5 text-xs text-[#756858]">
                <Loader2 className="w-4 h-4 animate-spin text-[#B45309]" />
                <span>UNSTUCK AI Tutor is formulating your answer...</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Input Box */}
        <footer className="p-3 sm:p-4 bg-[#FAF5EE] border-t border-[#DECCA6]/80 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2 bg-white rounded-xl border border-[#DECCA6] p-1.5 focus-within:border-[#B45309] focus-within:ring-2 focus-within:ring-[#B45309]/15 transition-all shadow-2xs"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g., 'Explain B-Trees vs Hash Indexes', 'Two Pointers in Python')..."
              rows={1}
              className="flex-1 max-h-32 min-h-[38px] p-2 bg-transparent text-xs sm:text-sm text-[#1C1814] placeholder-[#A08866] resize-none outline-none focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || tutorMutation.isPending}
              className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-[#B45309] to-[#D97706] hover:from-[#92400E] hover:to-[#B45309] text-white font-medium text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
              title="Send message"
            >
              {tutorMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Ask</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-[#A08866] mt-2 px-1">
            <span className="truncate pr-2">
              💡 Engine:{" "}
              <strong className="text-[#7C2D12]">
                {statusData?.activeModel || "Google Gemini ➔ Groq Auto-Failover"}
              </strong>
            </span>
            <span className="hidden sm:inline shrink-0">Press Enter to send, Shift+Enter for new line</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
