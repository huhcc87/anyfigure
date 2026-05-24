import { NextRequest, NextResponse } from "next/server";
import { getPanelScene } from "@/lib/panelScenes";

export async function POST(req: NextRequest) {
  const { label, description, dataContext, chartType, color } = await req.json();

  const scene = getPanelScene(chartType, description, dataContext);

  return NextResponse.json({
    elements: scene.elements,
    label,
    title: scene.title,
    source: "template",
    color: color || "#6366F1",
  });
}
