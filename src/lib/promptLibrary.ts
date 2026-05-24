export type PromptLibraryCategory = "template" | "schematic" | "flowchart" | "chart";

export interface LibraryPrompt {
  id: string;
  category: PromptLibraryCategory;
  title: string;
  prompt: string;
}

export const PROMPT_LIBRARY_INTRO =
  "Short, concrete prompts scoped to a single output. Add species, scale, labels, and color rules as needed.";

/** Drop-in general template — user fills bracketed fields. */
export const GENERAL_FIGURE_TEMPLATE = `Goal: [schematic / pathway / workflow / anatomy / process]
Subject: [cell / tissue / organism]
Key elements: [list 5–10 items — each becomes a labeled object]
Style: [flat / journal-ready / grayscale / color-blind-friendly]
Layout: [1 panel / 4 panels / side-by-side]
Labels: clear, left-aligned, minimal font size, no overlap
Output: editable vector panels with consistent line weights`;

export const PROMPT_LIBRARY: LibraryPrompt[] = [
  {
    id: "template-general",
    category: "template",
    title: "General figure template",
    prompt: GENERAL_FIGURE_TEMPLATE,
  },
  {
    id: "schematic-crispr",
    category: "schematic",
    title: "CRISPR-Cas9 schematic (journal-ready)",
    prompt:
      "Draw a journal-ready schematic of CRISPR-Cas9 gene editing: show Cas9, guide RNA binding a DNA target, double-strand break, and repair via NHEJ vs HDR with a donor template. Use flat style, minimal colors, and clean labels.",
  },
  {
    id: "schematic-lnp",
    category: "schematic",
    title: "Lipid nanoparticle delivery workflow",
    prompt:
      "Draw a lipid nanoparticle delivery workflow: injection → circulation → tissue targeting → cellular uptake → endosomal escape → mRNA release → translation into protein. Use arrows, small icons, and non-overlapping labels.",
  },
  {
    id: "schematic-tme",
    category: "schematic",
    title: "Tumor microenvironment overview",
    prompt:
      "Draw the tumor microenvironment with tumor cells, T cells, NK cells, macrophages, fibroblasts, vasculature, and cytokines. Label each cell type and show interactions with arrows (activation vs inhibition).",
  },
  {
    id: "schematic-checkpoint",
    category: "schematic",
    title: "Immune checkpoint pathway",
    prompt:
      "Draw PD-1/PD-L1 immune checkpoint signaling: T cell receptor engagement, PD-1 binding PD-L1, downstream inhibition of T cell activation. Use a clean timeline layout with labeled steps.",
  },
  {
    id: "schematic-chromatin",
    category: "schematic",
    title: "Bivalent chromatin axis (PD2/hPaf1–EZH2)",
    prompt:
      "Illustrate the PD2/hPaf1–EZH2 bivalent chromatin axis in cancer as a central signaling axis. NORMAL vs OVEREXPRESSION panels, H3K4me3 (green) and H3K27me3 (red) epigenetic markers, regulatory edges with arrows and T-bars, PAF1-Y inset, white background.",
  },
  {
    id: "flow-experiment",
    category: "flowchart",
    title: "Experimental workflow flowchart",
    prompt:
      "Create a flowchart for an experimental workflow: sample collection → prep → library construction → sequencing → QC → analysis → reporting. Use rectangles for steps, diamonds for decisions, and aligned connectors.",
  },
  {
    id: "flow-clinical",
    category: "flowchart",
    title: "Clinical decision flowchart",
    prompt:
      "Create a clinical decision flowchart: symptoms → initial test A → if positive then branch 1; if negative then test B → treatment options with inclusion criteria. Make it readable in a single column, with consistent spacing.",
  },
  {
    id: "chart-dataset",
    category: "chart",
    title: "Chart from dataset (template)",
    prompt: `Generate a publication-ready chart from the attached dataset:
Chart type: [bar / line / scatter]
X axis: [variable]
Y axis: [variable]
Grouping: [variable]
Error bars: [mean ± SD or SEM]
Style: grayscale, accessible, large axis labels
Output: vector chart with editable text and legend`,
  },
];

export const PROMPT_LIBRARY_SECTIONS: { category: PromptLibraryCategory; label: string }[] = [
  { category: "template", label: "Templates" },
  { category: "schematic", label: "Scientific Illustration" },
  { category: "flowchart", label: "Flowcharts" },
  { category: "chart", label: "Data Charts" },
];

/** Category chip → default prompt for AI Studio quick categories. */
export const CATEGORY_QUICK_PROMPTS: Record<string, string> = {
  Biology: PROMPT_LIBRARY.find((p) => p.id === "schematic-lnp")!.prompt,
  Medicine: PROMPT_LIBRARY.find((p) => p.id === "schematic-checkpoint")!.prompt,
  Chemistry: "Show lipid nanoparticle delivery of mRNA into hepatocytes with endosomal escape. Flat journal-ready style, white background.",
  Immunology: PROMPT_LIBRARY.find((p) => p.id === "schematic-checkpoint")!.prompt,
  Genomics: PROMPT_LIBRARY.find((p) => p.id === "flow-experiment")!.prompt,
  Cancer: PROMPT_LIBRARY.find((p) => p.id === "schematic-chromatin")!.prompt,
  Neuroscience: "Illustrate synaptic transmission with vesicle release, receptor binding, and action potential. Flat schematic, labeled steps.",
  Protocols: PROMPT_LIBRARY.find((p) => p.id === "flow-experiment")!.prompt,
  Pathways: "Depict PI3K/AKT/mTOR signaling with RTK activation, PTEN inhibition, and mTORC1 output. Arrows for activation, T-bars for inhibition.",
  "Cell Biology": PROMPT_LIBRARY.find((p) => p.id === "schematic-tme")!.prompt,
};

export function getPromptsByCategory(category: PromptLibraryCategory): LibraryPrompt[] {
  return PROMPT_LIBRARY.filter((p) => p.category === category);
}
