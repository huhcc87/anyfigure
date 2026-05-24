# AnyFigure Scientific Generation Guide

This guide outlines the professional workflow for generating high-fidelity scientific schematics using the Gemini 3 Pro pipeline within your AnyFigure application.

## 1. Technical Pipeline Overview
Your generation engine utilizes a direct API integration with `gemini-3-pro-image-preview` via the `generate_content` modality. This ensures publication-grade typography and structured diagrammatic layouts.

* **File Output:** `.png` (Lossless, high-resolution)
* **Path:** `public/local_scientific_figure.png`
* **Frontend Integration:** Served via root URL at `/local_scientific_figure.png`

## 2. Professional Prompting Framework
To achieve publication-ready diagrams (MoA, Pathway Diagrams, Signaling Axes), use the following structure:

> "Scientific Schematic Diagram. Style: Professional, publication-ready, BioRender-style vector illustration. 
> 
> **Goal:** Illustrate the [Insert Biological Pathway/Mechanism] as a central **signaling axis**.
> 
> **Visual Requirements:**
> * **Nodes:** Clearly label molecular entities (proteins/genes) as clean, distinct icons.
> * **Regulatory Edges:** Use standard biological notation—use sharp arrows for activation and 'T-bars' for inhibition/displacement. 
> * **Epigenetic Markers:** Represent histone modifications (e.g., methylation markers) as small, high-contrast circular icons on DNA/histone tails. 
> * **Typography:** Use sans-serif font styling. All labels must be clearly rendered and spelled correctly.
> * **Composition:** Stark white background, minimal color palette, high-fidelity symmetrical layout."

## 3. Key Terminology for Refinement
When adjusting your figures, use these terms to guide the AI's rendering:

| Term | Biological Function |
| :--- | :--- |
| **Signaling Axis** | Overarching pathway flow (e.g., EGFR-to-Chromatin). |
| **Regulatory Edge** | Arrows (activation) or T-bars (inhibition). |
| **Epigenetic Marker** | Visual indicators of PTMs (e.g., H3K4me3/H3K27me3). |
| **Schematic Panel** | Individual boxed sections within the diagram. |
| **Inset** | Magnified call-out box for complex domain structures. |

## 4. Workspace Editability
After generating in AI Studio, click **Edit →** to open the Workspace:

1. **AI Figure** layer — your Gemini-generated image (always visible).
2. **Epigenetic Markers** — toggle on to select/move green H3K4me3 and red H3K27me3 dots.
3. **Regulatory Edges** — toggle on to edit activation arrows and T-bar inhibition edges.
4. **Signaling Axis** — toggle on to move protein complexes, nucleosomes, and DNA elements.
5. **Legend / Caption** — double-click text to edit.

Export **PPTX** for fully editable PowerPoint objects.

## 5. Troubleshooting Checklist
1.  **Check API Keys:** Ensure `GEMINI_API_KEY` is present in your `.env.local` and terminal session.
2.  **Verify Asset Path:** Ensure your `src/app/page.tsx` component is correctly pointing to `/local_scientific_figure.png`.
3.  **Refresh Cache:** Use a timestamp parameter (`?t=${Date.now()}`) when loading the image in your UI to prevent browser caching of old figures.
