export type Severity = "Low" | "Medium" | "High";
export type PathogenType =
  | "Healthy"
  | "Fungus"
  | "Virus"
  | "Bacterium"
  | "Arthropod";

export interface TreatmentItem {
  name: string;
  dose: string;
  purpose: string;
}

export interface TreatmentInfo {
  chemical: TreatmentItem[];
  organic: TreatmentItem[];
}

export interface Diagnosis {
  id: string;
  label: string;
  crop: string;
  diseaseName: string;
  severity: Severity;
  confidencePercent: number;
  healthScore: number;
  plantStatus: string;
  pathogen: PathogenType;
  uniprotId: string;
  aminoSequence: string;
  alphafoldLink: string;
  treatment: TreatmentInfo;
  yieldTips: string[];
  recoveryTimeline: string[];
  timestamp: string;
  imageDataUrl?: string;
}

// ─── Disease Database ────────────────────────────────────────────────────────

const DISEASE_TO_UNIPROT: Record<string, string> = {
  Squash___Powdery_mildew: "Q4WZ90",
  "Orange___Haunglongbing_(Citrus_greening)": "Q1J9E3",
  Apple___Apple_scab: "A0A0A2K7Q7",
  Apple___Black_rot: "Q96VB9",
  Apple___Cedar_apple_rust: "A0A2H4I8D6",
  "Cherry_(including_sour)___Powdery_mildew": "Q2VYF8",
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Q8N1B4",
  "Corn_(maize)___Common_rust_": "P0C5H8",
  "Corn_(maize)___Northern_Leaf_Blight": "Q9FJA2",
  Grape___Black_rot: "A0A1D6Y9G4",
  "Grape___Esca_(Black_Measles)": "A0A2R8Z2E0",
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Q6R0H1",
  Peach___Bacterial_spot: "Q87T41",
  "Pepper,_bell___Bacterial_spot": "Q87T41",
  Potato___Early_blight: "A0A1Y2G6H3",
  Potato___Late_blight: "Q9HFN0",
  Strawberry___Leaf_scorch: "Q8W1K5",
  Tomato___Bacterial_spot: "Q87T41",
  Tomato___Early_blight: "A0A1Y2G6H3",
  Tomato___Late_blight: "Q9HFN0",
  Tomato___Leaf_Mold: "Q8RWK8",
  Tomato___Septoria_leaf_spot: "A0A0F7QIP7",
  "Tomato___Spider_mites Two-spotted_spider_mite": "Q9BXX2",
  Tomato___Target_Spot: "A0A1B2R4Z0",
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: "Q9Q9S4",
  Tomato___Tomato_mosaic_virus: "P03576",
  Apple___healthy: "P00878",
  Blueberry___healthy: "Q2MHE4",
  "Cherry_(including_sour)___healthy": "Q9M1K2",
  "Corn_(maize)___healthy": "P04718",
  Grape___healthy: "Q8W4L5",
  Peach___healthy: "Q9SB60",
  "Pepper,_bell___healthy": "Q9M2S6",
  Potato___healthy: "P00876",
  Raspberry___healthy: "Q9FJA2",
  Soybean___healthy: "P00873",
  Strawberry___healthy: "Q8S4Y1",
  Tomato___healthy: "Q964S2",
};

