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
Show bivalent chromatin with H3K4me3 (green circles) and H3K27me3 (red circles) markers on nucleosomes, clearly labeled.
Show MLL1/COMPASS, EZH2/PRC2, and PD2/hPaf1 protein complexes with regulatory edges (arrows + T-bars) and labels.`
    : "";

  return `${modePrefix}Create a publication-ready BIOMEDICAL GRAPHICAL ABSTRACT in the polished BioRender / FigureLabs editorial style.

Topic: ${goal}

═════════════════════════════════════════════════════════════════
LAYOUT — clean multi-panel graphical abstract
═════════════════════════════════════════════════════════════════
- Organize the figure into 3–5 clearly bounded panels with rounded-corner
  section headers (colored header bars: teal, indigo, orange, purple).
- Logical left-to-right narrative flow: inputs/samples → methods/profiling
  → results → conclusion. Use arrows to connect panels.
- A bottom conclusion strip summarizing the key takeaway.

VISUAL STYLE
- Flat 2D vector medical illustration. Soft modern palette
  (indigo, teal, coral, purple, slate). Clean, lots of whitespace.
- Use rich biomedical iconography: human body silhouettes, anatomical
  organs (colon/tumor), DNA double helix, RNA-seq plots, lab equipment,
  Venn diagrams, bar charts with error bars, cells, proteins.
- Rounded panel borders, subtle shadows, professional spacing.

TEXT — render CLEAN, CORRECTLY SPELLED labels (this is required)
- Render every gene name, panel title, sample label, and annotation as
  CRISP, perfectly legible, correctly spelled text. NO typos, NO garbled
  or distorted letters. Sans-serif font. High contrast (dark slate text).
- Label panels, axes, genes, conditions, and the conclusion clearly —
  exactly like a real journal graphical abstract.

BACKGROUND
- Pure WHITE (#FFFFFF) filling the ENTIRE frame edge-to-edge. NO black
  bars, NO letterboxing, NO dark borders, NO outer margins.${epigenBlock}

Field: ${scientificField || "biomedical"}. ${style || "Flat 2D vector, BioRender editorial style."} No watermarks. Wide 16:9 landscape composition.`;
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
