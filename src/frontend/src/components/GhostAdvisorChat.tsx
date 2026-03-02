import { useAdvisorContext } from "@/context/AdvisorContext";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import { Ghost, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Markdown-like bold renderer ────────────────────────────────
function FormattedText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const key = `line-${i}`;
        if (!line.trim()) return <div key={key} className="h-1" />;
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={key} className="leading-relaxed">
            {parts.map((part, j) => {
              const partKey = `part-${i}-${j}`;
              return j % 2 === 1 ? (
                <strong key={partKey} className="font-bold text-white/95">
                  {part}
                </strong>
              ) : (
                <span key={partKey}>{part}</span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

// ── Typing indicator ────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[oklch(0.25_0.08_290)] text-base">
        👻
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[oklch(0.18_0.04_280)] px-4 py-3">
        <span
          className="h-1.5 w-1.5 rounded-full bg-white/50"
          style={{
            animation: "advisor-dot-bounce 1.2s ease-in-out 0s infinite",
          }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-white/50"
          style={{
            animation: "advisor-dot-bounce 1.2s ease-in-out 0.2s infinite",
          }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-white/50"
          style={{
            animation: "advisor-dot-bounce 1.2s ease-in-out 0.4s infinite",
          }}
        />
      </div>
    </div>
  );
}

// ── Message bubble ──────────────────────────────────────────────
function MessageBubble({
  role,
  content,
  timestamp,
}: {
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}) {
  const time = timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (role === "ai") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-end gap-2"
      >
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[oklch(0.25_0.08_290)] text-base select-none">
          👻
        </div>
        <div className="max-w-[85%] space-y-1">
          <div className="rounded-2xl rounded-bl-sm bg-[oklch(0.18_0.04_280)] px-4 py-3 text-sm text-white/85">
            <FormattedText content={content} />
          </div>
          <p className="pl-1 text-[10px] text-white/30">{time}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-end justify-end gap-2"
    >
      <div className="max-w-[85%] space-y-1">
        <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-[oklch(0.45_0.18_290)] to-[oklch(0.38_0.15_280)] px-4 py-3 text-sm text-white/95">
          {content}
        </div>
        <p className="pr-1 text-right text-[10px] text-white/30">{time}</p>
      </div>
    </motion.div>
  );
}

// ── Main chat component ─────────────────────────────────────────
export default function GhostAdvisorChat() {
  const {
    isOpen,
    setIsOpen,
    analysisContext,
    hasUnseenAdvice,
    markAdviceSeen,
  } = useAdvisorContext();
  const {
    messages,
    isLoading,
    sendMessage,
    loadAnalysisAdvice,
    clearMessages,
  } = useAdvisorChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputText, setInputText] = useState("");
  const loadedCtxRef = useRef<string | null>(null);

  // Auto-scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — scroll on message/loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load advice when panel opens with new analysis context
  useEffect(() => {
    if (!isOpen || !analysisContext) return;

    const ctxId = `${analysisContext.score}-${analysisContext.riskCategory}`;
    if (loadedCtxRef.current !== ctxId) {
      loadedCtxRef.current = ctxId;
      markAdviceSeen();
      loadAnalysisAdvice(analysisContext);
    }
  }, [isOpen, analysisContext, loadAnalysisAdvice, markAdviceSeen]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (hasUnseenAdvice) {
      markAdviceSeen();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendMessage(text);
  }, [inputText, isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 500) {
      setInputText(val);
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
    }
  };

  const handleClear = () => {
    clearMessages();
    loadedCtxRef.current = null;
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        type="button"
        onClick={handleOpen}
        aria-label="Open GhostIQ Advisor"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.32_0.12_290)] to-[oklch(0.22_0.08_280)] shadow-[0_0_24px_oklch(0.62_0.22_290_/_0.45)] transition-shadow duration-300 hover:shadow-[0_0_36px_oklch(0.62_0.22_290_/_0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.22_290)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <Ghost className="h-6 w-6 text-white" />
        {/* Unseen advice indicator */}
        <AnimatePresence>
          {hasUnseenAdvice && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-[oklch(0.75_0.2_145)] ring-2 ring-background"
              style={{
                animation: "advisor-dot-pulse 1.5s ease-in-out infinite",
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.dialog
            open
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 right-0 z-50 m-0 flex h-[520px] w-full flex-col rounded-t-2xl border border-[oklch(0.62_0.22_290_/_0.25)] bg-[oklch(0.12_0.04_280_/_0.97)] p-0 shadow-[0_8px_40px_oklch(0.62_0.22_290_/_0.3)] backdrop-blur-xl sm:bottom-6 sm:right-6 sm:h-[560px] sm:w-[380px] sm:rounded-2xl"
            aria-label="GhostIQ Advisor Chat"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[oklch(0.62_0.22_290_/_0.2)] px-4 py-3.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.32_0.12_290)] to-[oklch(0.22_0.08_280)] text-xl shadow-[0_0_12px_oklch(0.62_0.22_290_/_0.4)]">
                👻
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-sm font-bold leading-tight text-white">
                  GhostIQ Advisor
                </h2>
                <p className="truncate text-[11px] leading-tight text-[oklch(0.65_0.12_290)]">
                  AI Relationship Analyst
                </p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-lg px-2 py-1 text-[10px] text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                    title="Clear conversation"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                  aria-label="Close advisor"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.length === 0 && !isLoading && (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-8 text-center">
                  <div className="animate-ghost-float select-none text-5xl">
                    👻
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-display text-sm font-semibold text-white/80">
                      GhostIQ Advisor
                    </p>
                    <p className="max-w-[220px] text-xs leading-relaxed text-white/40">
                      Run an analysis to get personalized relationship advice,
                      or ask me anything.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}

              {isLoading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-[oklch(0.62_0.22_290_/_0.2)] p-3">
              <div className="flex items-end gap-2 rounded-xl border border-[oklch(0.62_0.22_290_/_0.2)] bg-[oklch(0.16_0.03_280)] px-3 py-2.5 transition-colors focus-within:border-[oklch(0.62_0.22_290_/_0.5)]">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the advisor..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-white/90 placeholder:text-white/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ minHeight: "22px", maxHeight: "80px" }}
                  aria-label="Message input"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.55_0.22_290)] to-[oklch(0.45_0.18_280)] text-white shadow-[0_0_10px_oklch(0.62_0.22_290_/_0.3)] transition-all hover:shadow-[0_0_16px_oklch(0.62_0.22_290_/_0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[oklch(0.62_0.22_290)]"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-white/20">
                Shift+Enter for new line · {inputText.length}/500
              </p>
            </div>
          </motion.dialog>
        )}
      </AnimatePresence>
    </>
  );
}
