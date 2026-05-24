import { NextRequest, NextResponse } from "next/server";
import { getPanelScene } from "@/lib/panelScenes";
import { assemblePanelSVG } from "@/components/figures/assembly/BioAssets";

export async function POST(req: NextRequest) {
  const { label, description, dataContext, chartType, color } = await req.json();

  const scene = getPanelScene(chartType, description, dataContext);
  const svg = assemblePanelSVG({
    label,
    title: scene.title,
    elements: scene.elements,
    color: color || "#6366F1",
    width: 500,
    height: 360,
  });

  return NextResponse.json({
    svg,
    label,
    title: scene.title,
    elements: scene.elements,
    source: "template",
  });
}
