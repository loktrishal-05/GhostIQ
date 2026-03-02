import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  Ghost,
  LogOut,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function formatDate(nanoseconds: bigint): string {
  return new Date(Number(nanoseconds) / 1_000_000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function AnimatedStatValue({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {value}
      {suffix}
    </motion.span>
  );
}

export default function ProfilePage() {
  const { actor, isFetching } = useActor();
  const { identity, clear } = useInternetIdentity();
  const [copied, setCopied] = useState(false);

  const principalId = identity?.getPrincipal().toString() ?? "";

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUser();
    },
    enabled: !!actor && !isFetching,
  });

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

  const user = userQuery.data;
  const isLoading = userQuery.isLoading || isFetching;

  const handleCopyPrincipal = () => {
    const id = user?.principalId ?? principalId;
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      toast.success("Principal ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const totalAnalyses = Number(
    statsQuery.data?.totalAnalyses ?? user?.analysisHistory?.length ?? 0,
  );
  const averageRisk = Number(statsQuery.data?.averageScore ?? 0);
  const highestRisk = Number(statsQuery.data?.highestScore ?? 0);

  const handleLogout = () => {
    clear();
    toast.success("Logged out successfully");
  };

  return (
    <div className="ghost-noise-bg min-h-full p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-1">
            <User className="h-3.5 w-3.5 text-primary" />
            <span>Account Details</span>
          </div>
          <h1 className="font-display text-3xl font-black text-foreground lg:text-4xl">
            Profile
          </h1>
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-border bg-card/70 backdrop-blur-sm overflow-hidden">
            {/* Ghost avatar header */}
            <div className="relative bg-gradient-to-br from-primary/15 via-card to-card px-6 pt-8 pb-6 border-b border-border">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 text-4xl animate-violet-glow">
                  👻
                </div>
                <div>
                  <p className="font-display text-xl font-black text-foreground">
                    Ghost User
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Decentralized Identity
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-5">
              {/* Principal ID */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Ghost className="h-3 w-3 text-primary" />
                  <span className="font-semibold uppercase tracking-wider">
                    Principal ID
                  </span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-10 rounded-lg bg-muted/30" />
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyPrincipal}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 text-left transition-colors hover:bg-muted/30 group"
                  >
                    <span className="flex-1 truncate font-mono text-xs text-foreground">
                      {user?.principalId ?? principalId ?? "—"}
                    </span>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-[oklch(0.72_0.15_195)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                    )}
                  </button>
                )}
                <p className="text-xs text-muted-foreground">
                  Click to copy your principal ID
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Member Since */}
                <div className="col-span-2 rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3 text-primary" />
                    <span className="font-semibold uppercase tracking-wider">
                      Member Since
                    </span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-28 bg-muted/30" />
                  ) : (
                    <p className="font-display text-sm font-bold text-foreground">
                      {user?.createdAt ? formatDate(user.createdAt) : "—"}
                    </p>
                  )}
                </div>

                {/* Total Analyses */}
                <div className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Activity className="h-3 w-3 text-primary" />
                    <span className="font-semibold uppercase tracking-wider">
                      Total
                    </span>
                  </div>
                  {isLoading || statsQuery.isLoading ? (
                    <Skeleton className="h-7 w-12 bg-muted/30" />
                  ) : (
                    <p className="font-display text-2xl font-black text-primary">
                      <AnimatedStatValue value={totalAnalyses} />
                    </p>
                  )}
                </div>

                {/* Average Risk */}
                <div className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <TrendingUp className="h-3 w-3 text-[oklch(0.72_0.18_55)]" />
                    <span className="font-semibold uppercase tracking-wider">
                      Avg Risk
                    </span>
                  </div>
                  {statsQuery.isLoading ? (
                    <Skeleton className="h-7 w-12 bg-muted/30" />
                  ) : (
                    <p className="font-display text-2xl font-black text-[oklch(0.72_0.18_55)]">
                      <AnimatedStatValue value={averageRisk} suffix="%" />
                    </p>
                  )}
                </div>

                {/* Highest Risk */}
                <div className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <AlertTriangle className="h-3 w-3 text-[oklch(0.65_0.25_27)]" />
                    <span className="font-semibold uppercase tracking-wider">
                      Peak Risk
                    </span>
                  </div>
                  {statsQuery.isLoading ? (
                    <Skeleton className="h-7 w-12 bg-muted/30" />
                  ) : (
                    <p className="font-display text-2xl font-black text-[oklch(0.65_0.25_27)]">
                      <AnimatedStatValue value={highestRisk} suffix="%" />
                    </p>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="rounded-xl border border-border/50 bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">
                    Your data lives on-chain.
                  </strong>{" "}
                  All your analysis history is stored securely on the Internet
                  Computer blockchain, tied to your unique Principal ID. Only
                  you can access it.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-destructive/20 bg-card/70 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-sm font-bold text-foreground">
                    Sign Out
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your session is secured by Internet Identity delegation.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive flex-shrink-0 gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
