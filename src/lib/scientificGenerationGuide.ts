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

  return `${modePrefix}Scientific Schematic Diagram. Style: Professional, publication-ready, BioRender-style vector illustration.

Goal: Illustrate ${goal} as a central signaling axis. Panel ${label}.

Visual Requirements:
- Nodes: Clearly label molecular entities (proteins/genes) as clean, distinct icons.
- Regulatory Edges: Sharp arrows for activation and T-bars for inhibition/displacement.
- Epigenetic Markers: Histone modifications (H3K4me3/H3K27me3) as small, high-contrast circular icons on DNA/histone tails.
- Typography: Sans-serif font styling. All labels clearly rendered and spelled correctly.
- Composition: Stark white background, minimal color palette, high-fidelity symmetrical layout.${epigenBlock}

Field: ${scientificField || "biomedical"}. ${style || "Flat 2D vector, Nature journal style."} No watermarks.`;
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
