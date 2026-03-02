import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// Capped at 10 for performance
const CONFETTI_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const PARTICLE_INDICES = [0, 1, 2, 3] as const;

interface GhostReactionProps {
  score: number;
  sentimentResult: string;
  riskCategory: "Low" | "Medium" | "High";
}

const LOW_MESSAGES = [
  "Relax, you're safe 👀",
  "No ghost detected.",
  "They're still emotionally invested.",
];

const MEDIUM_MESSAGES = [
  "Something feels off...",
  "Energy shift detected.",
  "Response pattern unstable.",
];

const HIGH_MESSAGES = [
  "Prepare emotionally 💀",
  "High ghosting probability detected.",
  "Emotional damage loading...",
];

const ghostEmojis = { Low: "😊", Medium: "😐", High: "😱" };

const ghostGlows = {
  Low: "drop-shadow(0 0 16px oklch(0.72 0.15 195 / 0.8))",
  Medium: "drop-shadow(0 0 14px oklch(0.72 0.18 55 / 0.7))",
  High: "drop-shadow(0 0 18px oklch(0.65 0.25 27 / 0.9))",
};

function ConfettiDot({ index }: { index: number }) {
  const colors = [
    "oklch(0.72 0.15 195)",
    "oklch(0.62 0.22 290)",
    "oklch(0.85 0.2 95)",
    "oklch(0.75 0.2 150)",
    "oklch(0.8 0.15 220)",
  ];
  const color = colors[index % colors.length];
  const left = `${10 + ((index * 17) % 80)}%`;
  const delay = `${(index * 0.15) % 1.5}s`;
  const size = 4 + (index % 4);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 0,
        width: size,
        height: size,
        borderRadius: index % 2 === 0 ? "50%" : "0",
        background: color,
        animation: `confetti-fall ${1.2 + ((index * 0.1) % 0.8)}s ease-in forwards`,
        animationDelay: delay,
      }}
    />
  );
}

function AnimatedScore({ score }: { score: number }) {
  // CSS counter animation via motion component — no JS rAF loop
  return (
    <motion.span
      key={score}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {score}
    </motion.span>
  );
}

function ScoreRing({
  score,
  riskCategory,
}: {
  score: number;
  riskCategory: "Low" | "Medium" | "High";
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColors = {
    Low: "oklch(0.72 0.15 195)",
    Medium: "oklch(0.72 0.18 55)",
    High: "oklch(0.65 0.25 27)",
  };

  return (
    <svg
      width="100"
      height="100"
      style={{ transform: "rotate(-90deg)" }}
      role="img"
      aria-label={`Ghosting risk score: ${score}%`}
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="oklch(0.22 0.02 280)"
        strokeWidth="8"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={strokeColors[riskCategory]}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition:
            "stroke-dashoffset 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          filter: `drop-shadow(0 0 6px ${strokeColors[riskCategory]})`,
        }}
      />
    </svg>
  );
}

export default function GhostReaction({
  score,
  sentimentResult,
  riskCategory,
}: GhostReactionProps) {
  const messagePool =
    riskCategory === "Low"
      ? LOW_MESSAGES
      : riskCategory === "Medium"
        ? MEDIUM_MESSAGES
        : HIGH_MESSAGES;

  const message = useRef(
    messagePool[Math.floor(Math.random() * messagePool.length)],
  ).current;

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (riskCategory === "Low") {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(t);
    }
  }, [riskCategory]);

  const bgStyles = {
    Low: "bg-gradient-to-br from-[oklch(0.1_0.03_220)] via-[oklch(0.12_0.04_260)] to-[oklch(0.1_0.02_200)] animate-gradient-pulse",
    Medium:
      "bg-gradient-to-br from-[oklch(0.12_0.04_40)] via-[oklch(0.1_0.02_280)] to-[oklch(0.12_0.04_300)] animate-gradient-pulse",
    High: "bg-gradient-to-br from-[oklch(0.1_0.06_15)] via-[oklch(0.08_0.04_0)] to-[oklch(0.08_0.02_280)] animate-gradient-pulse animate-flicker",
  };

  const ghostAnimClass = {
    Low: "animate-ghost-float",
    Medium: "animate-ghost-pulse",
    High: "animate-ghost-shake",
  };

  const riskColors = {
    Low: "text-[oklch(0.72_0.15_195)]",
    Medium: "text-[oklch(0.72_0.18_55)]",
    High: "text-[oklch(0.65_0.25_27)]",
  };

  const badgeVariants = {
    Low: "bg-[oklch(0.72_0.15_195_/_0.15)] text-[oklch(0.82_0.12_195)] border-[oklch(0.72_0.15_195_/_0.3)]",
    Medium:
      "bg-[oklch(0.72_0.18_55_/_0.15)] text-[oklch(0.82_0.15_55)] border-[oklch(0.72_0.18_55_/_0.3)]",
    High: "bg-[oklch(0.65_0.25_27_/_0.15)] text-[oklch(0.75_0.2_27)] border-[oklch(0.65_0.25_27_/_0.3)]",
  };

  const particleColor =
    riskCategory === "Low"
      ? "oklch(0.72 0.15 195)"
      : riskCategory === "Medium"
        ? "oklch(0.72 0.18 55)"
        : "oklch(0.65 0.25 27)";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative overflow-hidden rounded-2xl border border-border p-8 ${bgStyles[riskCategory]} ${riskCategory === "High" ? "animate-card-shake animate-glow-pulse" : ""}`}
      >
        {/* Confetti for low risk */}
        {showConfetti && riskCategory === "Low" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {CONFETTI_INDICES.map((i) => (
              <ConfettiDot key={`dot-${i}`} index={i} />
            ))}
          </div>
        )}

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
          {PARTICLE_INDICES.map((i) => (
            <div
              key={`particle-${i}`}
              style={{
                position: "absolute",
                width: 3 + (i % 3),
                height: 3 + (i % 3),
                borderRadius: "50%",
                left: `${15 + i * 14}%`,
                bottom: 0,
                background: particleColor,
                animation: `particle-float ${2 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 text-center">
          {/* Score ring + percentage */}
          <div className="relative flex items-center justify-center">
            <ScoreRing score={score} riskCategory={riskCategory} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`font-display text-2xl font-bold leading-none ${riskColors[riskCategory]}`}
              >
                <AnimatedScore score={score} />%
              </span>
            </div>
          </div>

          {/* Ghost emoji with spring animation on category change */}
          <motion.div
            key={riskCategory}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`text-6xl select-none ${ghostAnimClass[riskCategory]}`}
            style={{ filter: ghostGlows[riskCategory] }}
          >
            {ghostEmojis[riskCategory]}
          </motion.div>

          {/* Message with fade-in */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-display text-xl font-bold text-foreground"
          >
            {message}
          </motion.p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeVariants[riskCategory]}`}
            >
              {riskCategory} Risk
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
              Sentiment: {sentimentResult}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
