import type { CanvasElement } from "@/types";
import { generateId } from "@/lib/utils";

export interface ScientificTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string; // emoji placeholder
  prompt: string;
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
}

function el(overrides: Partial<CanvasElement> & { id?: string }): CanvasElement {
  return {
    id: overrides.id ?? generateId(),
    type: "shape",
    x: 0,
    y: 0,
    width: 100,
    height: 60,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    ...overrides,
  };
}

// --- Graphical Abstract template (2-panel, horizontal flow) ---
const graphicalAbstractElements: CanvasElement[] = [
  // Panel A background
  el({ id: "pa-bg", type: "shape", shapeKind: "rect", x: 40, y: 60, width: 700, height: 840, fill: "#f8faff", stroke: "#c7d2fe", strokeWidth: 1.5, zIndex: 1 }),
  el({ id: "pa-label", type: "text", textRole: "title", x: 40, y: 60, width: 700, height: 36, content: "A   Experimental Model", fill: "#1e1b4b", zIndex: 10 }),
  // Panel B background
  el({ id: "pb-bg", type: "shape", shapeKind: "rect", x: 860, y: 60, width: 700, height: 840, fill: "#f8faff", stroke: "#c7d2fe", strokeWidth: 1.5, zIndex: 1 }),
  el({ id: "pb-label", type: "text", textRole: "title", x: 860, y: 60, width: 700, height: 36, content: "B   Key Findings", fill: "#1e1b4b", zIndex: 10 }),
  // Title
  el({ id: "main-title", type: "text", textRole: "title", x: 40, y: 10, width: 1520, height: 40, content: "Graphical Abstract — Replace with Your Title", fill: "#111827", zIndex: 20 }),
  // Legend
  el({ id: "legend", type: "text", textRole: "legend", x: 40, y: 920, width: 1520, height: 60, content: "Figure 1. Replace this caption with a publication-quality description of your figure.", fill: "#374151", zIndex: 20 }),
];

// --- Multi-panel biological mechanism ---
const biologicalMechanismElements: CanvasElement[] = [
  el({ id: "title", type: "text", textRole: "title", x: 40, y: 10, width: 1520, height: 40, content: "Molecular Mechanism — Replace with Your Title", fill: "#111827", zIndex: 20 }),
  // Step 1
  el({ id: "s1", type: "shape", shapeKind: "ellipse", x: 80, y: 150, width: 180, height: 100, fill: "#6366f125", stroke: "#6366f1", strokeWidth: 2, label: "Stimulus", zIndex: 5 }),
  el({ id: "s1-lbl", type: "text", textRole: "label", x: 80, y: 260, width: 180, height: 24, content: "Stimulus", fill: "#4338ca", zIndex: 10 }),
  // Arrow 1→2
  el({ id: "a1", type: "arrow", arrowKind: "activate", lineFrom: { x: 262, y: 200 }, lineTo: { x: 380, y: 200 }, stroke: "#6366f1", strokeWidth: 2, zIndex: 8 }),
  // Step 2
  el({ id: "s2", type: "shape", shapeKind: "rect", x: 380, y: 150, width: 180, height: 100, fill: "#06b6d425", stroke: "#06b6d4", strokeWidth: 2, label: "Receptor", zIndex: 5 }),
  el({ id: "s2-lbl", type: "text", textRole: "label", x: 380, y: 260, width: 180, height: 24, content: "Receptor", fill: "#0e7490", zIndex: 10 }),
  // Arrow 2→3
  el({ id: "a2", type: "arrow", arrowKind: "activate", lineFrom: { x: 562, y: 200 }, lineTo: { x: 680, y: 200 }, stroke: "#06b6d4", strokeWidth: 2, zIndex: 8 }),
  // Step 3
  el({ id: "s3", type: "shape", shapeKind: "ellipse", x: 680, y: 150, width: 180, height: 100, fill: "#10b98125", stroke: "#10b981", strokeWidth: 2, label: "Kinase", zIndex: 5 }),
  el({ id: "s3-lbl", type: "text", textRole: "label", x: 680, y: 260, width: 180, height: 24, content: "Kinase", fill: "#059669", zIndex: 10 }),
  // Arrow 3→4
  el({ id: "a3", type: "arrow", arrowKind: "activate", lineFrom: { x: 862, y: 200 }, lineTo: { x: 980, y: 200 }, stroke: "#10b981", strokeWidth: 2, zIndex: 8 }),
  // Step 4 (outcome)
  el({ id: "s4", type: "shape", shapeKind: "rect", x: 980, y: 150, width: 180, height: 100, fill: "#f59e0b25", stroke: "#f59e0b", strokeWidth: 2, label: "Outcome", zIndex: 5 }),
  el({ id: "s4-lbl", type: "text", textRole: "label", x: 980, y: 260, width: 180, height: 24, content: "Outcome", fill: "#d97706", zIndex: 10 }),
  el({ id: "legend", type: "text", textRole: "legend", x: 40, y: 920, width: 1520, height: 60, content: "Figure 1. Replace this caption with a publication-quality description.", fill: "#374151", zIndex: 20 }),
];

