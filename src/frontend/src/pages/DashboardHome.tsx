import type { AnalysisRecord } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  FlaskConical,
  Ghost,
  TrendingUp,
} from "lucide-react";
import { type Variants, motion } from "motion/react";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  return (
    <motion.span
      key={target}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {target}
      {suffix}
    </motion.span>
  );
}

function RiskBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    Low: "bg-[oklch(0.72_0.15_195_/_0.15)] text-[oklch(0.82_0.12_195)] border-[oklch(0.72_0.15_195_/_0.3)]",
    Medium:
      "bg-[oklch(0.72_0.18_55_/_0.15)] text-[oklch(0.82_0.15_55)] border-[oklch(0.72_0.18_55_/_0.3)]",
    High: "bg-[oklch(0.65_0.25_27_/_0.15)] text-[oklch(0.75_0.2_27)] border-[oklch(0.65_0.25_27_/_0.3)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[category] ?? styles.Medium}`}
    >
      {category}
    </span>
  );
}

function formatDate(nanoseconds: bigint): string {
  return new Date(Number(nanoseconds) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.08 } },
};
const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardHome() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const principalId = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principalId ? `${principalId.slice(0, 12)}…` : "—";

  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalAnalyses: BigInt(0),
          highestScore: BigInt(0),
          averageScore: BigInt(0),
        };
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHistory();
    },
    enabled: !!actor && !isFetching,
  });

  const totalAnalyses = Number(statsQuery.data?.totalAnalyses ?? 0);
  const avgScore = Number(statsQuery.data?.averageScore ?? 0);
  const highestScore = Number(statsQuery.data?.highestScore ?? 0);
  const recentRecords: AnalysisRecord[] = (historyQuery.data ?? [])
    .slice(-3)
    .reverse();

  return (
    <div className="ghost-noise-bg min-h-full p-6 lg:p-8">
      <motion.div
        className="mx-auto max-w-5xl space-y-8"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 mb-1">
            <Ghost className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Welcome back
            </span>
          </div>
          <h1 className="font-display text-3xl font-black text-foreground lg:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground truncate max-w-xs">
            {shortPrincipal}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Total Analyses",
              value: <AnimatedCounter target={totalAnalyses} />,
              icon: Activity,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              title: "Average Risk Score",
              value: <AnimatedCounter target={avgScore} suffix="%" />,
              icon: TrendingUp,
              color: "text-[oklch(0.72_0.18_55)]",
              bg: "bg-[oklch(0.72_0.18_55_/_0.1)]",
            },
            {
              title: "Highest Risk",
              value: <AnimatedCounter target={highestScore} suffix="%" />,
              icon: AlertTriangle,
              color: "text-[oklch(0.65_0.25_27)]",
              bg: "bg-[oklch(0.65_0.25_27_/_0.1)]",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
              >
                <Card className="card-hover border-border bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p
                          className={`mt-2 font-display text-3xl font-black ${stat.color}`}
                        >
                          {statsQuery.isLoading || isFetching ? (
                            <Skeleton className="h-8 w-20 bg-muted/50" />
                          ) : (
                            stat.value
                          )}
                        </p>
                      </div>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick action */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Ready to analyze?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Input behavioral signals and get your ghosting probability
                    score instantly.
                  </p>
                </div>
                <Link to="/analysis">
                  <Button className="group flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    New Analysis
                    <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent analyses */}
        <motion.div variants={fadeUp}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              Recent Analyses
            </h2>
            <Link
              to="/history"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>

          {historyQuery.isLoading || isFetching ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl bg-muted/30" />
              ))}
            </div>
          ) : recentRecords.length === 0 ? (
            <Card className="border-border bg-card/60">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="text-4xl">👻</span>
                <p className="font-display font-semibold text-foreground">
                  No analyses yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Run your first analysis to see results here.
                </p>
                <Link to="/analysis">
                  <Button variant="outline" size="sm" className="mt-1">
                    Start analyzing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👻</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <RiskBadge category={record.riskCategory} />
                        <span className="text-sm font-semibold text-foreground">
                          {Number(record.score)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(record.date)}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {record.sentimentResult}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
