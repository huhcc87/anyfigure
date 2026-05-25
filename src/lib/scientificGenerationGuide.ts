import { isEpigenChromatinText } from "@/lib/panelScenes";

/** Publication-grade schematic prompt framework (see docs/AnyFigure_Scientific_Generation_Guide.md). */
export function buildSchematicImagePrompt(opts: {
  label: string;
  description: string;
  dataContext?: string;
  scientificField?: string;
  style?: string;
  inputMode?: string;
}): string {
  const { label, description, dataContext, scientificField, style, inputMode } = opts;
  const goal = [description, dataContext].filter(Boolean).join(". ") || "the biological mechanism";
  const modePrefix =
    inputMode === "sketch"
      ? "Convert the uploaded sketch into a polished scientific figure. "
      : inputMode === "ref"
        ? "Match the style of the reference figure. "
        : "";

  const epigenBlock = isEpigenChromatinText(`${description} ${dataContext}`)
    ? `
Include two comparative schematic panels (NORMAL vs OVEREXPRESSION) separated by a vertical divider.
Show bivalent chromatin with H3K4me3 (green circles) and H3K27me3 (red circles) epigenetic markers on nucleosomes.
Show MLL1/COMPASS, EZH2/PRC2, and PD2/hPaf1 protein complexes with regulatory edges (arrows + T-bars).
Include a PAF1-Y inset call-out box.`
    : "";

  return `${modePrefix}Scientific Schematic Illustration — VISUAL SHAPES ONLY, NO TEXT WHATSOEVER.

Goal: Illustrate ${goal} as a central signaling axis. Panel ${label}.

═════════════════════════════════════════════════════════════════
⛔ CRITICAL RULE — ZERO TEXT IN THE IMAGE ⛔
═════════════════════════════════════════════════════════════════
You MUST NOT render ANY text, letters, numbers, words, abbreviations,
panel labels, axis labels, protein names, gene names, captions, titles,
or annotations of ANY kind in the output image.

NO "Panel A". NO "MLL1/COMPASS". NO "MUC4". NO "H3K4me3". NO "Normal".
NO "OVEREXPRESSION". NO arrows with text. NO callouts with text.
NOT EVEN unreadable scribbles that look like text.

Text will be added as a separate editable layer AFTER generation. If
you draw any text into the pixels, it creates duplicate labels that
cannot be removed and ruins downstream editing.

INSTEAD, draw ONLY the visual elements: protein blobs, cell shapes,
membrane lines, DNA/RNA helices, methyl/m6A circle markers, arrows
(WITHOUT text), T-bar inhibitors, organelle outlines, tissue cross-
sections. Use color and shape alone to convey identity — the user
will type protein names into editable overlays themselves.

If you cannot generate a figure without text, generate an empty white
canvas — that is preferable to baked-in labels.

Visual Requirements:
- Nodes: Use colored blobs / ellipses / molecular shapes for proteins,
  cells, organelles — but DO NOT WRITE THEIR NAMES inside them.
- Regulatory Edges: Sharp arrows for activation and T-bars for
  inhibition. Arrows must NOT carry text labels.
- Epigenetic Markers: Small high-contrast circles (green for H3K4me3,
  red for H3K27me3, yellow for m6A) — but DO NOT write "H3K4me3" /
  "m6A" anywhere; the shape's color carries the identity.
- Layout: Stark white background, minimal palette, symmetrical.${epigenBlock}

Field: ${scientificField || "biomedical"}. ${style || "Flat 2D vector, Nature journal style."} No watermarks. ABSOLUTELY NO TEXT.`;
}

export const GENERATION_GUIDE_SECTIONS = [
  {
    title: "Professional Prompting",
    body: "Use signaling axis, regulatory edges, and epigenetic markers in your prompt. Gemini 3 Pro renders publication-grade schematics on a white background.",
  },
  {
    title: "Key Terms",
    items: [
      { term: "Signaling Axis", desc: "Overarching pathway flow (e.g., EGFR-to-Chromatin)" },
      { term: "Regulatory Edge", desc: "Arrows (activation) or T-bars (inhibition)" },
      { term: "Epigenetic Marker", desc: "PTM indicators — H3K4me3 / H3K27me3 circles" },
      { term: "Schematic Panel", desc: "Individual boxed sections within the diagram" },
      { term: "Inset", desc: "Magnified call-out for complex domains (e.g., PAF1-Y)" },
    ],
  },
  {
    title: "Prompt Library",
    body: "Click the lightbulb icon next to the prompt box for drop-in templates: CRISPR, LNP delivery, TME, checkpoints, flowcharts, and chart datasets. Add species, scale, and labels as needed.",
  },
  {
    title: "Workspace Editing",
    body: "After Edit →, your AI figure stays visible. Toggle Epigenetic Markers, Regulatory Edges, or Signaling Axis in the Layers panel to show and move individual parts. Double-click Legend/Caption to edit text.",
  },
] as const;
