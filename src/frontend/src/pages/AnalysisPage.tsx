import GhostReaction from "@/components/GhostReaction";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useAdvisorContext } from "@/context/AdvisorContext";
import { useActor } from "@/hooks/useActor";
import { calculateGhostingScore } from "@/utils/ghostAlgorithm";
import { ChevronRight, FlaskConical, Loader2, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface SliderConfig {
  id: keyof SliderValues;
  label: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  color: string;
}

interface SliderValues {
  replyDelay: number;
  seenIgnoredFrequency: number;
  messageLengthReduction: number;
  initiationRatio: number;
  toneChange: number;
  socialMediaActivity: number;
}

const SLIDERS: SliderConfig[] = [
  {
    id: "replyDelay",
    label: "Reply Delay",
    description: "How long they take to reply",
    lowLabel: "Instant",
    highLabel: "Days",
    color: "oklch(0.62 0.22 290)",
  },
  {
    id: "seenIgnoredFrequency",
    label: "Seen Ignored Frequency",
    description: "How often messages are left on seen",
    lowLabel: "Never",
    highLabel: "Always",
    color: "oklch(0.65 0.25 27)",
  },
  {
    id: "messageLengthReduction",
    label: "Message Length Reduction",
    description: "How much shorter their replies have gotten",
    lowLabel: "Same length",
    highLabel: "Much shorter",
    color: "oklch(0.72 0.18 55)",
  },
  {
    id: "initiationRatio",
    label: "Initiation Ratio",
    description: "How often you start conversations",
    lowLabel: "Balanced",
    highLabel: "Always you",
    color: "oklch(0.62 0.22 290)",
  },
  {
    id: "toneChange",
    label: "Tone Change",
    description: "How much their tone has changed",
    lowLabel: "Same tone",
    highLabel: "Very different",
    color: "oklch(0.65 0.25 27)",
  },
  {
    id: "socialMediaActivity",
    label: "Social Media Activity",
    description: "Their social media activity level (higher = less risk)",
    lowLabel: "Inactive",
    highLabel: "Very active",
    color: "oklch(0.72 0.15 195)",
  },
];

function SliderInput({
  config,
  value,
  onChange,
}: {
  config: SliderConfig;
  value: number;
  onChange: (val: number) => void;
}) {
  const getRiskLevel = () => {
    if (config.id === "socialMediaActivity") {
      // Inverted: higher activity = less risk
      if (value >= 70) return "low";
      if (value >= 40) return "medium";
      return "high";
    }
    if (value <= 30) return "low";
    if (value <= 60) return "medium";
    return "high";
  };

  const riskColors = {
    low: "oklch(0.72 0.15 195)",
    medium: "oklch(0.72 0.18 55)",
    high: "oklch(0.65 0.25 27)",
  };

  const riskLevel = getRiskLevel();
  const indicatorColor = riskColors[riskLevel];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-display text-sm font-semibold text-foreground">
          {config.label}
        </Label>
        <span
          className="font-mono text-sm font-bold tabular-nums transition-all duration-200"
          style={{ color: indicatorColor }}
        >
          {value}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{config.description}</p>
      <div className="pt-1">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={0}
          max={100}
          step={1}
          className="w-full"
          style={
            {
              "--slider-thumb-color": indicatorColor,
              "--slider-track-color": indicatorColor,
            } as React.CSSProperties
          }
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/60">
          <span>{config.lowLabel}</span>
          <span>{config.highLabel}</span>
        </div>
      </div>
    </div>
  );
}

interface AnalysisResult {
  score: number;
  sentimentResult: string;
  riskCategory: "Low" | "Medium" | "High";
}