// --- Cohort flow diagram (CONSORT-style) ---
const cohortFlowElements: CanvasElement[] = [
  el({ id: "title", type: "text", textRole: "title", x: 40, y: 10, width: 1520, height: 40, content: "Cohort Flow Diagram", fill: "#111827", zIndex: 20 }),
  // Enrollment
  el({ id: "enroll", type: "shape", shapeKind: "rect", x: 580, y: 80, width: 440, height: 80, fill: "#e0f2fe", stroke: "#0ea5e9", strokeWidth: 2, label: "Assessed for eligibility (n=)", zIndex: 5 }),
  el({ id: "enroll-lbl", type: "text", textRole: "label", x: 580, y: 85, width: 440, height: 70, content: "Assessed for eligibility (n=)", fill: "#0c4a6e", zIndex: 10 }),
  el({ id: "a-down1", type: "arrow", arrowKind: "activate", lineFrom: { x: 800, y: 160 }, lineTo: { x: 800, y: 240 }, stroke: "#0ea5e9", strokeWidth: 2, zIndex: 8 }),
  // Excluded
  el({ id: "excl", type: "shape", shapeKind: "rect", x: 1080, y: 200, width: 380, height: 100, fill: "#fef3c7", stroke: "#f59e0b", strokeWidth: 2, label: "Excluded (n=)", zIndex: 5 }),
  el({ id: "excl-lbl", type: "text", textRole: "label", x: 1080, y: 205, width: 380, height: 90, content: "Excluded (n=)\n  – Did not meet criteria\n  – Declined", fill: "#92400e", zIndex: 10 }),
  // Randomized
  el({ id: "rand", type: "shape", shapeKind: "rect", x: 580, y: 240, width: 440, height: 80, fill: "#e0f2fe", stroke: "#0ea5e9", strokeWidth: 2, label: "Randomized (n=)", zIndex: 5 }),
  el({ id: "rand-lbl", type: "text", textRole: "label", x: 580, y: 245, width: 440, height: 70, content: "Randomized (n=)", fill: "#0c4a6e", zIndex: 10 }),
  // Two arms
  el({ id: "a-left", type: "arrow", arrowKind: "activate", lineFrom: { x: 700, y: 320 }, lineTo: { x: 400, y: 440 }, stroke: "#0ea5e9", strokeWidth: 2, zIndex: 8 }),
  el({ id: "a-right", type: "arrow", arrowKind: "activate", lineFrom: { x: 900, y: 320 }, lineTo: { x: 1100, y: 440 }, stroke: "#0ea5e9", strokeWidth: 2, zIndex: 8 }),
  el({ id: "arm1", type: "shape", shapeKind: "rect", x: 200, y: 440, width: 400, height: 80, fill: "#d1fae5", stroke: "#10b981", strokeWidth: 2, label: "Intervention Arm (n=)", zIndex: 5 }),
  el({ id: "arm1-lbl", type: "text", textRole: "label", x: 200, y: 445, width: 400, height: 70, content: "Intervention Arm (n=)", fill: "#064e3b", zIndex: 10 }),
  el({ id: "arm2", type: "shape", shapeKind: "rect", x: 1000, y: 440, width: 400, height: 80, fill: "#fce7f3", stroke: "#ec4899", strokeWidth: 2, label: "Control Arm (n=)", zIndex: 5 }),
  el({ id: "arm2-lbl", type: "text", textRole: "label", x: 1000, y: 445, width: 400, height: 70, content: "Control Arm (n=)", fill: "#831843", zIndex: 10 }),
  el({ id: "legend", type: "text", textRole: "legend", x: 40, y: 920, width: 1520, height: 60, content: "Figure 1. CONSORT flow diagram. Replace n= values with actual counts.", fill: "#374151", zIndex: 20 }),
];

