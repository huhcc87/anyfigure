import type { FigurePlan } from "@/components/figures/FigureRenderer";
import { buildEditableAssets } from "@/lib/makeEditable/buildEditableAssets";
import { getPanelTextManifest } from "@/lib/makeEditable/imageRegionUtils";
import {
  editableRecordFromAssets,
  getEditableFigure,
  saveEditableFigure,
  type EditableFigureRecord,
} from "@/lib/makeEditable/editableFigureStore";

/** Call Gemini vision to detect diagram labels and merge into plan. */
export async function enrichPlanWithVision(
  plan: FigurePlan,
  force = false
): Promise<{ plan: FigurePlan; labelCount: number }> {
  const hasImagePanels = plan.panels?.some((p) => !!p.imageUrl);
  if (!hasImagePanels) {
    return { plan, labelCount: 0 };
  }

  const needsExtract = plan.panels?.some((p) => p.imageUrl && (!getPanelTextManifest(p)?.regions.length || force));
  if (!needsExtract) {
    const count = plan.panels?.reduce((n, p) => n + (getPanelTextManifest(p)?.regions.length || 0), 0) || 0;
    return { plan, labelCount: count };
  }

  const res = await fetch("/api/ai/extract-text-regions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, force }),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = "Label detection failed";
    try { msg = JSON.parse(text).error || msg; } catch { /* use default */ }
    throw new Error(msg);
  }
  const data = await res.json();
  return { plan: data.plan as FigurePlan, labelCount: data.labelCount || 0 };
}

/** Build editable record synchronously (no vision). */
export function buildEditableRecordSync(
  figureId: string,
  plan: FigurePlan,
  pngUrl?: string
): EditableFigureRecord {
  const assets = buildEditableAssets(plan, figureId);
  return editableRecordFromAssets(figureId, assets, pngUrl);
}

/** Detect labels + build editable SVG/text_nodes (FigureLabs-style). */
export async function buildEditableRecordAsync(
  figureId: string,
  plan: FigurePlan,
  pngUrl?: string,
  forceVision = false
): Promise<{ record: EditableFigureRecord; plan: FigurePlan; labelCount: number }> {
  const { plan: enriched, labelCount } = await enrichPlanWithVision(plan, forceVision);
  const record = buildEditableRecordSync(figureId, enriched, pngUrl);
  return { record, plan: enriched, labelCount };
}

export async function persistEditableAssets(
  figureId: string,
  plan: FigurePlan,
  pngUrl?: string,
  forceVision = false
): Promise<EditableFigureRecord> {
  const { record } = await buildEditableRecordAsync(figureId, plan, pngUrl, forceVision);
  await saveEditableFigure(record);
  return record;
}

export async function loadOrBuildEditableAssets(
  figureId: string,
  plan: FigurePlan,
  pngUrl?: string
): Promise<EditableFigureRecord> {
  const existing = await getEditableFigure(figureId);
  if (existing?.textNodes?.nodes?.length && plan.panels?.some((p) => getPanelTextManifest(p)?.regions.length)) {
    return existing;
  }
  return persistEditableAssets(figureId, plan, pngUrl, false);
}
