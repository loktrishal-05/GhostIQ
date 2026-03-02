import { createContext, useContext, useState } from "react";

export interface AnalysisContext {
  score: number;
  replyDelay: number;
  seenIgnoredFrequency: number;
  messageLengthReduction: number;
  initiationRatio: number;
  toneChange: number;
  socialMediaActivity: number;
  sentimentResult: string;
  riskCategory: "Low" | "Medium" | "High";
  userMessage: string;
}

interface AdvisorContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  analysisContext: AnalysisContext | null;
  setAnalysisContext: (ctx: AnalysisContext | null) => void;
  triggerAdvisor: (ctx: AnalysisContext) => void;
  hasUnseenAdvice: boolean;
  markAdviceSeen: () => void;
}

const AdvisorContext = createContext<AdvisorContextValue | null>(null);

export function AdvisorProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysisContext, setAnalysisContext] =
    useState<AnalysisContext | null>(null);
  const [hasUnseenAdvice, setHasUnseenAdvice] = useState(false);

  const triggerAdvisor = (ctx: AnalysisContext) => {
    setAnalysisContext(ctx);
    setHasUnseenAdvice(true);
    setIsOpen(true);
  };

  const markAdviceSeen = () => {
    setHasUnseenAdvice(false);
  };

  return (
    <AdvisorContext.Provider
      value={{
        isOpen,
        setIsOpen,
        analysisContext,
        setAnalysisContext,
        triggerAdvisor,
        hasUnseenAdvice,
        markAdviceSeen,
      }}
    >
      {children}
    </AdvisorContext.Provider>
  );
}

export function useAdvisorContext() {
  const ctx = useContext(AdvisorContext);
  if (!ctx) {
    throw new Error("useAdvisorContext must be used within AdvisorProvider");
  }
  return ctx;
}
