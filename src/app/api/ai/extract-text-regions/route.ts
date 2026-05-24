import { NextResponse } from "next/server";
import type { FigurePlan } from "@/components/figures/FigureRenderer";
import { enrichPlanWithVisionDirect } from "@/lib/makeEditable/enrichPlanVision";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { plan?: FigurePlan; force?: boolean };
    const plan = body.plan;

    if (!plan?.panels?.length) {
      return NextResponse.json({ error: "plan with panels required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY required for label detection" },
        { status: 503 }
      );
    }

    const { plan: enriched, labelCount } = await enrichPlanWithVisionDirect(plan, body.force);

    return NextResponse.json({
      status: "ok",
      plan: enriched,
      labelCount,
    });
  } catch (err) {
    console.error("[extract-text-regions]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Text extraction failed" },
      { status: 500 }
    );
  }
}
