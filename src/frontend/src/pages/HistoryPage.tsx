import type { AnalysisRecord } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Trash2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

function formatDate(nanoseconds: bigint): string {
  return new Date(Number(nanoseconds) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(nanoseconds: bigint): string {
  return new Date(Number(nanoseconds) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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

interface ChartDataPoint {
  date: string;
  score: number;
  risk: string;
}

function getRiskColor(risk: string): string {
  if (risk === "Low") return "oklch(0.72 0.15 195)";
  if (risk === "High") return "oklch(0.65 0.25 27)";
  return "oklch(0.72 0.18 55)";
}

// Custom dot for the chart
function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
}) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const color = getRiskColor(payload.risk);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      stroke={color}
      strokeWidth={2}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
    />
  );
}

export default function HistoryPage() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHistory();
    },
    enabled: !!actor && !isFetching,
  });

  const records: AnalysisRecord[] = historyQuery.data ?? [];
  const sortedRecords = [...records].sort(
    (a, b) => Number(a.date) - Number(b.date),
  );

  const chartData: ChartDataPoint[] = sortedRecords.map((r) => ({
    date: formatShortDate(r.date),
    score: Number(r.score),
    risk: r.riskCategory,
  }));

  const handleDelete = async (id: string) => {
    if (!actor) return;
    setDeletingId(id);
    try {
      await actor.deleteAnalysis(id);
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      await queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Analysis deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete analysis");
    } finally {
      setDeletingId(null);
    }
  };

  const isLoading = historyQuery.isLoading || isFetching;

  return (
    <div className="ghost-noise-bg min-h-full p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-1">
            <History className="h-3.5 w-3.5 text-primary" />
            <span>Analysis Records</span>
          </div>
          <h1 className="font-display text-3xl font-black text-foreground lg:text-4xl">
            History
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {records.length} {records.length === 1 ? "analysis" : "analyses"}{" "}
            stored on-chain
          </p>
        </motion.div>

        {/* Chart */}
        {!isLoading && chartData.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-border bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <CardTitle className="font-display text-base font-bold">
                    Risk Trend
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.22 0.02 280)"
                        strokeOpacity={0.5}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "oklch(0.55 0.04 280)", fontSize: 11 }}
                        axisLine={{ stroke: "oklch(0.22 0.02 280)" }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "oklch(0.55 0.04 280)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.14 0.005 280)",
                          border: "1px solid oklch(0.22 0.02 280)",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "oklch(0.96 0.01 280)",
                        }}
                        formatter={(value: number) => [
                          `${value}%`,
                          "Ghosting Risk",
                        ]}
                        labelStyle={{ color: "oklch(0.55 0.04 280)" }}
                      />
                      <ReferenceLine
                        y={30}
                        stroke="oklch(0.72 0.15 195 / 0.3)"
                        strokeDasharray="4 4"
                        label={{
                          value: "Low",
                          fill: "oklch(0.72 0.15 195)",
                          fontSize: 10,
                          position: "right",
                        }}
                      />
                      <ReferenceLine
                        y={60}
                        stroke="oklch(0.72 0.18 55 / 0.3)"
                        strokeDasharray="4 4"
                        label={{
                          value: "Medium",
                          fill: "oklch(0.72 0.18 55)",
                          fontSize: 10,
                          position: "right",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="oklch(0.62 0.22 290)"
                        strokeWidth={2}
                        dot={<CustomDot />}
                        activeDot={{
                          r: 6,
                          fill: "oklch(0.62 0.22 290)",
                          stroke: "oklch(0.62 0.22 290)",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="border-border bg-card/70 backdrop-blur-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 rounded-lg bg-muted/30" />
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <span className="text-5xl">👻</span>
                  <p className="font-display text-lg font-semibold text-foreground">
                    No history yet
                  </p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Run your first analysis to build your ghosting risk history.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground pl-4">
                          Date
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Score
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Risk
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Sentiment
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-4">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...records].reverse().map((record) => (
                        <TableRow
                          key={record.id}
                          className="border-border/50 hover:bg-muted/20"
                        >
                          <TableCell className="pl-4 text-sm text-muted-foreground">
                            {formatDate(record.date)}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm font-bold text-foreground">
                              {Number(record.score)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <RiskBadge category={record.riskCategory} />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {record.sentimentResult}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(record.id)}
                              disabled={deletingId === record.id}
                            >
                              {deletingId === record.id ? (
                                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin block" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