export default function AnalysisPage() {
  const { actor, isFetching } = useActor();
  const { triggerAdvisor } = useAdvisorContext();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [recentMessage, setRecentMessage] = useState("");

  const [sliderValues, setSliderValues] = useState<SliderValues>({
    replyDelay: 30,
    seenIgnoredFrequency: 20,
    messageLengthReduction: 15,
    initiationRatio: 40,
    toneChange: 20,
    socialMediaActivity: 60,
  });

  const updateSlider = (id: keyof SliderValues) => (val: number) => {
    setSliderValues((prev) => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async () => {
    setIsCalculating(true);
    try {
      const computed = calculateGhostingScore({
        ...sliderValues,
        recentMessage,
      });

      const id = crypto.randomUUID();
      const nowNs = BigInt(Date.now()) * BigInt(1_000_000);

      const record = {
        id,
        score: BigInt(computed.score),
        riskCategory: computed.riskCategory,
        sentimentResult: computed.sentimentResult,
        date: nowNs,
        inputData: {
          replyDelay: BigInt(sliderValues.replyDelay),
          seenIgnoredFrequency: BigInt(sliderValues.seenIgnoredFrequency),
          messageLengthReduction: BigInt(sliderValues.messageLengthReduction),
          initiationRatio: BigInt(sliderValues.initiationRatio),
          toneChange: BigInt(sliderValues.toneChange),
          socialMediaActivity: BigInt(sliderValues.socialMediaActivity),
          recentMessage,
        },
      };

      if (actor && !isFetching) {
        await actor.saveAnalysis(record);
      }

      setResult(computed);
      toast.success("Analysis complete!");

      // Trigger AI advisor with analysis context
      triggerAdvisor({
        score: computed.score,
        replyDelay: sliderValues.replyDelay,
        seenIgnoredFrequency: sliderValues.seenIgnoredFrequency,
        messageLengthReduction: sliderValues.messageLengthReduction,
        initiationRatio: sliderValues.initiationRatio,
        toneChange: sliderValues.toneChange,
        socialMediaActivity: sliderValues.socialMediaActivity,
        sentimentResult: computed.sentimentResult,
        riskCategory: computed.riskCategory,
        userMessage: recentMessage,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save analysis. Result is still shown.");
      // Still show result even if save failed
      const computed = calculateGhostingScore({
        ...sliderValues,
        recentMessage,
      });
      setResult(computed);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setRecentMessage("");
    setSliderValues({
      replyDelay: 30,
      seenIgnoredFrequency: 20,
      messageLengthReduction: 15,
      initiationRatio: 40,
      toneChange: 20,
      socialMediaActivity: 60,
    });
  };

  return (
    <div className="ghost-noise-bg min-h-full p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest mb-1">
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            <span>Behavioral Analysis</span>
          </div>
          <h1 className="font-display text-3xl font-black text-foreground lg:text-4xl">
            New Analysis
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Adjust all sliders and optionally paste a recent message, then
            calculate.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {result ? (
            /* Result view */
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <GhostReaction
                score={result.score}
                sentimentResult={result.sentimentResult}
                riskCategory={result.riskCategory}
              />

              <Card className="border-border bg-card/60">
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className="font-display text-2xl font-black text-foreground">
                        {result.score}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Risk Level
                      </p>
                      <p className="font-display text-lg font-bold text-foreground">
                        {result.riskCategory}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Sentiment</p>
                      <p className="font-display text-lg font-bold text-foreground">
                        {result.sentimentResult}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Reply Delay
                      </p>
                      <p className="font-display text-lg font-bold text-foreground">
                        {sliderValues.replyDelay}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full border-border font-display font-semibold"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Another Analysis
              </Button>
            </motion.div>
          ) : (
            /* Form view */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Sliders card */}
              <Card className="border-border bg-card/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-base font-bold">
                    Behavioral Signals
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Rate each behavioral dimension from 0 to 100
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-7">
                  {SLIDERS.map((config) => (
                    <SliderInput
                      key={config.id}
                      config={config}
                      value={sliderValues[config.id]}
                      onChange={updateSlider(config.id)}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Message input */}
              <Card className="border-border bg-card/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-base font-bold">
                    Sentiment Analysis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Optional: paste a recent message to boost accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={recentMessage}
                    onChange={(e) => setRecentMessage(e.target.value)}
                    placeholder="Paste a recent message from them... e.g. 'yeah maybe, idk kinda busy'"
                    className="min-h-[100px] resize-none border-input bg-background/50 text-sm font-mono placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    The AI will analyze positive/negative language patterns to
                    adjust the score.
                  </p>
                </CardContent>
              </Card>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={isCalculating || isFetching}
                className="w-full h-14 bg-primary text-primary-foreground font-display text-base font-bold hover:bg-primary/90 animate-violet-glow"
                size="lg"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <span className="mr-2 text-lg">👻</span>
                    Calculate Ghosting Probability
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