const AMINO_SEQUENCES: Record<string, string> = {
  "Tomato___Spider_mites Two-spotted_spider_mite":
    "MTEYFKRILVLTALALVAAVSAQPVLKLHVPVYPDKFPNEIKDVYGVFEGRPYKPEEFPFGLEKNPDFAWKKLVEEAGFDLNYKSLMAKYNV",
  Tomato___Septoria_leaf_spot:
    "MKKFVLALVAAVLAASPLAVSAQYCGSGSCSNYCDSCKSGYCGPGYCG",
  Tomato___Leaf_Mold: "MKSFTLALVAVLAASPLAVSAQYCGSGSCSNYCDSCKSGYCGPGYCG",
  Tomato___Late_blight: "MKKLLALAAALAVSAPAAHAQYCDEWFKRLKNFSPKGGNFECSNGCDFPV",
  Tomato___Early_blight:
    "MAFALSLALLALPAAHAECVSDGKYYCRSTGDCDPEVCGGDGSSCSNGVCGRGVC",
  Tomato___Bacterial_spot:
    "MGNICIGAGMAGSTALFVAKRMLERAGYPSRVDYVPGPARQRCLGCGILLP",
  Tomato___Target_Spot: "MKKLLALAAALAVSAPAAHAQYCDEWFKRLKNFSPKGGNFECSNGCDFPV",
  Tomato___Tomato_mosaic_virus:
    "MTKTLALVTSLAFLVAVSAAQPVKLHVPVYPDKFPNEIKDVYGVFEGRPY",
  Tomato___Tomato_Yellow_Leaf_Curl_Virus:
    "MNKYVSKTSSGSVVTLDEIRGINAQKSFGDNLYYVNFKSKHADGVRVGLGF",
  Tomato___healthy:
    "MEEEIAALVIDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQGVMVGMGQKDSYVGDEAQSKRGILTLKYPIEHGIVTNWDDMEKIWHHTFYNELR",
  Potato___Late_blight: "MKKLLALAAALAVSAPAAHAQYCDEWFKRLKNFSPKGGNFECSNGCDFPV",
  Potato___Early_blight:
    "MAFALSLALLALPAAHAECVSDGKYYCRSTGDCDPEVCGGDGSSCSNGVCGRGVC",
  Potato___healthy:
    "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQGVMVGMGQKDSYVGDEAQSKRGILTLKYPI",
  Apple___Apple_scab: "MKKFVLALVAAVLAASPLAVSAQYCGSGSCSNYCDSCKSGYCGPGYCG",
  Apple___Black_rot:
    "MRAVLLALAAALAVSAPAAHAECVSDGKYYCRSTGDCDPEVCGGDGSSCSNGVCGRGVC",
  Apple___Cedar_apple_rust: "MKSFTLALVAVLAASPLAVSAQYCGSGSCSNYCDSCKSGYCGPGYCG",
  Apple___healthy:
    "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQGVMVGMGQKDSYVGDEAQSK",
  Grape___Black_rot: "MKSFTLALVAVLAASPLAVSAQYCGSGSCSNYCDSCKSGYCGPGYCG",
  "Grape___Esca_(Black_Measles)":
    "MKKVLLLALVAAVLAVSPLAVSAQYCGNGSCSNYCDSCKSGYCGPGYCG",
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)":
    "MRAVLLALAAALAVSAPAAHAECVSDGKYYCRSTGDCDPEVCGGDGSSCSNGVCGRGVC",
  Grape___healthy: "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQGVMVGMGQKDSY",
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot":
    "MKKLLALAAALAVSAPAAHAQYCDEWFKRLKNFSPKGGNFECSNGCDFPV",
  "Corn_(maize)___Common_rust_":
    "MRAVLLALAAALAVSAPAAHAECVSDGKYYCRSTGDCDPEVCGGDGSSCSNGVCGRGVC",
  "Corn_(maize)___Northern_Leaf_Blight":
    "MKSFTLALVAVLAASPLAVSAQYCGSGSCSNYCDSCKSGYCGPGYCG",
  "Corn_(maize)___healthy": "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQGVMVG",
  "Cherry_(including_sour)___Powdery_mildew":
    "MKTLLLALVAAVLAVSAPAAHAECVSDGKYYSRSTGDCDPEVCGGDGSSCSNGVCGRGVC",
  "Cherry_(including_sour)___healthy":
    "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQGVMVG",
  Blueberry___healthy: "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQGVMVG",
  "Pepper,_bell___Bacterial_spot":
    "MGNICIGAGMAGSTALFVAKRMLERAGYPSRVDYVPGPARQRCLGCGILLP",
  "Pepper,_bell___healthy": "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQ",
  Peach___Bacterial_spot:
    "MKKVLLALAAALAVSAPAAHAECVSDGKYYCRSTGDCDPEVCGGDGSSCSNGVCGRGVC",
  Peach___healthy: "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQ",
  Strawberry___Leaf_scorch: "MKKVLLLALVAAVLAVSPLAVSAQYCGNGSCSNYCDSCKSGYCGPGYCG",
  Strawberry___healthy: "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQ",
  Squash___Powdery_mildew:
    "MKTLLLALVAAVLAVSAPAAHAECVSDGKYYSRSTGDCDPEVCGGDGSSCSNGVCGRGVC",
  Soybean___healthy: "MEEEIAALVVDNGSGMCKAGFAGDDAPRAVFPSIVGRPRHQ",
  Raspberry___healthy: "MQVWPPLRVKPFNLLVGFNTRCAIPHPRSQLFGFNT",
};

