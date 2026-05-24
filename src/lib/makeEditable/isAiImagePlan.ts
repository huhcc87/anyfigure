import type { FigurePlan } from "@/components/figures/FigureRenderer";

/** Figure uses Gemini raster panel(s) rather than pure vector assembly. */
export function isAiImagePlan(plan: FigurePlan): boolean {
  const panels = plan.panels || [];
  if (plan.mode === "image") return panels.some((p) => !!p.imageUrl);
  return panels.length > 0 && panels.every((p) => !!p.imageUrl);
}
