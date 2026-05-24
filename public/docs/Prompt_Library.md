# Prompt Library

Use these as drop-in prompts for the **Suggest prompts** feature in AI Figure Studio. Keep them short, concrete, and scoped to a single output. Add missing details (species, scale, labels, color rules) rather than writing long narratives.

## General Figure Prompt Template

> **Goal:** [schematic / pathway / workflow / anatomy / process]  
> **Subject:** [cell/tissue/organism]  
> **Key elements:** [list of 5–10 items; each becomes a labeled object]  
> **Style:** [flat / journal-ready / grayscale / color-blind-friendly]  
> **Layout:** [1 panel / 4 panels / side-by-side]  
> **Labels:** [clear, left-aligned, minimal font size, no overlap]  
> **Output:** editable vector panels with consistent line weights

---

## Scientific Illustration (Schematic) Prompts

### 1) CRISPR-Cas9 schematic (journal-ready)
Draw a journal-ready schematic of CRISPR-Cas9 gene editing: show Cas9, guide RNA binding a DNA target, double-strand break, and repair via NHEJ vs HDR with a donor template. Use flat style, minimal colors, and clean labels.

### 2) Lipid nanoparticle delivery workflow
Draw a lipid nanoparticle delivery workflow: injection → circulation → tissue targeting → cellular uptake → endosomal escape → mRNA release → translation into protein. Use arrows, small icons, and non-overlapping labels.

### 3) Tumor microenvironment overview
Draw the tumor microenvironment with tumor cells, T cells, NK cells, macrophages, fibroblasts, vasculature, and cytokines. Label each cell type and show interactions with arrows (activation vs inhibition).

### 4) Immune checkpoint pathway
Draw PD-1/PD-L1 immune checkpoint signaling: T cell receptor engagement, PD-1 binding PD-L1, downstream inhibition of T cell activation. Use a clean timeline layout with labeled steps.

### 5) Bivalent chromatin axis (PD2/hPaf1–EZH2)
Illustrate the PD2/hPaf1–EZH2 bivalent chromatin axis in cancer as a central signaling axis. NORMAL vs OVEREXPRESSION panels, H3K4me3 (green) and H3K27me3 (red) epigenetic markers, regulatory edges with arrows and T-bars, PAF1-Y inset, white background.

---

## Flowcharts Prompts

### 6) Experimental workflow flowchart
Create a flowchart for an experimental workflow: sample collection → prep → library construction → sequencing → QC → analysis → reporting. Use rectangles for steps, diamonds for decisions, and aligned connectors.

### 7) Clinical decision flowchart
Create a clinical decision flowchart: symptoms → initial test A → if positive then branch 1; if negative then test B → treatment options with inclusion criteria. Make it readable in a single column, with consistent spacing.

---

## Data Charts Prompts

### 8) Chart prompt template (with dataset)
Generate a publication-ready chart from the attached dataset:
- Chart type: [bar/line/scatter]
- X axis: [variable]
- Y axis: [variable]
- Grouping: [variable]
- Error bars: [mean ± SD or SEM]
- Style: grayscale, accessible, large axis labels
- Output: vector chart with editable text and legend

---

## Tips for users
- Click the lightbulb icon in AI Studio to insert any prompt above.
- Switch to **Data Charts** mode for chart prompts.
- After generating, click **Edit →** to adjust legend, caption, markers, and edges in Workspace.
