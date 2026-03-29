import type { Identity } from "@dfinity/agent";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  Microscope,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { Diagnosis } from "../types/diagnosis";
import { getSeverityStyle, timeAgo } from "../types/diagnosis";

interface Props {
  diagnoses: Diagnosis[];
  isLoggedIn: boolean;
  identity?: Identity | null;
}

export default function ReportsScreen({ diagnoses, isLoggedIn }: Props) {
  const stats = useMemo(() => {
    const total = diagnoses.length;
    const low = diagnoses.filter((d) => d.severity === "Low").length;
    const medium = diagnoses.filter((d) => d.severity === "Medium").length;
    const high = diagnoses.filter((d) => d.severity === "High").length;
    const avgConf =
      total > 0
        ? Math.round(
            (diagnoses.reduce((a, d) => a + d.confidencePercent, 0) / total) *
              10,
          ) / 10
        : 0;
    const avgHealth =
      total > 0
        ? Math.round(
            (diagnoses.reduce((a, d) => a + d.healthScore, 0) / total) * 10,
          ) / 10
        : 0;
    const pathogenMap: Record<string, number> = {};
    for (const d of diagnoses) {
      pathogenMap[d.pathogen] = (pathogenMap[d.pathogen] || 0) + 1;
    }
    const topPathogen =
      Object.entries(pathogenMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { total, low, medium, high, avgConf, avgHealth, topPathogen };
  }, [diagnoses]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of diagnoses) {
      const key =
        d.diseaseName.length > 14
          ? `${d.diseaseName.slice(0, 13)}…`
          : d.diseaseName;
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [diagnoses]);

  const pathogenChartData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of diagnoses) {
      map[d.pathogen] = (map[d.pathogen] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [diagnoses]);

  const handleDownload = () => {
    if (!isLoggedIn) {
      toast.error("Login required", {
        description: "Please login in Settings to download reports.",
      });
      return;
    }
    if (diagnoses.length === 0) {
      toast.error("No data", { description: "No diagnoses to export yet." });
      return;
    }
    const headers = [
      "id",
      "crop",
      "diseaseName",
      "pathogen",
      "severity",
      "healthScore",
      "confidencePercent",
      "timestamp",
    ];
    const rows = diagnoses.map((d) =>
      [
        d.id,
        d.crop,
        d.diseaseName,
        d.pathogen,
        d.severity,
        d.healthScore,
        d.confidencePercent,
        d.timestamp,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-diagnoses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!", {
      description: `Exported ${diagnoses.length} diagnosis records.`,
    });
  };

  const STAT_CARDS = [
    {
      label: "Total Scans",
      value: stats.total,
      icon: Activity,
      color: "#43a047",
      bg: "#e8f5e9",
    },
    {
      label: "Avg Confidence",
      value: `${stats.avgConf}%`,
      icon: TrendingUp,
      color: "#1565c0",
      bg: "#e3f2fd",
    },
    {
      label: "Avg Health Score",
      value: stats.avgHealth,
      icon: CheckCircle2,
      color: "#2e7d32",
      bg: "#e8f5e9",
    },
    {
      label: "High Risk",
      value: stats.high,
      icon: XCircle,
      color: "#c62828",
      bg: "#ffebee",
    },
    {
      label: "Medium Risk",
      value: stats.medium,
      icon: AlertTriangle,
      color: "#f57c00",
      bg: "#fff3e0",
    },
    {
      label: "Low Risk",
      value: stats.low,
      icon: CheckCircle2,
      color: "#2e7d32",
      bg: "#e8f5e9",
    },
  ];

  const CHART_COLORS = [
    "#43a047",
    "#f57c00",
    "#c62828",
    "#1565c0",
    "#7b1fa2",
    "#0288d1",
  ];
  const PATHOGEN_COLORS: Record<string, string> = {
    Fungus: "#43a047",
    Virus: "#c62828",
    Bacterium: "#f57c00",
    Arthropod: "#7b1fa2",
    Healthy: "#1565c0",
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-3 shadow-xs flex items-center justify-between">
        <h1 className="text-base font-bold" style={{ color: "#2d7d32" }}>
          Analytics
        </h1>
        <button
          type="button"
          data-ocid="reports.download_button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{
            background: isLoggedIn ? "#e8f5e9" : "#f5f5f5",
            color: isLoggedIn ? "#2d7d32" : "#9e9e9e",
          }}
        >
          <Download size={14} />
          Download
          {!isLoggedIn && (
            <span className="ml-1 text-xs" title="Login required">
              🔒
            </span>
          )}
        </button>
      </header>

      <div className="flex-1 px-4 pt-4 pb-6 space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {STAT_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              data-ocid="reports.card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-4 bg-white shadow-card"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                style={{ background: card.bg }}
              >
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {card.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Top Pathogen + Model Info */}
        <div className="bg-white rounded-xl px-4 py-3 shadow-xs flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#f3e5f5" }}
          >
            <Microscope size={18} style={{ color: "#7b1fa2" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: "#7b1fa2" }}>
              Most Common Pathogen
            </p>
            <p
              className="text-sm font-bold truncate"
              style={{ color: "#1a1a1a" }}
            >
              {stats.topPathogen}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#43a047" }}
            />
            <p className="text-xs font-medium" style={{ color: "#2d7d32" }}>
              AI Online
            </p>
          </div>
        </div>

        {/* Disease Distribution Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="text-sm font-bold mb-4" style={{ color: "#2d7d32" }}>
            Disease Distribution
          </h2>
          {chartData.length === 0 ? (
            <div data-ocid="reports.empty_state" className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No data to display yet
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, bottom: 28, left: -20 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 8 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: "1px solid #e8f5e9",
                  }}
                  formatter={(v) => [`${v} case(s)`, "Count"]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pathogen Type Chart */}
        {pathogenChartData.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <h2 className="text-sm font-bold mb-3" style={{ color: "#2d7d32" }}>
              Pathogen Breakdown
            </h2>
            <div className="space-y-2">
              {pathogenChartData.map((item) => {
                const col = PATHOGEN_COLORS[item.name] ?? "#9e9e9e";
                const pct =
                  diagnoses.length > 0
                    ? Math.round((item.count / diagnoses.length) * 100)
                    : 0;
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium" style={{ color: col }}>
                        {item.name}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: col }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Diagnoses Grid */}
        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color: "#2d7d32" }}>
            All Diagnoses
          </h2>
          {diagnoses.length === 0 ? (
            <div
              data-ocid="reports.empty_state"
              className="text-center py-8 rounded-2xl"
              style={{ background: "#e8f5e9" }}
            >
              <p className="text-sm text-muted-foreground">
                No diagnoses recorded yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {diagnoses.map((d, i) => {
                const dSty = getSeverityStyle(d.severity);
                return (
                  <motion.div
                    key={d.id}
                    data-ocid={`reports.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-xl overflow-hidden shadow-card"
                  >
                    <div className="aspect-square w-full bg-secondary">
                      <img
                        src={
                          d.imageDataUrl ||
                          "/assets/generated/leaf-healthy.dim_400x300.jpg"
                        }
                        alt={d.diseaseName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {d.crop
                          .replace(/_/g, " ")
                          .replace(/\(.*?\)/g, "")
                          .trim()}
                      </p>
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: "#1a1a1a" }}
                      >
                        {d.diseaseName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(d.timestamp)}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ color: dSty.color, background: dSty.bg }}
                        >
                          {d.severity}
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#1565c0" }}
                        >
                          🏥 {d.healthScore}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
