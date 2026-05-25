import { NextResponse } from "next/server";
import { applyTextEdits } from "@/lib/makeEditable/buildEditableAssets";
import type { TextNodesDocument } from "@/types/editableFigure";

export const maxDuration = 30;

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      edits: { id: string; newText: string }[];
      svgContent: string;
      textNodes: TextNodesDocument;
    };

    if (!body.edits?.length || !body.svgContent || !body.textNodes) {
      return NextResponse.json(
        { status: "error", message: "edits, svgContent, and textNodes are required" },
        { status: 400 }
      );
    }

    const { svg, textNodes } = applyTextEdits(body.svgContent, body.textNodes, body.edits);
    const textNodesJson = JSON.stringify(textNodes, null, 2);
    const svgUrl =
      typeof Buffer !== "undefined"
        ? `data:image/svg+xml;base64,${Buffer.from(svg, "utf-8").toString("base64")}`
        : svg;
    const textNodesUrl =
      typeof Buffer !== "undefined"
        ? `data:application/json;base64,${Buffer.from(textNodesJson, "utf-8").toString("base64")}`
        : textNodesJson;

    return NextResponse.json({
      status: "ok",
      figureId: id,
      svgContent: svg,
      svgUrl,
      textNodes,
      textNodesUrl,
    });
  } catch (err) {
    console.error("[text-edits] failed:", err);
    return NextResponse.json({ status: "error", message: "Text edit apply failed" }, { status: 500 });
  }
}