export const DISEASE_LIST = Object.keys(DISEASE_TO_UNIPROT);

const TREATMENT_DB: Record<string, TreatmentInfo> = {
  Virus: {
    chemical: [
      {
        name: "Imidacloprid 17.8% SL",
        dose: "0.3 ml/L",
        purpose: "Vector (whitefly) control",
      },
      {
        name: "Thiamethoxam 25% WG",
        dose: "0.25 g/L",
        purpose: "Vector suppression",
      },
    ],
    organic: [
      {
        name: "Neem Oil (1500 ppm)",
        dose: "3–5 ml/L",
        purpose: "Reduces vector population",
      },
      {
        name: "Yellow sticky traps",
        dose: "10–12 traps/acre",
        purpose: "Monitoring & control",
      },
    ],
  },
  Fungus: {
    chemical: [
      {
        name: "Mancozeb 75% WP",
        dose: "2–2.5 g/L",
        purpose: "Protective fungicide",
      },
      {
        name: "Carbendazim 50% WP",
        dose: "1 g/L",
        purpose: "Systemic control",
      },
    ],
    organic: [
      { name: "Neem oil", dose: "3 ml/L", purpose: "Fungal suppression" },
      {
        name: "Trichoderma viride",
        dose: "5 g/L soil drench",
        purpose: "Biocontrol",
      },
    ],
  },
  Bacterium: {
    chemical: [
      {
        name: "Copper Oxychloride 50% WP",
        dose: "2.5–3 g/L",
        purpose: "Bacterial suppression",
      },
      { name: "Streptocycline", dose: "0.1 g/L", purpose: "Bacteriostatic" },
    ],
    organic: [
      { name: "Neem extract", dose: "5 ml/L", purpose: "Reduces spread" },
      {
        name: "Field sanitation",
        dose: "Remove infected plants",
        purpose: "Prevention",
      },
    ],
  },
  Arthropod: {
    chemical: [
      { name: "Abamectin 1.9% EC", dose: "0.5 ml/L", purpose: "Mite control" },
    ],
    organic: [
      { name: "Neem oil", dose: "3 ml/L", purpose: "Mite suppression" },
    ],
  },
  Healthy: {
    chemical: [],
    organic: [
      {
        name: "Regular monitoring",
        dose: "Weekly checks",
        purpose: "Preventive care",
      },
      {
        name: "Balanced fertilizer",
        dose: "As per soil test",
        purpose: "Maintain health",
      },
    ],
  },
};

