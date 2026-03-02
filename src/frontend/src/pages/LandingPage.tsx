import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  BarChart3,
  Brain,
  ChevronDown,
  ClipboardList,
  Ghost,
  Loader2,
  Lock,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { type Variants, motion } from "motion/react";

// ─── Static data ──────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Enter Behavior Data",
    description:
      "Adjust 6 behavioral sliders — reply delay, tone change, initiation ratio, and more.",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Analyzes Sentiment",
    description:
      "Our NLP engine scans message tone and language patterns for positive and negative signals.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Get Ghosting Risk Score",
    description:
      "Receive a 0–100% weighted probability score with animated reactions based on risk level.",
  },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "6 Behavioral Signals",
    description:
      "Analyze reply delay, message frequency, initiation ratio, and more with precision sliders.",
  },
  {
    icon: Brain,
    title: "NLP Sentiment Analysis",
    description:
      "Rule-based sentiment engine scans messages for positive and negative linguistic patterns.",
  },
  {
    icon: Zap,
    title: "Instant Risk Scoring",
    description:
      "Weighted algorithm computes a 0–100% ghosting probability in milliseconds.",
  },
  {
    icon: Ghost,
    title: "Animated Reactions",
    description:
      "Get expressive animated ghost reactions tailored to your risk level — Low, Medium, or High.",
  },
  {
    icon: Shield,
    title: "Encrypted on ICP",
    description:
      "Your analysis history is stored securely on the Internet Computer blockchain.",
  },
  {
    icon: Lock,
    title: "Decentralized Auth",
    description:
      "Login via Internet Identity — no passwords, no email, no central server.",
  },
];

// Pre-computed particles to avoid re-renders
interface Particle {
  id: string;
  width: number;
  height: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  isAccent: boolean;
}

const PARTICLES: Particle[] = Array.from({ length: 15 }, (_, i) => {
  // Deterministic pseudo-random using index
  const seed = (i * 7919 + 12345) % 10000;
  const s2 = (i * 6271 + 54321) % 10000;
  const s3 = (i * 3571 + 98765) % 10000;
  const s4 = (i * 5381 + 11111) % 10000;
  const s5 = (i * 2333 + 77777) % 10000;
  const s6 = (i * 4567 + 22222) % 10000;
  return {
    id: `particle-${i}`,
    width: 2 + (seed / 10000) * 3,
    height: 2 + (s2 / 10000) * 3,
    left: (s3 / 10000) * 100,
    top: (s4 / 10000) * 100,
    duration: 6 + (s5 / 10000) * 8,
    delay: (s6 / 10000) * 5,
    isAccent: i % 3 === 0,
  };
});

// ─── Motion variants ──────────────────────────────────────────────────────────

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.09 } },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 28 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 z-0 animate-landing-bg"
      style={{
        background: `linear-gradient(
          135deg,
          oklch(0.08 0.02 260) 0%,
          oklch(0.12 0.08 280) 20%,
          oklch(0.10 0.06 290) 40%,
          oklch(0.09 0.04 250) 60%,
          oklch(0.11 0.07 270) 80%,
          oklch(0.08 0.02 260) 100%
        )`,
      }}
    />
  );
}

function VignetteOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-10"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 40%, oklch(0.04 0 0 / 0.8) 100%)",
      }}
    />
  );
}

function ParticleLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className={`absolute rounded-full ${p.isAccent ? "bg-accent/20" : "bg-primary/20"}`}
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `particle-rise ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function HeroGhostSVG() {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-hero-ghost-float w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
      role="img"
      aria-label="Animated GhostIQ mascot ghost"
      style={{
        filter:
          "drop-shadow(0 0 40px oklch(0.62 0.22 290 / 0.7)) drop-shadow(0 20px 40px black)",
      }}
    >
      {/* Body */}
      <path
        d="M100 10 C50 10 20 45 20 90 L20 200 L40 185 L60 200 L80 185 L100 200 L120 185 L140 200 L160 185 L180 200 L180 90 C180 45 150 10 100 10 Z"
        fill="oklch(0.94 0.02 280)"
      />
      {/* Subtle inner highlight on top of body */}
      <ellipse
        cx="100"
        cy="60"
        rx="52"
        ry="32"
        fill="oklch(0.97 0.01 280)"
        opacity="0.5"
      />
      {/* Left eye socket */}
      <ellipse cx="78" cy="98" rx="18" ry="20" fill="white" />
      {/* Left pupil */}
      <circle cx="82" cy="100" r="10" fill="#0f0e1e" />
      {/* Left catchlight */}
      <circle cx="86" cy="95" r="3.5" fill="white" />
      {/* Right eye socket */}
      <ellipse cx="122" cy="98" rx="18" ry="20" fill="white" />
      {/* Right pupil */}
      <circle cx="118" cy="100" r="10" fill="#0f0e1e" />
      {/* Right catchlight */}
      <circle cx="122" cy="95" r="3.5" fill="white" />
      {/* Tiny smile */}
      <path
        d="M88 128 Q100 136 112 128"
        stroke="oklch(0.55 0.12 290)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Blushy cheeks */}
      <ellipse
        cx="64"
        cy="115"
        rx="9"
        ry="5"
        fill="oklch(0.75 0.12 340)"
        opacity="0.3"
      />
      <ellipse
        cx="136"
        cy="115"
        rx="9"
        ry="5"
        fill="oklch(0.75 0.12 340)"
        opacity="0.3"
      />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const scrollToHowItWorks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Layered background */}
      <AnimatedBackground />
      <VignetteOverlay />

      {/* ── Fixed Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5 backdrop-blur-md border-b border-white/5"
        style={{ background: "oklch(0.1 0 0 / 0.6)" }}
      >
        {/* Logo left */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 animate-violet-glow">
            <Ghost className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            GhostIQ
          </span>
        </div>

        {/* Actions right */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={login}
            disabled={isLoggingIn}
            className="border-primary/30 text-primary bg-transparent hover:bg-primary/10 hover:border-primary/50"
          >
            {isLoggingIn ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
          <Button
            size="sm"
            onClick={login}
            disabled={isLoggingIn}
            className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-semibold border-0 hover:scale-105 hover:shadow-[0_0_20px_oklch(0.62_0.22_290/0.5)] transition-all duration-200"
          >
            {isLoggingIn ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Get Started"
            )}
          </Button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="relative z-20 pt-[64px]">
        {/* ── Hero ── */}
        <section className="relative flex min-h-[calc(100vh-64px)] items-center px-5 lg:px-16 xl:px-24">
          <ParticleLayer />

          <div className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center py-16 lg:py-20">
            {/* LEFT — text */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="flex flex-col gap-6"
            >
              {/* Badge */}
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered Relationship Analytics
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl font-black tracking-tight leading-[1.08] text-foreground sm:text-6xl xl:text-7xl"
              >
                Predict Ghosting
                <br />
                <span className="text-gradient-ghost">Before It Happens</span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                variants={fadeUp}
                className="text-base text-muted-foreground leading-relaxed max-w-lg sm:text-lg"
              >
                Analyze behavioral signals and message sentiment to compute a
                weighted ghosting risk score — stored securely on the Internet
                Computer blockchain.
              </motion.p>

              {/* CTA buttons */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="h-12 px-8 bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-display font-bold text-base border-0 hover:scale-105 hover:shadow-[0_0_30px_oklch(0.62_0.22_290/0.6)] transition-all duration-300"
                >
                  {isLoggingIn ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : null}
                  Start Analysis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={scrollToHowItWorks}
                  className="h-12 px-8 border-primary/30 text-foreground bg-transparent hover:bg-primary/10 hover:border-primary/60 font-display font-semibold text-base transition-all duration-300"
                >
                  How It Works
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>

              {/* Trust line */}
              <motion.p
                variants={fadeUp}
                className="text-xs text-muted-foreground/70"
              >
                No password · No email · 100% decentralized · Powered by ICP
              </motion.p>
            </motion.div>

            {/* RIGHT — ghost */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex items-center justify-center mt-6 lg:mt-0"
            >
              <div className="relative flex items-center justify-center">
                {/* Outer glow ring */}
                <div
                  className="absolute h-80 w-80 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, oklch(0.62 0.22 290 / 0.25) 0%, transparent 70%)",
                  }}
                />
                {/* Inner pulsing ring */}
                <div
                  className="absolute h-64 w-64 rounded-full animate-ghost-pulse"
                  style={{
                    background:
                      "radial-gradient(circle, oklch(0.62 0.22 290 / 0.15) 0%, transparent 60%)",
                  }}
                />
                <HeroGhostSVG />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Internet Identity Login Band ── */}
        <section className="relative z-20 py-16 px-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-xl text-center"
          >
            <div
              className="rounded-2xl border border-primary/20 bg-card/30 backdrop-blur-md p-8"
              style={{
                boxShadow: "0 0 60px oklch(0.62 0.22 290 / 0.1)",
              }}
            >
              <div className="mb-4 text-4xl">👻</div>
              <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                Ready to find out?
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Login securely with Internet Identity — no passwords, no email.
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="h-12 w-full max-w-xs bg-primary text-primary-foreground font-display font-bold hover:bg-primary/90 animate-violet-glow"
              >
                {isLoggingIn ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Login with Internet Identity
              </Button>
            </div>
          </motion.div>
        </section>

        {/* ── How It Works ── */}
        <section
          id="how-it-works"
          className="relative z-20 px-5 lg:px-16 xl:px-24 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div variants={fadeUp} className="mb-10 text-center">
                <h2 className="font-display text-3xl font-black text-foreground sm:text-4xl">
                  How It Works
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Three simple steps to uncover the truth
                </p>
              </motion.div>

              <div className="grid gap-6 sm:grid-cols-3">
                {HOW_IT_WORKS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.step}
                      variants={fadeUp}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur-md"
                    >
                      <span className="pointer-events-none absolute -right-3 -top-4 font-display text-8xl font-black leading-none text-white/[0.04] select-none">
                        {step.step}
                      </span>
                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                            Step {step.step}
                          </p>
                          <h3 className="mb-2 font-display text-base font-bold text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Core Features ── */}
        <section className="relative z-20 px-5 lg:px-16 xl:px-24 py-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeUp} className="mb-10 text-center">
                <h2 className="font-display text-3xl font-black text-foreground sm:text-4xl">
                  Core Features
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Six behavioral dimensions + sentiment analysis = truth
                </p>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      variants={fadeUp}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="card-hover rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm"
                    >
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mb-2 font-display text-base font-bold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative z-20 px-5 lg:px-16 xl:px-24 py-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/50 to-accent/5 p-12 backdrop-blur-sm">
                <div className="mb-4 text-5xl">👻</div>
                <h2 className="mb-4 font-display text-3xl font-black text-foreground sm:text-4xl">
                  Ready to find out?
                </h2>
                <p className="mb-8 text-muted-foreground">
                  Login securely with Internet Identity and start your first
                  analysis.
                </p>
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="h-12 min-w-48 bg-primary text-primary-foreground font-display font-bold hover:bg-primary/90"
                >
                  {isLoggingIn ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Ghost className="mr-2 h-4 w-4" />
                  )}
                  Get Started Free
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="relative z-20 border-t border-border px-5 py-8 text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
