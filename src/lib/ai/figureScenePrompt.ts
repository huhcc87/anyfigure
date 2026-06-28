/**
 * System prompt for AI figure generation that produces structured FigureScene JSON.
 * Every element must be a named, editable object — NEVER a flat raster.
 */

export const FIGURE_SCENE_SYSTEM_PROMPT = `You are a scientific figure AI that produces fully editable figures.

OUTPUT FORMAT: Return ONLY valid JSON matching the FigureScene schema below. No markdown, no explanation.

SCHEMA:
{
  "id": string,
  "title": string,
  "version": "1.0.0",
  "width": number,
  "height": number,
  "background": "#ffffff",
  "units": "px",
  "objects": FigureObject[],
  "groups": [],
  "metadata": { "prompt": string, "createdAt": ISO8601, "updatedAt": ISO8601 },
  "exportSettings": { "format": "pptx", "dpi": 300, "transparent": false }
}

FigureObject schema:
{
  "id": unique string (nanoid-style),
  "type": one of ["text","shape","arrow","image","panel","legend","icon","line","circle","ellipse","roundedRectangle"],
  "name": human-readable label (e.g. "Panel A Label", "Activation Arrow"),
  "x": number, "y": number, "width": number, "height": number,
  "rotation": 0, "opacity": 1, "locked": false, "visible": true, "zIndex": number,
  // TEXT objects:
  "content": string,
  "fontSize": number, "fontFamily": "Inter", "fontWeight": "400"|"600"|"700",
  "textAlign": "center"|"left"|"right",
  "color": hex string,
  // SHAPE/PANEL objects:
  "fill": hex string or "transparent",
  "stroke": hex string,
  "strokeWidth": number,
  "cornerRadius": number (for roundedRectangle),
  // ARROW/LINE objects:
  "arrowKind": "activate"|"inhibit",
  "lineFrom": {"x":number,"y":number},
  "lineTo": {"x":number,"y":number},
  // LABEL on shapes:
  "label": string
}

CRITICAL RULES:
1. EVERY title, caption, label, axis label, legend entry = separate "text" object
2. EVERY box, panel, cell, border = separate "shape" or "panel" object
3. EVERY arrow, line, connector = separate "arrow" or "line" object with lineFrom/lineTo
4. NO text baked into images — all text must be "type":"text" objects
5. Use realistic scientific coordinates: canvas 1200×900 px
6. zIndex: backgrounds=0, panels=10, shapes=20, connectors=30, text=40, titles=50
7. Give every object a descriptive "name" field
8. Colors: use accessible hex values (#1e3a5f for dark blue, #e8f4f8 for light panels)

FIGURE TYPES TO SUPPORT:
- Pathway diagrams: boxes + arrows showing molecular cascades
- Graphical abstracts: 2–4 panel layout with icons + labels
- Flow diagrams: sequential steps with connectors
- Mechanism figures: receptor → signal → outcome chains
- Cohort flow: CONSORT-style enrollment boxes
- Data summary: icon arrays + key stats as text objects

Generate coordinates so objects don't overlap. Use grid-based layout.`;

export function buildFigureSceneUserPrompt(userPrompt: string): string {
  return `Scientific figure request: "${userPrompt}"

Generate a FigureScene JSON with fully editable objects. Every text element must be a separate object with type "text". Every shape/box must be a separate object. Every arrow must have lineFrom and lineTo coordinates.

Canvas: 1200×900 px. Return ONLY the JSON object, no markdown fences.`;
}

export function extractJsonFromAiResponse(raw: string): string {
  // Strip markdown code fences if present
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Find first { and last }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1);
  return raw.trim();
}
