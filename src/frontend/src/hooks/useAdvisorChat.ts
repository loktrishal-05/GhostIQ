import type { AnalysisContext } from "@/context/AdvisorContext";
import { useActor } from "@/hooks/useActor";
import { generateLocalAdvice } from "@/utils/localAdvisor";
import { useCallback, useRef, useState } from "react";

export interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;

interface ChatHistoryItem {
  role: string;
  content: string;
}

export function useAdvisorChat() {
  const { actor } = useActor();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const analysisContextRef = useRef<AnalysisContext | null>(null);
  const conversationHistoryRef = useRef<ChatHistoryItem[]>([]);

  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
    // Track history for backend context window
    conversationHistoryRef.current = [
      ...conversationHistoryRef.current,
      { role: msg.role, content: msg.content },
    ].slice(-8); // Keep last 8 messages
  }, []);

  const getConversationHistory = useCallback((): ChatHistoryItem[] => {
    return conversationHistoryRef.current.slice(-6); // Send last 6 to backend
  }, []);

  const callBackendAdvice = useCallback(
    async (
      ctx: AnalysisContext,
      userMessage: string,
      history: ChatHistoryItem[],
    ): Promise<string | null> => {
      if (!actor) return null;
      try {
        const anyActor = actor as unknown as AnyActor;
        const result = (await anyActor.getAIAdvice({
          score: BigInt(ctx.score),
          replyDelay: BigInt(ctx.replyDelay),
          seenIgnoredFrequency: BigInt(ctx.seenIgnoredFrequency),
          messageLengthReduction: BigInt(ctx.messageLengthReduction),
          initiationRatio: BigInt(ctx.initiationRatio),
          toneChange: BigInt(ctx.toneChange),
          socialMediaActivity: BigInt(ctx.socialMediaActivity),
          sentimentResult: ctx.sentimentResult,
          userMessage,
          conversationHistory: history,
        })) as { success: boolean; advice: string; error: string };

        if (result?.success && result.advice) {
          return result.advice;
        }
        return null;
      } catch {
        return null; // Silently fall back to local advisor
      }
    },
    [actor],
  );

  const loadAnalysisAdvice = useCallback(
    async (ctx: AnalysisContext) => {
      analysisContextRef.current = ctx;
      conversationHistoryRef.current = [];
      setMessages([]);
      setIsLoading(true);

      try {
        // Try backend first (OpenAI), fall back to local
        let adviceText = await callBackendAdvice(ctx, "", []);

        if (!adviceText) {
          adviceText = generateLocalAdvice({
            score: ctx.score,
            riskCategory: ctx.riskCategory,
            sentimentResult: ctx.sentimentResult,
            replyDelay: ctx.replyDelay,
            seenIgnoredFrequency: ctx.seenIgnoredFrequency,
            initiationRatio: ctx.initiationRatio,
          });
        }

        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: "ai",
          content: adviceText,
          timestamp: new Date(),
        };
        setMessages([aiMsg]);
        // Add to history tracking
        conversationHistoryRef.current = [{ role: "ai", content: adviceText }];
      } finally {
        setIsLoading(false);
      }
    },
    [callBackendAdvice],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim().slice(0, 500);
      if (!trimmed) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      appendMessage(userMsg);
      setIsLoading(true);

      try {
        const ctx = analysisContextRef.current;
        const history = getConversationHistory();

        let adviceText: string | null = null;

        if (ctx) {
          adviceText = await callBackendAdvice(ctx, trimmed, history);
        }

        if (!adviceText) {
          adviceText = ctx
            ? generateLocalAdvice({
                score: ctx.score,
                riskCategory: ctx.riskCategory,
                sentimentResult: ctx.sentimentResult,
                replyDelay: ctx.replyDelay,
                seenIgnoredFrequency: ctx.seenIgnoredFrequency,
                initiationRatio: ctx.initiationRatio,
              })
            : "I'd need some context to give you useful advice. Try running an analysis first and I'll be able to give you personalized guidance.";
        }

        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: "ai",
          content: adviceText,
          timestamp: new Date(),
        };
        appendMessage(aiMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage, getConversationHistory, callBackendAdvice],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    analysisContextRef.current = null;
    conversationHistoryRef.current = [];
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    loadAnalysisAdvice,
    clearMessages,
  };
}
