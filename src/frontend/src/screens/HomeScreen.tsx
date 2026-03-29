import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Leaf,
  Search,
  Settings,
  Sun,
  Wifi,
  Wind,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Diagnosis } from "../types/diagnosis";
import { getSeverityStyle, timeAgo } from "../types/diagnosis";

const PLANT_FILTERS = [
  "All",
  "Tomato",
  "Apple",
  "Grape",
  "Potato",
  "Corn_(maize)",
  "Strawberry",
];

const TIPS = [
  {
    icon: Droplets,
    text: "Water at the base of plants to reduce leaf moisture and prevent fungal diseases.",
  },
  {
    icon: Sun,
    text: "Ensure adequate sunlight exposure — 6-8 hours daily keeps most plants disease-resistant.",
  },
  {
    icon: Wind,
    text: "Good air circulation prevents mildew. Space plants appropriately and prune regularly.",
  },
  {
    icon: Bug,
    text: "Inspect leaves weekly for early signs of pests or discoloration.",
  },
];

function SeverityIcon({ severity }: { severity: Diagnosis["severity"] }) {
  if (severity === "Low")
    return <CheckCircle2 size={14} style={{ color: "#2e7d32" }} />;
  if (severity === "Medium")
    return <AlertTriangle size={14} style={{ color: "#f57c00" }} />;
  return <XCircle size={14} style={{ color: "#c62828" }} />;
}

interface Props {
  diagnoses: Diagnosis[];
  onStartDiagnose: () => void;
  onOpenSettings: () => void;
}

export default function HomeScreen({
  diagnoses,
  onStartDiagnose,
  onOpenSettings,
}: Props) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? diagnoses
      : diagnoses.filter((d) => d.crop === activeFilter);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#e8f5e9" }}
          >
            <Leaf size={18} style={{ color: "#2d7d32" }} />
          </div>
          <span className="font-semibold text-sm" style={{ color: "#2d7d32" }}>
            Plant Leaf Diagnosis
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Search"
            className="p-1 rounded-lg hover:bg-accent transition-colors"
          >
            <Search size={18} className="text-muted-foreground" />
          </button>
          <button
            type="button"
            data-ocid="home.settings.button"
            aria-label="Settings"
            onClick={onOpenSettings}
            className="p-1 rounded-lg hover:bg-accent transition-colors"
          >
            <Settings size={18} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 pt-4 space-y-5">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, #2d7d32 0%, #43a047 100%)",
          }}
        >
          <p className="text-xs text-white/80 mb-0.5">Good morning</p>
          <h1 className="text-lg font-bold text-white mb-3">
            Welcome back, Dr. Green! 👋
          </h1>
          <button
            type="button"
            data-ocid="home.primary_button"
            onClick={onStartDiagnose}
            className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:shadow-md active:scale-95"
            style={{ color: "#2d7d32" }}
          >
            <Search size={16} />
            Start Diagnosis
            <ChevronRight size={14} className="ml-auto" />
          </button>
        </motion.div>

        {/* Plant Filter Chips */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Filter by Crop
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PLANT_FILTERS.map((f) => (
              <button
                type="button"
                key={f}
                data-ocid="home.filter.tab"
                onClick={() => setActiveFilter(f)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: activeFilter === f ? "#2d7d32" : "#e8f5e9",
                  color: activeFilter === f ? "white" : "#2d7d32",
                }}
              >
                {f
                  .replace(/_/g, " ")
                  .replace(/\(.*?\)/g, "")
                  .trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Diagnoses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: "#2d7d32" }}>
              Recent Diagnoses
            </h2>
            <span className="text-xs text-muted-foreground">
              {filtered.length} records
            </span>
          </div>
          {filtered.length === 0 ? (
            <div
              data-ocid="home.empty_state"
              className="text-center py-8 rounded-2xl"
              style={{ background: "#e8f5e9" }}
            >
              <Leaf
                size={32}
                className="mx-auto mb-2"
                style={{ color: "#43a047" }}
              />
              <p className="text-sm text-muted-foreground">No diagnoses yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Scan a leaf to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((d, i) => {
                const sty = getSeverityStyle(d.severity);
                return (
                  <motion.div
                    key={d.id}
                    data-ocid={`home.item.${i + 1}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-card"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                      <img
                        src={
                          d.imageDataUrl ||
                          "/assets/generated/leaf-healthy.dim_400x300.jpg"
                        }
                        alt={d.diseaseName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {d.crop
                          .replace(/_/g, " ")
                          .replace(/\(.*?\)/g, "")
                          .trim()}
                      </p>
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "#1a1a1a" }}
                      >
                        {d.diseaseName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(d.timestamp)}
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#7b1fa2" }}
                        >
                          🧬 {d.pathogen}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: sty.color, background: sty.bg }}
                      >
                        <SeverityIcon severity={d.severity} />
                        {d.severity}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#1565c0" }}
                      >
                        🏥 {d.healthScore}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color: "#2d7d32" }}>
            Tips for Healthy Plants
          </h2>
          <div className="space-y-2">
            {TIPS.map((tip) => (
              <div
                key={tip.text}
                className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-xs"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#e8f5e9" }}
                >
                  <tip.icon size={16} style={{ color: "#43a047" }} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Status */}
        <div
          className="flex items-center justify-center gap-2 py-2 rounded-xl"
          style={{ background: "#e8f5e9" }}
        >
          <Wifi size={14} style={{ color: "#43a047" }} />
          <span className="text-xs font-medium" style={{ color: "#2d7d32" }}>
            Cloud AI Online
          </span>
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#43a047" }}
          />
        </div>
      </div>
    </div>
  );
}
