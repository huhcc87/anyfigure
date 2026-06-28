import { NextRequest, NextResponse } from "next/server";
import { formatApiError } from "@/lib/apiErrors";
import { chatCompletion, hasLlmProvider } from "@/lib/llmClient";

export const maxDuration = 120;

const SYSTEM = `You are a scientific figure architect. You output ONLY a JSON SCENE GRAPH of vector primitives for a biomedical / pathway figure. Every primitive is rendered as a real editable canvas element — NO raster images, NO opaque text-in-image artifacts. Think of yourself as Figma + BioRender: name every shape, position it, label it; the user will be able to move, recolor, retype each one in a vector editor.

ABSOLUTE RULES:
- Output ONLY the JSON object below — no prose, no markdown fences, no commentary.
- Coordinates are in a fixed canvas: 1600 px wide × 1000 px tall. (0,0) is top-left. y grows downward.
- Place all content within margins: x ∈ [40, 1560], y ∈ [60, 940].
- Every element must have an "id" unique within the figure.
- Arrows must reference real (x,y) points OR another element's id via "fromId"/"toId" (we resolve endpoints automatically).
- Use 16–30 elements total — a real graphical abstract is RICH. Fewer than 14 looks empty.
- Choose element "type" from EXACTLY this list — anything else is rejected:
    "text" | "shape" | "arrow" | "biomedical"
- For shape, choose "shapeKind" from: "rect" | "ellipse" | "marker" | "nucleosome"
- For arrow, choose "arrowKind" from: "activate" (solid arrowhead) | "inhibit" (T-bar)
- For biomedical, set "assetId" to one of these pre-built vector assets:
  dna-rna: dna-rna-dna-double-helix, dna-rna-rna-strand, dna-rna-mrna, dna-rna-trna, dna-rna-mirna, dna-rna-promoter, dna-rna-enhancer, dna-rna-chromosome, dna-rna-plasmid, dna-rna-crispr-guide-rna
  proteins: proteins-generic-protein, proteins-enzyme, proteins-antibody, proteins-receptor, proteins-kinase, proteins-transcription-factor, proteins-mlh1, proteins-msh2, proteins-cas9, proteins-dcas9, proteins-polymerase, proteins-histone, proteins-cytokine
  bacteria: bacteria-e-coli, bacteria-fusobacterium-nucleatum, bacteria-bacteroides-fragilis, bacteria-lactobacillus
  immune-cells, cells, tumor-cells, organs, lab-equipment categories also exist — only use IDs from this list (made-up IDs silently fail).

SHAPE SEMANTICS (so the figure reads like a real schematic, not a wireframe):
- protein blob → shape rect or ellipse, filled with low-opacity color, stroke darker, label inside.
- cell or nucleus → shape ellipse with light fill, label below.
- mRNA / DNA strand → if you want a true helix/wave use biomedical with dna-rna-dna-double-helix or dna-rna-rna-strand. Otherwise a thin rect.
- methyl mark / m6A modification → shape marker (small filled circle) attached to a strand.
- nucleosome → shape nucleosome (renders the cyan barrel).
- pathway arrow → arrow with arrowKind:"activate".
- inhibition / repression edge → arrow with arrowKind:"inhibit".
- panel title → text with textRole:"title", fontSize:18.
- gene/protein label → text with textRole:"label", fontSize:13, fill chosen to match the shape it labels.

OUTPUT JSON SHAPE (strict):
{
  "title": "≤12 word figure title",
  "legend": "Figure 1. One-paragraph publication-quality caption.",
  "canvasWidth": 1600,
  "canvasHeight": 1000,
  "elements": [
    { "id": "t1", "type": "text", "textRole": "title", "x": 60, "y": 50, "width": 1480, "height": 40, "content": "...", "fill": "#0f172a" },
    { "id": "p1", "type": "shape", "shapeKind": "ellipse", "x": 200, "y": 200, "width": 120, "height": 80, "label": "METTL3", "content": "METTL3", "fill": "#6366f1", "stroke": "#4338ca", "strokeWidth": 1.5 },
    { "id": "p2", "type": "shape", "shapeKind": "ellipse", "x": 600, "y": 200, "width": 120, "height": 80, "label": "MUC4 mRNA", "content": "MUC4 mRNA", "fill": "#06b6d4", "stroke": "#0891b2", "strokeWidth": 1.5 },
    { "id": "a1", "type": "arrow", "fromId": "p1", "toId": "p2", "arrowKind": "activate", "stroke": "#475569", "strokeWidth": 2, "label": "m6A" },
    { "id": "lbl1", "type": "text", "textRole": "label", "x": 200, "y": 290, "width": 120, "height": 20, "content": "Writer", "fill": "#4338ca", "fontSize": 12 },
    { "id": "bio1", "type": "biomedical", "assetId": "dna-rna-dna-double-helix", "x": 400, "y": 700, "width": 240, "height": 100, "label": "MUC4 locus" }
  ]
}

DESIGN PRINCIPLES (think before placing):
- Plan a clear horizontal flow: cause → mechanism → outcome reads left-to-right or top-to-bottom.
- Give every shape ≥ 20 px of breathing room from any other shape.
- Use a small palette of 3–5 semantic colors (e.g. writers = indigo, readers = teal, erasers = amber).
- Position arrows along straight or near-straight lines — never overlap a shape.
- A figure with 2 panels: split the canvas vertically at x ≈ 800 and label "Panel A" / "Panel B" with text textRole:"title" fontSize:16 at y ≈ 80.

GRAPHICAL ABSTRACT LAYOUT (match FigureLabs / BioRender quality):
- Organize into 3–5 clearly bounded sections that read left-to-right as a
  narrative: samples/inputs → methods/profiling → results → conclusion.
- Give each section a COLORED HEADER BAR: a shape rect (height ~32, full
  section width) filled with a section color (teal #14b8a6, indigo #6366f1,
  orange #f97316, purple #8b5cf6), with a white text title centered on it.
- Inside each section place the relevant biomedical assets (use the
  "biomedical" type generously: bodies, organs, dna-rna, proteins, cells,
  bacteria) plus labels — every gene/condition gets its own text label.
- Connect sections with activate arrows showing the flow.
- Add a bottom CONCLUSION STRIP: a wide light-filled rect spanning the
  canvas near y ≈ 880 with a one-line takeaway text on top of it.
- Use a soft modern palette and keep generous whitespace between sections.

Now: read the user's research prompt and emit a RICH scene graph JSON.`;