// --- AI/ML pipeline ---
const aiPipelineElements: CanvasElement[] = [
  el({ id: "title", type: "text", textRole: "title", x: 40, y: 10, width: 1520, height: 40, content: "AI/ML Pipeline — Replace with Your Title", fill: "#111827", zIndex: 20 }),
  // Data
  el({ id: "data", type: "shape", shapeKind: "rect", x: 60, y: 200, width: 220, height: 120, fill: "#ede9fe", stroke: "#8b5cf6", strokeWidth: 2, label: "Raw Data", zIndex: 5 }),
  el({ id: "data-lbl", type: "text", textRole: "label", x: 60, y: 205, width: 220, height: 110, content: "Raw Data\n(n= samples)", fill: "#4c1d95", zIndex: 10 }),
  el({ id: "a1", type: "arrow", arrowKind: "activate", lineFrom: { x: 280, y: 260 }, lineTo: { x: 380, y: 260 }, stroke: "#8b5cf6", strokeWidth: 2, zIndex: 8 }),
  // Preprocessing
  el({ id: "prep", type: "shape", shapeKind: "rect", x: 380, y: 200, width: 220, height: 120, fill: "#dbeafe", stroke: "#3b82f6", strokeWidth: 2, label: "Preprocessing", zIndex: 5 }),
  el({ id: "prep-lbl", type: "text", textRole: "label", x: 380, y: 205, width: 220, height: 110, content: "Preprocessing\nNormalization / QC", fill: "#1e3a8a", zIndex: 10 }),
  el({ id: "a2", type: "arrow", arrowKind: "activate", lineFrom: { x: 600, y: 260 }, lineTo: { x: 700, y: 260 }, stroke: "#3b82f6", strokeWidth: 2, zIndex: 8 }),
  // Feature extraction
  el({ id: "feat", type: "shape", shapeKind: "rect", x: 700, y: 200, width: 220, height: 120, fill: "#d1fae5", stroke: "#10b981", strokeWidth: 2, label: "Features", zIndex: 5 }),
  el({ id: "feat-lbl", type: "text", textRole: "label", x: 700, y: 205, width: 220, height: 110, content: "Feature\nExtraction", fill: "#064e3b", zIndex: 10 }),
  el({ id: "a3", type: "arrow", arrowKind: "activate", lineFrom: { x: 920, y: 260 }, lineTo: { x: 1020, y: 260 }, stroke: "#10b981", strokeWidth: 2, zIndex: 8 }),
  // Model
  el({ id: "model", type: "shape", shapeKind: "ellipse", x: 1020, y: 190, width: 220, height: 140, fill: "#fef3c7", stroke: "#f59e0b", strokeWidth: 2, label: "ML Model", zIndex: 5 }),
  el({ id: "model-lbl", type: "text", textRole: "label", x: 1020, y: 195, width: 220, height: 130, content: "ML Model\n(e.g. Random Forest)", fill: "#78350f", zIndex: 10 }),
  el({ id: "a4", type: "arrow", arrowKind: "activate", lineFrom: { x: 1240, y: 260 }, lineTo: { x: 1340, y: 260 }, stroke: "#f59e0b", strokeWidth: 2, zIndex: 8 }),
  // Output
  el({ id: "out", type: "shape", shapeKind: "rect", x: 1340, y: 200, width: 220, height: 120, fill: "#fce7f3", stroke: "#ec4899", strokeWidth: 2, label: "Output", zIndex: 5 }),
  el({ id: "out-lbl", type: "text", textRole: "label", x: 1340, y: 205, width: 220, height: 110, content: "Output\nPredictions", fill: "#831843", zIndex: 10 }),
  el({ id: "legend", type: "text", textRole: "legend", x: 40, y: 920, width: 1520, height: 60, content: "Figure 1. AI/ML pipeline overview. Replace with your specific methods.", fill: "#374151", zIndex: 20 }),
];

