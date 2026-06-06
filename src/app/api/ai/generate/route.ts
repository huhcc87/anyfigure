import { NextRequest, NextResponse } from "next/server";
import { formatApiError } from "@/lib/apiErrors";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, figureType, scientificField, journalStyle, numPanels } = body;

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const isDeepSeek = !!process.env.DEEPSEEK_API_KEY;

  const baseUrl = isDeepSeek
    ? "https://api.deepseek.com/v1"
    : "https://api.openai.com/v1";
  const model = isDeepSeek ? "deepseek-chat" : "gpt-4o";

  const systemPrompt = `You are an expert scientific figure designer specializing in biomedical visualizations for high-impact journals. 
Generate a detailed, structured figure plan as JSON. Be specific about what each panel should show scientifically.`;

  const userPrompt = `Create a publication-ready figure plan for a ${journalStyle}-style paper in ${scientificField}.

Research topic: ${prompt}
Figure Type: ${figureType}
Number of Panels: ${numPanels}

IMPORTANT: For each panel, choose the MOST APPROPRIATE chartType from EXACTLY this list:
- "bar-chart" → quantitative comparisons, expression levels, cell counts, % values
- "kaplan-meier" → survival curves, time-to-event data
- "volcano-plot" → differential gene expression, -log10(p) vs log2FC
- "heatmap" → gene expression matrices, correlation matrices, multi-sample omics data
- "line-chart" → tumor growth curves, dose-response, time-series data
- "flow-cytometry" → immune cell populations, FACS scatter plots
- "pie-chart" → cell composition, proportion data
- "western-blot" → protein expression validation (bands), immunoblot
- "microscopy" → imaging data, IF/IHC/confocal fluorescence panels
- "crispr-schematic" → CRISPR/Cas9 editing, guide RNA, DSB repair
- "pathway-signaling" → kinase cascades (MAPK, PI3K, JAK-STAT, Wnt)
- "immune-checkpoint" → PD-1/PD-L1, CAR-T, immune synapse, TME
- "cell-schematic" → cell diagram with organelles, receptor-ligand, intracellular signaling
- "mechanism-diagram" → step-by-step process, protein complex, MOA
- "timeline-diagram" → disease progression, treatment timeline, workflow steps
- "molecular-structure" → protein domain structure, DNA/RNA, binding interface

Return ONLY valid JSON:
{
  "title": "concise scientific figure title (≤12 words)",
  "colorPalette": ["#6366F1","#06B6D4","#10B981","#F59E0B","#EF4444","#8B5CF6"],
  "legend": "Figure 1. [One-paragraph publication-quality legend describing all panels, methods, statistics, and n values]",
  "suggestedLayout": "grid",
  "panels": [
    {
      "id": "panel-a",
      "label": "A",
      "chartType": "one of the chartType values above — REQUIRED",
      "type": "brief type label",
      "description": "2–3 sentence scientific description of exactly what data this panel shows",
      "dataContext": "specific gene names, cell types, conditions, statistics relevant to this panel"
    }
  ]
}`;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key configured. Add DEEPSEEK_API_KEY to .env.local" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: formatApiError(err, "Figure plan generation failed") },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const plan = JSON.parse(content);
    const maxPanels = Math.max(1, Math.min(Number(numPanels) || 1, 6));
    if (Array.isArray(plan.panels) && plan.panels.length > maxPanels) {
      plan.panels = plan.panels.slice(0, maxPanels);
    }

    return NextResponse.json({ plan, model });
  } catch (err) {
    console.error("AI generate error:", err);
    return NextResponse.json(
      { error: "AI generation failed", details: String(err) },
      { status: 500 }
    );
  }
}
