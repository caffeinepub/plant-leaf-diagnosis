import { useCamera } from "@/camera/useCamera";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  FlipHorizontal,
  Leaf,
  Loader2,
  RefreshCw,
  Save,
  Upload,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Diagnosis } from "../types/diagnosis";
import {
  getHealthScoreColor,
  getSeverityStyle,
  saveDiagnosis,
  simulateAnalysis,
} from "../types/diagnosis";

type Mode = "camera" | "upload";
type Step = "capture" | "analyzing" | "result";

interface Props {
  onSaved: () => void;
}

const TIMELINE_ICONS = [Clock, Clock, Leaf];

export default function DiagnoseScreen({ onSaved }: Props) {
  const [mode, setMode] = useState<Mode>("camera");
  const [step, setStep] = useState<Step>("capture");
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isActive,
    isSupported,
    error: camError,
    isLoading: camLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "environment", quality: 0.9 });

  // biome-ignore lint/correctness/useExhaustiveDependencies: startCamera/stopCamera are stable refs
  useEffect(() => {
    if (mode === "camera" && step === "capture" && !capturedDataUrl) {
      startCamera();
    } else if (mode !== "camera") {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, step, capturedDataUrl]);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapturedDataUrl(url);
    setUploadedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setCapturedDataUrl(url);
  };

  const handleAnalyze = () => {
    setStep("analyzing");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 20;
      });
    }, 200);
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      // Use file data URL or object URL to seed the simulation
      const seed =
        capturedDataUrl ||
        (uploadedFile ? uploadedFile.name + uploadedFile.size : "");
      const res = simulateAnalysis(seed);
      setResult(res);
      setStep("result");
    }, 2200);
  };

  const handleSave = () => {
    if (!result) return;
    const diagnosis: Diagnosis = {
      ...result,
      id: `d${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageDataUrl: capturedDataUrl ?? undefined,
    };
    saveDiagnosis(diagnosis);
    reset();
    onSaved();
  };

  const reset = () => {
    setStep("capture");
    setCapturedDataUrl(null);
    setUploadedFile(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sty = result ? getSeverityStyle(result.severity) : null;
  const hColor = result ? getHealthScoreColor(result.healthScore) : "#43a047";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-3 shadow-xs">
        <h1
          className="text-base font-bold text-center"
          style={{ color: "#2d7d32" }}
        >
          Scan Leaf
        </h1>
      </header>

      <div className="flex-1 px-4 pt-4 pb-6 space-y-4">
        {/* Mode Tabs */}
        {step !== "result" && (
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ background: "#e8f5e9" }}
          >
            <button
              type="button"
              data-ocid="diagnose.tab"
              onClick={() => {
                setMode("camera");
                reset();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: mode === "camera" ? "#2d7d32" : "transparent",
                color: mode === "camera" ? "white" : "#2d7d32",
              }}
            >
              <Camera size={16} /> Camera
            </button>
            <button
              type="button"
              data-ocid="diagnose.tab"
              onClick={() => {
                setMode("upload");
                reset();
                stopCamera();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: mode === "upload" ? "#2d7d32" : "transparent",
                color: mode === "upload" ? "white" : "#2d7d32",
              }}
            >
              <Upload size={16} /> Upload
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── CAPTURE ── */}
          {step === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {mode === "camera" ? (
                <div className="space-y-3">
                  <div
                    className="relative rounded-2xl overflow-hidden bg-black"
                    style={{ aspectRatio: "4/3" }}
                  >
                    {isSupported === false && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-4">
                        <XCircle size={32} className="text-red-400" />
                        <p className="text-white text-sm text-center">
                          Camera API not supported in this browser.
                        </p>
                        <p className="text-gray-300 text-xs text-center">
                          Try Chrome, Firefox, or Safari. Make sure the page is
                          served over HTTPS.
                        </p>
                      </div>
                    )}
                    {camError && (
                      <div
                        data-ocid="diagnose.error_state"
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-5"
                      >
                        <XCircle size={32} className="text-red-400" />
                        <p className="text-white text-sm text-center font-medium">
                          {camError.message}
                        </p>
                        {camError.hint && (
                          <p className="text-gray-300 text-xs text-center leading-relaxed">
                            {camError.hint}
                          </p>
                        )}
                        <div className="flex gap-3 mt-1">
                          <button
                            type="button"
                            onClick={() => retry()}
                            className="px-4 py-1.5 rounded-full bg-green-600 text-white text-xs font-medium"
                          >
                            Retry
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMode("upload");
                            }}
                            className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium"
                          >
                            Use Upload
                          </button>
                        </div>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      playsInline
                      muted
                      autoPlay
                    />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                    {camLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2
                          size={32}
                          className="text-white animate-spin"
                        />
                      </div>
                    )}
                    {isActive && (
                      <button
                        type="button"
                        onClick={() => switchCamera()}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-black/40 text-white"
                        aria-label="Switch camera"
                      >
                        <FlipHorizontal size={18} />
                      </button>
                    )}
                    <div className="absolute inset-4 border-2 border-white/40 rounded-xl pointer-events-none" />
                  </div>
                  {capturedDataUrl ? (
                    <div className="space-y-3">
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{ aspectRatio: "4/3" }}
                      >
                        <img
                          src={capturedDataUrl}
                          alt="Captured"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={reset}
                        >
                          <RefreshCw size={14} className="mr-1" /> Retake
                        </Button>
                        <Button
                          data-ocid="diagnose.primary_button"
                          className="flex-1 text-white"
                          style={{ background: "#43a047" }}
                          onClick={handleAnalyze}
                        >
                          Analyze Leaf
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      data-ocid="diagnose.primary_button"
                      className="w-full h-12 text-white font-semibold"
                      style={{ background: isActive ? "#43a047" : "#9e9e9e" }}
                      onClick={handleCapture}
                      disabled={!isActive || camLoading}
                    >
                      {camLoading ? (
                        <Loader2 size={18} className="animate-spin mr-2" />
                      ) : (
                        <Camera size={18} className="mr-2" />
                      )}
                      {camLoading ? "Starting camera..." : "Capture Photo"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    data-ocid="diagnose.dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        fileInputRef.current?.click();
                    }}
                    className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
                    style={{
                      borderColor: "#43a047",
                      background: "#f1f8e9",
                      minHeight: "200px",
                    }}
                  >
                    {capturedDataUrl ? (
                      <img
                        src={capturedDataUrl}
                        alt="Preview"
                        className="w-full h-56 object-cover rounded-2xl"
                      />
                    ) : (
                      <>
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: "#e8f5e9" }}
                        >
                          <Upload size={24} style={{ color: "#43a047" }} />
                        </div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#2d7d32" }}
                        >
                          Tap to upload leaf image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, WEBP supported
                        </p>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    data-ocid="diagnose.upload_button"
                  />
                  {capturedDataUrl && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={reset}
                      >
                        <RefreshCw size={14} className="mr-1" /> Clear
                      </Button>
                      <Button
                        data-ocid="diagnose.primary_button"
                        className="flex-1 text-white"
                        style={{ background: "#43a047" }}
                        onClick={handleAnalyze}
                      >
                        Analyze Leaf
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ANALYZING ── */}
          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              data-ocid="diagnose.loading_state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-10"
            >
              {capturedDataUrl && (
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-card">
                  <img
                    src={capturedDataUrl}
                    alt="Analyzing"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#e8f5e9" }}
              >
                <Loader2
                  size={32}
                  className="animate-spin"
                  style={{ color: "#43a047" }}
                />
              </div>
              <div className="w-full space-y-2">
                <p
                  className="text-sm font-semibold text-center"
                  style={{ color: "#2d7d32" }}
                >
                  Analyzing leaf...
                </p>
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  AI model scanning for diseases
                </p>
              </div>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {step === "result" && result && sty && (
            <motion.div
              key="result"
              data-ocid="diagnose.success_state"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Leaf image */}
              {capturedDataUrl && (
                <div
                  className="rounded-2xl overflow-hidden shadow-card"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    src={capturedDataUrl}
                    alt="Analyzed leaf"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Status bar */}
              <div
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{
                  background:
                    result.plantStatus === "HEALTHY" ? "#e8f5e9" : "#ffebee",
                }}
              >
                <div className="flex items-center gap-2">
                  {result.plantStatus === "HEALTHY" ? (
                    <CheckCircle2 size={18} style={{ color: "#2e7d32" }} />
                  ) : (
                    <XCircle size={18} style={{ color: "#c62828" }} />
                  )}
                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        result.plantStatus === "HEALTHY"
                          ? "#2e7d32"
                          : "#c62828",
                    }}
                  >
                    {result.plantStatus === "HEALTHY"
                      ? "HEALTHY ✅"
                      : "DISEASED ⚠️"}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ color: sty.color, background: sty.bg }}
                >
                  {result.severity} Risk
                </span>
              </div>

              {/* Tabbed Report */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <Tabs defaultValue="detection">
                  <div className="overflow-x-auto border-b border-border">
                    <TabsList className="flex w-max min-w-full rounded-none bg-transparent px-2 gap-1 h-10">
                      {(
                        [
                          "detection",
                          "biology",
                          "treatment",
                          "yield",
                          "recovery",
                        ] as const
                      ).map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="text-xs px-3 py-1.5 rounded-lg capitalize whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                        >
                          {tab === "detection"
                            ? "📊 Results"
                            : tab === "biology"
                              ? "🧬 Biology"
                              : tab === "treatment"
                                ? "💊 Treatment"
                                : tab === "yield"
                                  ? "🌾 Yield"
                                  : "⏱ Recovery"}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {/* Section A: Detection */}
                  <TabsContent value="detection" className="p-4 space-y-3 m-0">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        {result.crop
                          .replace(/_/g, " ")
                          .replace(/\(.*?\)/g, "")
                          .trim()}
                      </p>
                      <h2
                        className="text-base font-bold"
                        style={{ color: "#1a1a1a" }}
                      >
                        {result.diseaseName}
                      </h2>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Confidence
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: sty.color }}
                        >
                          {result.confidencePercent}%
                        </span>
                      </div>
                      <Progress
                        value={result.confidencePercent}
                        className="h-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Health Score
                        </span>
                        <span className="font-bold" style={{ color: hColor }}>
                          {result.healthScore}/100
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${result.healthScore}%`,
                            background: hColor,
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div
                        className="rounded-lg p-2.5 text-center"
                        style={{ background: sty.bg }}
                      >
                        <p className="text-xs text-muted-foreground">
                          Severity
                        </p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: sty.color }}
                        >
                          {result.severity}
                        </p>
                      </div>
                      <div
                        className="rounded-lg p-2.5 text-center"
                        style={{ background: "#f3e5f5" }}
                      >
                        <p className="text-xs text-muted-foreground">
                          Pathogen
                        </p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: "#7b1fa2" }}
                        >
                          {result.pathogen}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Section B: Biology */}
                  <TabsContent value="biology" className="p-4 space-y-3 m-0">
                    <div className="space-y-2">
                      <div
                        className="flex justify-between items-start rounded-lg p-3"
                        style={{ background: "#f5f5f5" }}
                      >
                        <span className="text-xs text-muted-foreground">
                          Pathogen Type
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#7b1fa2" }}
                        >
                          {result.pathogen}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center rounded-lg p-3"
                        style={{ background: "#f5f5f5" }}
                      >
                        <span className="text-xs text-muted-foreground">
                          UniProt ID
                        </span>
                        <a
                          href={`https://www.uniprot.org/uniprot/${result.uniprotId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold flex items-center gap-1"
                          style={{ color: "#1565c0" }}
                        >
                          {result.uniprotId} <ExternalLink size={10} />
                        </a>
                      </div>
                      {result.alphafoldLink !== "N/A" && (
                        <div
                          className="flex justify-between items-center rounded-lg p-3"
                          style={{ background: "#f5f5f5" }}
                        >
                          <span className="text-xs text-muted-foreground">
                            AlphaFold Structure
                          </span>
                          <a
                            href={result.alphafoldLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold flex items-center gap-1"
                            style={{ color: "#1565c0" }}
                          >
                            View 3D <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 font-medium">
                        Amino Acid Sequence
                      </p>
                      <div
                        className="rounded-lg p-3 overflow-x-auto"
                        style={{ background: "#f9fbe7" }}
                      >
                        <code
                          className="text-xs break-all leading-relaxed"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: "#2d7d32",
                          }}
                        >
                          {result.aminoSequence}
                        </code>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Section C: Treatment */}
                  <TabsContent value="treatment" className="p-4 m-0">
                    {result.pathogen === "Healthy" ? (
                      <div
                        className="text-center py-6 rounded-xl"
                        style={{ background: "#e8f5e9" }}
                      >
                        <CheckCircle2
                          size={32}
                          className="mx-auto mb-2"
                          style={{ color: "#43a047" }}
                        />
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "#2d7d32" }}
                        >
                          No Treatment Needed
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Plant is healthy. Maintain regular care.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <TreatmentSection
                          title="⚗️ Chemical"
                          items={result.treatment.chemical}
                          colorBg="#fff3e0"
                          colorText="#e65100"
                        />
                        <TreatmentSection
                          title="🌿 Organic"
                          items={result.treatment.organic}
                          colorBg="#e8f5e9"
                          colorText="#2d7d32"
                        />
                      </div>
                    )}
                  </TabsContent>

                  {/* Section D: Yield */}
                  <TabsContent value="yield" className="p-4 m-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Crop: {result.crop.replace(/_/g, " ")}
                    </p>
                    <ul className="space-y-2">
                      {result.yieldTips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <span
                            className="mt-0.5 text-xs"
                            style={{ color: "#43a047" }}
                          >
                            ●
                          </span>
                          <span className="text-xs text-muted-foreground leading-relaxed">
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  {/* Section E: Recovery */}
                  <TabsContent value="recovery" className="p-4 m-0">
                    <div className="space-y-3">
                      {result.recoveryTimeline.map((step, i) => {
                        const Icon = TIMELINE_ICONS[i] ?? Clock;
                        const colors = ["#c62828", "#f57c00", "#2d7d32"];
                        const bgs = ["#ffebee", "#fff3e0", "#e8f5e9"];
                        const [label, ...rest] = step.split(": ");
                        return (
                          <div key={step} className="flex gap-3 items-start">
                            <div className="flex flex-col items-center">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: bgs[i] }}
                              >
                                <Icon size={14} style={{ color: colors[i] }} />
                              </div>
                              {i < result.recoveryTimeline.length - 1 && (
                                <div
                                  className="w-0.5 h-6 mt-1"
                                  style={{ background: "#e0e0e0" }}
                                />
                              )}
                            </div>
                            <div className="pb-2">
                              <p
                                className="text-xs font-bold"
                                style={{ color: colors[i] }}
                              >
                                {label}
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {rest.join(": ")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={reset}>
                  <RefreshCw size={14} className="mr-1" /> New Scan
                </Button>
                <Button
                  data-ocid="diagnose.save_button"
                  className="flex-1 text-white"
                  style={{ background: "#43a047" }}
                  onClick={handleSave}
                >
                  <Save size={14} className="mr-1" /> Save to History
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TreatmentSection({
  title,
  items,
  colorBg,
  colorText,
}: {
  title: string;
  items: { name: string; dose: string; purpose: string }[];
  colorBg: string;
  colorText: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-bold mb-2" style={{ color: colorText }}>
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-lg p-3"
            style={{ background: colorBg }}
          >
            <div className="flex justify-between items-start gap-2 mb-1">
              <span
                className="text-xs font-semibold"
                style={{ color: colorText }}
              >
                {item.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full bg-white font-medium flex-shrink-0"
                style={{ color: colorText }}
              >
                {item.dose}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{item.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