const YIELD_TIPS: Record<string, string[]> = {
  Tomato: [
    "Use certified disease-free seedlings",
    "Maintain spacing of 60 × 45 cm for airflow",
    "Apply balanced NPK (120:60:60 kg/ha)",
    "Calcium sprays to prevent blossom end rot",
    "Drip irrigation with mulching",
    "Expected yield: 60–80 tons/ha",
  ],
  Potato: [
    "Use certified seed tubers",
    "Avoid water stagnation",
    "Earth-up twice (20 and 40 days)",
    "Apply Zn and B micronutrients",
    "Practice crop rotation",
    "Expected yield: 30–40 tons/ha",
  ],
  Apple: [
    "Annual pruning for canopy management",
    "Fruit thinning to improve size",
    "Balanced NPK + calcium sprays",
    "Use disease-resistant rootstocks",
    "Expected yield: 20–25 tons/ha",
  ],
  Grape: [
    "Canopy management for sunlight penetration",
    "Drip irrigation with fertigation",
    "Apply Zn and Fe micronutrients",
    "Timely pruning and shoot thinning",
    "Expected yield: 25–30 tons/ha",
  ],
  "Corn_(maize)": [
    "Use high-yielding hybrids",
    "Split nitrogen application",
    "Maintain proper plant spacing",
    "Weed control during early growth",
    "Expected yield: 8–10 tons/ha",
  ],
  "Pepper,_bell": [
    "Use staking for better plant support",
    "Apply potassium-rich fertilizers",
    "Regular harvesting to promote fruiting",
    "Drip irrigation with mulch",
    "Expected yield: 25–35 tons/ha",
  ],
  Peach: [
    "Summer pruning for light penetration",
    "Fruit thinning for uniform size",
    "Calcium sprays for fruit firmness",
    "Expected yield: 15–20 tons/ha",
  ],
  "Cherry_(including_sour)": [
    "Bird netting during fruit set",
    "Balanced fertilization",
    "Proper irrigation during flowering",
    "Expected yield: 10–15 tons/ha",
  ],
  Strawberry: [
    "Raised bed cultivation",
    "Plastic mulch to reduce weed pressure",
    "Ensure bee pollination",
    "Expected yield: 40–60 tons/ha",
  ],
  Blueberry: [
    "Maintain acidic soil (pH 4.5–5.5)",
    "Organic mulching with pine bark",
    "Drip irrigation",
    "Expected yield: 8–12 tons/ha",
  ],
  Soybean: [
    "Seed inoculation with Rhizobium",
    "Balanced fertilization",
    "Crop rotation with cereals",
    "Expected yield: 3–4 tons/ha",
  ],
  Raspberry: [
    "Prune old canes after harvest",
    "Maintain good drainage",
    "Mulching for moisture conservation",
    "Expected yield: 10–15 tons/ha",
  ],
  Squash: [
    "Adequate pollination",
    "Apply potassium during fruiting",
    "Remove old leaves regularly",
    "Expected yield: 20–30 tons/ha",
  ],
  Orange: [
    "Maintain orchard sanitation",
    "Balanced NPK with micronutrients",
    "Use certified planting material",
    "Expected yield: 25–35 tons/ha",
  ],
};

const RECOVERY_TIMELINE: Record<Severity, string[]> = {
  Low: [
    "Immediate: Monitor plant regularly",
    "2–4 weeks: Observe symptom changes",
    "1 season: Preventive care",
  ],
  Medium: [
    "Immediate: Apply recommended treatment",
    "2–4 weeks: Remove infected leaves",
    "1 season: Improve soil and crop rotation",
  ],
  High: [
    "Immediate: Begin treatment within 24–48 hours",
    "2–4 weeks: Remove severely infected plants",
    "1 season: Strict prevention and sanitation",
  ],
};

// ─── Core Logic ──────────────────────────────────────────────────────────────

function inferPathogen(label: string): PathogenType {
  const l = label.toLowerCase();
  if (l.includes("healthy")) return "Healthy";
  if (l.includes("virus") || l.includes("mosaic")) return "Virus";
  if (l.includes("bacterial")) return "Bacterium";
  if (l.includes("mite") || l.includes("spider")) return "Arthropod";
  return "Fungus";
}