export const SCIENTIFIC_TEMPLATES: ScientificTemplate[] = [
  {
    id: "graphical-abstract",
    name: "Graphical Abstract",
    category: "publication",
    description: "2-panel graphical abstract for journal submission",
    thumbnail: "🎨",
    prompt: "Create a graphical abstract showing the key experimental model and main findings of the study.",
    elements: graphicalAbstractElements,
    canvasWidth: 1600,
    canvasHeight: 1000,
  },
  {
    id: "biological-mechanism",
    name: "Biological Mechanism",
    category: "pathway",
    description: "Horizontal pathway showing stimulus → receptor → kinase → outcome",
    thumbnail: "🔬",
    prompt: "Create a horizontal pathway diagram showing a biological mechanism with 4 steps.",
    elements: biologicalMechanismElements,
    canvasWidth: 1600,
    canvasHeight: 1000,
  },
  {
    id: "cohort-flow",
    name: "Cohort Flow (CONSORT)",
    category: "clinical",
    description: "CONSORT-style participant flow diagram",
    thumbnail: "📊",
    prompt: "Create a CONSORT participant flow diagram for a randomized controlled trial.",
    elements: cohortFlowElements,
    canvasWidth: 1600,
    canvasHeight: 1000,
  },
  {
    id: "ai-ml-pipeline",
    name: "AI/ML Pipeline",
    category: "computational",
    description: "Data → Preprocessing → Features → Model → Output",
    thumbnail: "🤖",
    prompt: "Create a machine learning pipeline diagram showing data flow from raw input to predictions.",
    elements: aiPipelineElements,
    canvasWidth: 1600,
    canvasHeight: 1000,
  },
  {
    id: "blank-2panel",
    name: "Blank 2-Panel",
    category: "blank",
    description: "Empty 2-panel canvas with A/B labels",
    thumbnail: "⬜",
    prompt: "Create a blank 2-panel figure layout with Panel A and Panel B.",
    elements: [
      el({ id: "title", type: "text", textRole: "title", x: 40, y: 10, width: 1520, height: 40, content: "Figure Title — Replace with Your Title", fill: "#111827", zIndex: 20 }),
      el({ id: "pa-bg", type: "shape", shapeKind: "rect", x: 40, y: 60, width: 740, height: 840, fill: "#f9fafb", stroke: "#e5e7eb", strokeWidth: 1, zIndex: 1 }),
      el({ id: "pa-lbl", type: "text", textRole: "label", x: 40, y: 68, width: 740, height: 30, content: "A", fill: "#1f2937", zIndex: 10 }),
      el({ id: "pb-bg", type: "shape", shapeKind: "rect", x: 820, y: 60, width: 740, height: 840, fill: "#f9fafb", stroke: "#e5e7eb", strokeWidth: 1, zIndex: 1 }),
      el({ id: "pb-lbl", type: "text", textRole: "label", x: 820, y: 68, width: 740, height: 30, content: "B", fill: "#1f2937", zIndex: 10 }),
      el({ id: "legend", type: "text", textRole: "legend", x: 40, y: 920, width: 1520, height: 60, content: "Figure 1. Replace this caption with a publication-quality description.", fill: "#374151", zIndex: 20 }),
    ],
    canvasWidth: 1600,
    canvasHeight: 1000,
  },
];

export function getTemplateById(id: string): ScientificTemplate | undefined {
  return SCIENTIFIC_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): ScientificTemplate[] {
  return SCIENTIFIC_TEMPLATES.filter((t) => t.category === category);
}
