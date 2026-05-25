import { NextResponse } from "next/server";
import type { FigurePlan } from "@/components/figures/FigureRenderer";
import { buildEditableAssets } from "@/lib/makeEditable/buildEditableAssets";
import { enrichPlanWithVisionDirect } from "@/lib/makeEditable/enrichPlanVision";

export const maxDuration = 120;

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as { plan?: FigurePlan; force?: boolean };

    if (!body.plan?.panels?.length) {
      return NextResponse.json(
        { status: "error", message: "Figure plan with panels is required" },
        { status: 400 }
      );
    }

    const { plan: enriched, labelCount } = await enrichPlanWithVisionDirect(body.plan, body.force);
    const assets = buildEditableAssets(enriched, id);
    const editorUrl = `/workspace?figure=${encodeURIComponent(id)}&editable=1`;

    return NextResponse.json({
      status: "ok",
      figureId: id,
      plan: enriched,
      svgContent: assets.svg,
      svgUrl: assets.svgUrl,
      textNodes: assets.textNodes,
      textNodesUrl: assets.textNodesUrl,
      width: assets.width,
      height: assets.height,
      elementCount: assets.elementCount,
      labelCount,
      editorUrl,
    });
  } catch (err) {
    console.error("[make-editable] conversion failed:", err);
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : "Conversion failed" },
      { status: 500 }
    );
  }
}