interface GenerateSceneBody {
  prompt: string;
  scientificField?: string;
  journalStyle?: string;
  numPanels?: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateSceneBody;
  const { prompt, scientificField = "biomedical", journalStyle = "Nature", numPanels = 2 } = body;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  if (!hasLlmProvider()) {
    return NextResponse.json(
      { error: "No LLM API key configured. Add DEEPSEEK_API_KEY or OPENAI_API_KEY to .env.local" },
      { status: 400 }
    );
  }

  const userPrompt = `Field: ${scientificField}
Journal style: ${journalStyle}
Number of panels: ${numPanels}

Research prompt:
${prompt}

Emit the scene-graph JSON now.`;

  try {
    const { content, model } = await chatCompletion({
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 16000,
    });

    let scene: unknown;
    try {
      // Repair truncated JSON — find last complete object/array
      let jsonStr = content.trim();
      if (!jsonStr.endsWith("}") && !jsonStr.endsWith("]")) {
        const lastBrace = jsonStr.lastIndexOf("}");
        const lastBracket = jsonStr.lastIndexOf("]");
        const cut = Math.max(lastBrace, lastBracket);
        if (cut > 0) jsonStr = jsonStr.slice(0, cut + 1);
        // Close any unclosed outer braces
        const opens = (jsonStr.match(/{/g) || []).length;
        const closes = (jsonStr.match(/}/g) || []).length;
        for (let i = 0; i < opens - closes; i++) jsonStr += "}";
      }
      scene = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("Scene parse error:", parseErr, content.slice(0, 500));
      return NextResponse.json({ error: "Scene graph was not valid JSON — try a shorter prompt" }, { status: 500 });
    }

    return NextResponse.json({ scene, model });
  } catch (err) {
    console.error("[generate-scene] failed:", err);
    return NextResponse.json(
      { error: formatApiError(err, "Scene generation failed") },
      { status: 500 }
    );
  }
}