function calcHealthScore(label: string, confidence: number): number {
  const l = label.toLowerCase();
  if (l.includes("healthy")) return Math.min(100, confidence * 120);
  let base = 50;
  if (l.includes("virus")) base = 30;
  else if (l.includes("late_blight")) base = 35;
  else if (l.includes("early_blight")) base = 45;
  else if (l.includes("bacterial")) base = 40;
  return Math.max(10, base * (1 - confidence * 0.5));
}

export function simulateAnalysis(imageDataUrl?: string | null): Diagnosis {
  const src = imageDataUrl || "";
  const idx = src.length % DISEASE_LIST.length;
  const label = DISEASE_LIST[idx];
  const rawConf = 0.78 + (src.length % 21) / 100;
  const confidence = Math.round(rawConf * 1000) / 10;
  const pathogen = inferPathogen(label);
  const healthScore = Math.round(calcHealthScore(label, rawConf) * 10) / 10;
  const severity: Severity =
    healthScore >= 80 ? "Low" : healthScore >= 50 ? "Medium" : "High";
  const isHealthy = pathogen === "Healthy";
  const parts = label.includes("___") ? label.split("___") : [label, label];
  const crop = parts[0];
  const diseaseName = parts[1].replace(/_/g, " ");
  const uniprotId = DISEASE_TO_UNIPROT[label] || "N/A";
  const rawSeq = AMINO_SEQUENCES[label] || "Sequence not available";
  const aminoSequence =
    rawSeq.length > 100 ? `${rawSeq.substring(0, 100)}...` : rawSeq;

  return {
    id: "",
    label,
    crop,
    diseaseName,
    severity,
    confidencePercent: confidence,
    healthScore,
    plantStatus: isHealthy ? "HEALTHY" : "DISEASED",
    pathogen,
    uniprotId,
    aminoSequence,
    alphafoldLink:
      uniprotId !== "N/A"
        ? `https://alphafold.ebi.ac.uk/entry/${uniprotId}`
        : "N/A",
    treatment: TREATMENT_DB[pathogen] ?? TREATMENT_DB.Healthy,
    yieldTips: YIELD_TIPS[crop] ?? [
      "Maintain proper irrigation schedule",
      "Apply balanced fertilizers",
      "Monitor for pests regularly",
    ],
    recoveryTimeline: RECOVERY_TIMELINE[severity],
    timestamp: "",
  };
}

// ─── Style Helpers ───────────────────────────────────────────────────────────

export function getSeverityStyle(severity: Severity) {
  switch (severity) {
    case "Low":
      return { color: "#2e7d32", bg: "#e8f5e9" };
    case "Medium":
      return { color: "#f57c00", bg: "#fff3e0" };
    case "High":
      return { color: "#c62828", bg: "#ffebee" };
  }
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return "#2e7d32";
  if (score >= 50) return "#f57c00";
  return "#c62828";
}

export function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Persistence ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "plant_diagnoses_v2";

export function loadDiagnoses(): Diagnosis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultDiagnoses();
  } catch {
    return defaultDiagnoses();
  }
}

export function saveDiagnosis(d: Diagnosis): void {
  const all = loadDiagnoses();
  const updated = [d, ...all.slice(0, 49)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function defaultDiagnoses(): Diagnosis[] {
  const d1 = simulateAnalysis("https://example.com/leaf1.jpg?v=abc123");
  const d2 = simulateAnalysis("https://example.com/leaf2.jpg?v=defghijklmnop");
  const d3 = simulateAnalysis(
    "https://example.com/leaf3.jpg?v=qrstuvwxyzabcdefghijklmnopqrstuvwxyz1234567890",
  );
  return [
    {
      ...d1,
      id: "d1",
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      imageDataUrl: "/assets/generated/leaf-healthy.dim_400x300.jpg",
    },
    {
      ...d2,
      id: "d2",
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      imageDataUrl: "/assets/generated/leaf-diseased.dim_400x300.jpg",
    },
    {
      ...d3,
      id: "d3",
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      imageDataUrl: "/assets/generated/leaf-diseased.dim_400x300.jpg",
    },
  ];
}
