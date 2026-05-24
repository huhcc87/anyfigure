import type { AssemblyElement } from "@/components/figures/assembly/BioAssets";

export interface PanelScene {
  title: string;
  elements: AssemblyElement[];
}

function normalizeChartType(chartType?: string): string {
  return (chartType || "").toLowerCase().replace(/[-_\s]/g, "");
}

const EPIGEN_KEYWORDS = [
  "ezh2", "chromatin", "h3k4", "h3k27", "paf1", "bivalent", "epigen",
  "prc2", "compass", "pd2", "hpaf1", "mll1", "chd1", "pa f1",
  "muc4", "pdac", "metastasis", "cut&tag", "cuttag", "nucleosome",
  "transcription activation", "promoter",
];

export function isEpigenChromatinText(text: string): boolean {
  const t = text.toLowerCase();
  return EPIGEN_KEYWORDS.some((k) => t.includes(k));
}

/** Curated BioRender-style scenes — reliable layouts, no AI coordinates */
export function getPanelScene(
  chartType: string | undefined,
  description: string,
  dataContext?: string
): PanelScene {
  const ct = normalizeChartType(chartType);
  const ctx = dataContext || description;
  const fullText = [description, dataContext, chartType].filter(Boolean).join(" ");

  const scenes: Record<string, PanelScene> = {
    immunecheckpoint: {
      title: "Tumor Immune Microenvironment",
      elements: [
        { type: "label", x: 250, y: 38, text: "Immune Checkpoint Axis", color: "#E2E8F0", size: 11 },
        { type: "tcell", x: 90, y: 130, r: 32, active: true },
        { type: "label", x: 90, y: 175, text: "CD8+ T cell", color: "#818CF8", size: 8 },
        { type: "tcell", x: 90, y: 250, r: 24, active: false },
        { type: "label", x: 90, y: 285, text: "Exhausted T cell", color: "#64748B", size: 7 },
        { type: "tumor", x: 380, y: 155, r: 55 },
        { type: "protein", x: 230, y: 95, w: 52, h: 24, label: "PD-1", color: "#F59E0B" },
        { type: "protein", x: 310, y: 195, w: 52, h: 24, label: "PD-L1", color: "#EF4444" },
        { type: "arrow", x1: 120, y1: 110, x2: 205, y2: 100, color: "#F59E0B", label: "binds" },
        { type: "inhibit", x1: 155, y1: 75, x2: 210, y2: 95 },
        { type: "protein", x: 155, y: 55, w: 70, h: 22, label: "Anti-PD-1", color: "#10B981" },
        { type: "macrophage", x: 380, y: 280, r: 28 },
        { type: "cell", x: 250, y: 290, r: 22, color: "#8B5CF6", label: "Treg" },
        { type: "box", x: 340, y: 55, w: 90, h: 28, color: "#EF4444", label: "TME", dashed: true },
        { type: "label", x: 250, y: 330, text: ctx.slice(0, 60), color: "#64748B", size: 7 },
      ],
    },
    crisprschematic: {
      title: "CRISPR-Cas9 Gene Editing",
      elements: [
        { type: "label", x: 250, y: 38, text: "CRISPR-Cas9 Mechanism", color: "#E2E8F0", size: 11 },
        { type: "rna", x: 80, y: 80, width: 120, color: "#06B6D4" },
        { type: "label", x: 140, y: 65, text: "sgRNA", color: "#67E8F9", size: 8 },
        { type: "protein", x: 250, y: 95, w: 70, h: 32, label: "Cas9", color: "#6366F1" },
        { type: "arrow", x1: 200, y1: 88, x2: 215, y2: 92, color: "#06B6D4" },
        { type: "dna", x: 250, y: 160, height: 80, color: "#8B5CF6" },
        { type: "label", x: 250, y: 155, text: "Target locus", color: "#A78BFA", size: 8 },
        { type: "arrow", x1: 250, y1: 127, x2: 250, y2: 155, color: "#6366F1", label: "cleavage" },
        { type: "box", x: 100, y: 270, w: 80, h: 28, color: "#F59E0B", label: "NHEJ" },
        { type: "box", x: 320, y: 270, w: 80, h: 28, color: "#10B981", label: "HDR" },
        { type: "arrow", x1: 220, y1: 250, x2: 140, y2: 270, color: "#F59E0B" },
        { type: "arrow", x1: 280, y1: 250, x2: 360, y2: 270, color: "#10B981" },
        { type: "label", x: 250, y: 320, text: ctx.slice(0, 55), color: "#64748B", size: 7 },
      ],
    },
    epigenchromatin: {
      title: "Bivalent Chromatin Axis",
      elements: [
        { type: "label", x: 125, y: 22, text: "NORMAL", color: "#2563EB", size: 13 },
        { type: "label", x: 375, y: 22, text: "PD2/hPaf1 OVEREXPRESSION", color: "#EA580C", size: 9 },
        { type: "box", x: 247, y: 45, w: 2, h: 250, color: "#CBD5E1", label: "" },

        // ── LEFT: balanced bivalent state ──
        { type: "protein", x: 125, y: 58, w: 105, h: 28, label: "MLL1/COMPASS complex", color: "#3B82F6" },
        { type: "protein", x: 125, y: 218, w: 100, h: 28, label: "EZH2/PRC2 complex", color: "#EC4899" },
        { type: "dna", x: 125, y: 128, height: 48, color: "#6366F1" },
        { type: "nucleosome", x: 62, y: 118, w: 34, h: 20, color: "#3B82F6" },
        { type: "nucleosome", x: 98, y: 118, w: 34, h: 20, color: "#3B82F6" },
        { type: "nucleosome", x: 134, y: 118, w: 34, h: 20, color: "#3B82F6" },
        { type: "nucleosome", x: 170, y: 118, w: 34, h: 20, color: "#3B82F6" },
        // Epigenetic markers — active (H3K4me3)
        { type: "marker", x: 72, y: 100, r: 7, color: "#10B981", label: "H3K4me3" },
        { type: "marker", x: 108, y: 98, r: 6, color: "#10B981" },
        { type: "marker", x: 144, y: 100, r: 6, color: "#10B981" },
        { type: "marker", x: 180, y: 98, r: 6, color: "#10B981" },
        // Epigenetic markers — repressive (H3K27me3)
        { type: "marker", x: 82, y: 158, r: 7, color: "#EF4444", label: "H3K27me3" },
        { type: "marker", x: 118, y: 160, r: 6, color: "#EF4444" },
        { type: "marker", x: 154, y: 158, r: 6, color: "#EF4444" },
        { type: "marker", x: 190, y: 160, r: 6, color: "#EF4444" },
        // Regulatory edges
        { type: "arrow", x1: 125, y1: 72, x2: 125, y2: 92, color: "#10B981", label: "Active Mark" },
        { type: "arrow", x1: 125, y1: 232, x2: 125, y2: 168, color: "#EF4444", label: "Repressive Mark" },
        { type: "label", x: 125, y: 188, text: "Signaling Axis", color: "#6366F1", size: 8 },
        { type: "label", x: 125, y: 252, text: "Balanced State", color: "#64748B", size: 9 },
        { type: "label", x: 125, y: 272, text: "Bivalent Promoter · Tumor Suppressor Gene", color: "#64748B", size: 7 },

        // ── RIGHT: PD2/hPaf1 overexpression ──
        { type: "protein", x: 375, y: 48, w: 82, h: 26, label: "PD2/hPaf1", color: "#F97316" },
        { type: "protein", x: 340, y: 88, w: 105, h: 28, label: "MLL1/COMPASS complex", color: "#3B82F6" },
        { type: "protein", x: 418, y: 218, w: 100, h: 28, label: "EZH2/PRC2 complex", color: "#EC4899" },
        { type: "dna", x: 375, y: 128, height: 48, color: "#6366F1" },
        { type: "nucleosome", x: 312, y: 118, w: 34, h: 20, color: "#3B82F6" },
        { type: "nucleosome", x: 348, y: 118, w: 34, h: 20, color: "#3B82F6" },
        { type: "nucleosome", x: 384, y: 118, w: 34, h: 20, color: "#3B82F6" },
        { type: "nucleosome", x: 420, y: 118, w: 34, h: 20, color: "#3B82F6" },
        { type: "nucleosome", x: 456, y: 118, w: 34, h: 20, color: "#3B82F6" },
        { type: "marker", x: 318, y: 96, r: 8, color: "#10B981", label: "H3K4me3 ↑" },
        { type: "marker", x: 348, y: 94, r: 7, color: "#10B981" },
        { type: "marker", x: 378, y: 92, r: 7, color: "#10B981" },
        { type: "marker", x: 408, y: 94, r: 7, color: "#10B981" },
        { type: "marker", x: 438, y: 96, r: 8, color: "#10B981" },
        { type: "marker", x: 468, y: 98, r: 7, color: "#10B981" },
        { type: "marker", x: 328, y: 162, r: 5, color: "#EF4444", label: "H3K27me3 loss", dashed: true },
        { type: "marker", x: 398, y: 164, r: 5, color: "#EF4444", dashed: true },
        // Signaling axis & regulatory edges
        { type: "arrow", x1: 375, y1: 62, x2: 350, y2: 78, color: "#F97316", label: "Recruitment" },
        { type: "arrow", x1: 340, y1: 102, x2: 325, y2: 108, color: "#10B981", label: "Increased H3K4me3" },
        { type: "inhibit", x1: 395, y1: 200, x2: 430, y2: 215, label: "Displacement" },
        { type: "arrow", x1: 375, y1: 248, x2: 430, y2: 248, color: "#10B981", label: "Gene Activation" },
        { type: "label", x: 375, y: 232, text: "Active State", color: "#10B981", size: 9 },
        { type: "label", x: 375, y: 272, text: "Tumor Suppressor Gene Promoter", color: "#64748B", size: 7 },

        // PAF1-Y inset
        { type: "box", x: 205, y: 288, w: 90, h: 48, color: "#94A3B8", label: "PAF1-Y INSET", dashed: true },
        { type: "label", x: 250, y: 348, text: ctx.slice(0, 60), color: "#64748B", size: 7 },
      ],
    },
    pathwaysignaling: {
      title: "Signaling Pathway",
      elements: [
        { type: "label", x: 250, y: 38, text: "MAPK / ERK Cascade", color: "#E2E8F0", size: 11 },
        { type: "protein", x: 250, y: 75, w: 90, h: 26, label: "Growth Factor", color: "#06B6D4" },
        { type: "arrow", x1: 250, y1: 88, x2: 250, y2: 108, color: "#06B6D4" },
        { type: "protein", x: 250, y: 125, w: 60, h: 26, label: "RAS", color: "#6366F1" },
        { type: "arrow", x1: 250, y1: 138, x2: 250, y2: 158, color: "#6366F1" },
        { type: "protein", x: 250, y: 175, w: 55, h: 26, label: "RAF", color: "#6366F1" },
        { type: "arrow", x1: 250, y1: 188, x2: 250, y2: 208, color: "#8B5CF6" },
        { type: "protein", x: 250, y: 225, w: 65, h: 26, label: "MEK1/2", color: "#8B5CF6" },
        { type: "arrow", x1: 250, y1: 238, x2: 250, y2: 258, color: "#10B981" },
        { type: "protein", x: 250, y: 275, w: 75, h: 26, label: "ERK → Nucleus", color: "#10B981" },
        { type: "inhibit", x1: 380, y1: 125, x2: 310, y2: 125 },
        { type: "protein", x: 400, y: 125, w: 55, h: 22, label: "Inhibitor", color: "#EF4444" },
        { type: "label", x: 250, y: 320, text: ctx.slice(0, 55), color: "#64748B", size: 7 },
      ],
    },
    cellschematic: {
      title: "Cellular Mechanism",
      elements: [
        { type: "label", x: 250, y: 38, text: "Intracellular Signaling", color: "#E2E8F0", size: 11 },
        { type: "cell", x: 250, y: 190, r: 90, color: "#6366F1", label: "" },
        { type: "nucleus", x: 250, y: 200, rx: 38, ry: 28 },
        { type: "protein", x: 120, y: 120, w: 65, h: 24, label: "Receptor", color: "#06B6D4" },
        { type: "protein", x: 120, y: 80, w: 55, h: 22, label: "Ligand", color: "#06B6D4" },
        { type: "arrow", x1: 120, y1: 102, x2: 120, y2: 108, color: "#06B6D4" },
        { type: "arrow", x1: 155, y1: 130, x2: 195, y2: 165, color: "#6366F1", label: "activate" },
        { type: "protein", x: 340, y: 155, w: 70, h: 24, label: "Kinase", color: "#8B5CF6" },
        { type: "arrow", x1: 305, y1: 165, x2: 275, y2: 185, color: "#8B5CF6" },
        { type: "rna", x: 250, y: 240, width: 80, color: "#10B981" },
        { type: "label", x: 250, y: 320, text: ctx.slice(0, 55), color: "#64748B", size: 7 },
      ],
    },
    mechanismdiagram: {
      title: "Mechanism of Action",
      elements: [
        { type: "label", x: 250, y: 38, text: "Drug Mechanism", color: "#E2E8F0", size: 11 },
        { type: "protein", x: 100, y: 100, w: 70, h: 28, label: "Drug", color: "#10B981" },
        { type: "arrow", x1: 135, y1: 114, x2: 175, y2: 140, color: "#10B981", label: "binds" },
        { type: "protein", x: 220, y: 155, w: 80, h: 28, label: "Target", color: "#6366F1" },
        { type: "inhibit", x1: 260, y1: 183, x2: 260, y2: 230 },
        { type: "protein", x: 260, y: 250, w: 90, h: 28, label: "Downstream", color: "#EF4444" },
        { type: "tcell", x: 380, y: 120, r: 28, active: true },
        { type: "tumor", x: 380, y: 240, r: 40 },
        { type: "arrow", x1: 380, y1: 148, x2: 380, y2: 200, color: "#10B981", label: "kill" },
        { type: "label", x: 250, y: 320, text: ctx.slice(0, 55), color: "#64748B", size: 7 },
      ],
    },
    molecularstructure: {
      title: "Molecular Structure",
      elements: [
        { type: "label", x: 250, y: 38, text: "Molecular Complex", color: "#E2E8F0", size: 11 },
        { type: "dna", x: 120, y: 100, height: 100, color: "#8B5CF6" },
        { type: "protein", x: 250, y: 130, w: 80, h: 36, label: "Protein A", color: "#6366F1" },
        { type: "protein", x: 380, y: 130, w: 80, h: 36, label: "Protein B", color: "#06B6D4" },
        { type: "arrow", x1: 290, y1: 148, x2: 340, y2: 148, color: "#F59E0B", label: "interface" },
        { type: "antibody", x: 250, y: 220, color: "#10B981" },
        { type: "label", x: 250, y: 260, text: "Binding interface", color: "#94A3B8", size: 8 },
        { type: "label", x: 250, y: 320, text: ctx.slice(0, 55), color: "#64748B", size: 7 },
      ],
    },
    timelinediagram: {
      title: "Experimental Timeline",
      elements: [
        { type: "label", x: 250, y: 38, text: "Study Timeline", color: "#E2E8F0", size: 11 },
        { type: "box", x: 60, y: 120, w: 70, h: 40, color: "#06B6D4", label: "Day 0" },
        { type: "box", x: 160, y: 120, w: 70, h: 40, color: "#6366F1", label: "Day 7" },
        { type: "box", x: 260, y: 120, w: 70, h: 40, color: "#8B5CF6", label: "Day 14" },
        { type: "box", x: 360, y: 120, w: 70, h: 40, color: "#10B981", label: "Day 28" },
        { type: "arrow", x1: 130, y1: 140, x2: 160, y2: 140, color: "#64748B" },
        { type: "arrow", x1: 230, y1: 140, x2: 260, y2: 140, color: "#64748B" },
        { type: "arrow", x1: 330, y1: 140, x2: 360, y2: 140, color: "#64748B" },
        { type: "label", x: 95, y: 200, text: "Baseline", color: "#64748B", size: 7 },
        { type: "label", x: 195, y: 200, text: "Treatment", color: "#64748B", size: 7 },
        { type: "label", x: 295, y: 200, text: "Analysis", color: "#64748B", size: 7 },
        { type: "label", x: 395, y: 200, text: "Endpoint", color: "#64748B", size: 7 },
        { type: "label", x: 250, y: 320, text: ctx.slice(0, 55), color: "#64748B", size: 7 },
      ],
    },
  };

  if (isEpigenChromatinText(fullText)) {
    return { ...scenes.epigenchromatin, title: description.slice(0, 50) || scenes.epigenchromatin.title };
  }

  if (scenes[ct]) {
    return { ...scenes[ct], title: description.slice(0, 50) || scenes[ct].title };
  }

  for (const [key, scene] of Object.entries(scenes)) {
    if (key === "mechanismdiagram" && isEpigenChromatinText(fullText)) continue;
    if (ct.includes(key) || key.includes(ct)) {
      return { ...scene, title: description.slice(0, 50) || scene.title };
    }
  }

  const desc = fullText.toLowerCase();
  if (desc.includes("immune") || desc.includes("checkpoint") || desc.includes("pd-1") || desc.includes("pd-l1")) {
    return scenes.immunecheckpoint;
  }
  if (desc.includes("crispr") || desc.includes("cas9")) return scenes.crisprschematic;
  if (desc.includes("pathway") || desc.includes("signaling") || desc.includes("mapk")) return scenes.pathwaysignaling;
  if (desc.includes("mechanism") || desc.includes("drug")) return scenes.mechanismdiagram;
  if (desc.includes("timeline") || desc.includes("workflow")) return scenes.timelinediagram;

  return {
    title: description.slice(0, 50) || "Scientific Diagram",
    elements: [
      { type: "label", x: 250, y: 38, text: description.slice(0, 40), color: "#E2E8F0", size: 10 },
      { type: "cell", x: 130, y: 160, r: 45, color: "#6366F1", label: "Cell A" },
      { type: "cell", x: 370, y: 160, r: 45, color: "#06B6D4", label: "Cell B" },
      { type: "protein", x: 250, y: 120, w: 80, h: 28, label: "Mediator", color: "#8B5CF6" },
      { type: "arrow", x1: 175, y1: 150, x2: 210, y2: 130, color: "#6366F1" },
      { type: "arrow", x1: 290, y1: 130, x2: 325, y2: 150, color: "#06B6D4" },
      { type: "dna", x: 250, y: 240, height: 60, color: "#10B981" },
      { type: "label", x: 250, y: 320, text: ctx.slice(0, 55), color: "#64748B", size: 7 },
    ],
  };
}

export function isDataChartType(chartType?: string): boolean {
  const ct = normalizeChartType(chartType);
  return [
    "barchart", "kaplanmeier", "volcanoplot", "heatmap",
    "linechart", "piechart", "flowcytometry", "westernblot", "microscopy",
  ].some((t) => ct.includes(t.replace(/[-_\s]/g, "")) || t.includes(ct));
}

export function isSchematicType(chartType?: string): boolean {
  const ct = normalizeChartType(chartType);
  return [
    "crispr", "pathway", "immune", "cellschematic", "mechanism",
    "timeline", "molecular", "signaling", "checkpoint",
  ].some((t) => ct.includes(t));
}
