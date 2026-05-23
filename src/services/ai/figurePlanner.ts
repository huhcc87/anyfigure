import type { AIGenerationRequest, CanvasElement } from "@/types";
import { generateId } from "@/lib/utils";

export interface FigurePlan {
  title: string;
  panels: PanelSpec[];
  colorPalette: string[];
  legend: string;
  suggestedLayout: "grid" | "linear" | "radial";
}

export interface PanelSpec {
  id: string;
  label: string;
  type: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function planFigure(
  request: AIGenerationRequest,
  apiKey?: string
): Promise<FigurePlan> {
  const systemPrompt = `You are an expert scientific figure designer specializing in biomedical visualizations. 
Generate a structured figure plan based on the user's prompt. Return valid JSON only.`;

  const userPrompt = `Create a figure plan for:
Prompt: ${request.prompt}
Figure Type: ${request.figureType}
Scientific Field: ${request.scientificField}
Journal Style: ${request.journalStyle}

Return a JSON object with: title, panels (array with id, label, type, description, x, y, width, height), 
colorPalette (array of hex colors), legend (string), suggestedLayout (grid|linear|radial).`;

  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content) as FigurePlan;
    } catch (err) {
      console.error("Figure planner API error:", err);
    }
  }

  // Fallback mock plan
  return getMockFigurePlan(request);
}

function getMockFigurePlan(request: AIGenerationRequest): FigurePlan {
  return {
    title: request.prompt.slice(0, 60),
    colorPalette: ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"],
    legend: `Figure 1. ${request.prompt}. Generated with AnyFigure AI.`,
    suggestedLayout: "grid",
    panels: [
      {
        id: generateId("panel"),
        label: "A",
        type: "pathway",
        description: "Main molecular pathway diagram",
        x: 0,
        y: 0,
        width: 400,
        height: 350,
      },
      {
        id: generateId("panel"),
        label: "B",
        type: "chart",
        description: "Quantitative analysis",
        x: 420,
        y: 0,
        width: 350,
        height: 350,
      },
      {
        id: generateId("panel"),
        label: "C",
        type: "cell-diagram",
        description: "Cellular context",
        x: 0,
        y: 370,
        width: 370,
        height: 300,
      },
      {
        id: generateId("panel"),
        label: "D",
        type: "mechanism",
        description: "Proposed mechanism",
        x: 390,
        y: 370,
        width: 380,
        height: 300,
      },
    ],
  };
}

export function planToElements(plan: FigurePlan): Partial<CanvasElement>[] {
  return plan.panels.map((panel, i) => ({
    type: "shape" as const,
    x: panel.x + 50,
    y: panel.y + 50,
    width: panel.width,
    height: panel.height,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    label: `Panel ${panel.label}: ${panel.description}`,
    fill: plan.colorPalette[i % plan.colorPalette.length] + "20",
    stroke: plan.colorPalette[i % plan.colorPalette.length],
    strokeWidth: 2,
    zIndex: i,
  }));
}
