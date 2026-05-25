import type { FigurePlan, PanelSpec } from "@/components/figures/FigureRenderer";
import { isAiImagePlan } from "@/lib/makeEditable/isAiImagePlan";
import { getPanelTextManifest } from "@/lib/makeEditable/imageRegionUtils";
import { extractTextFromFigureImage } from "@/services/ai/geminiVision";
import { TEXT_MANIFEST_VERSION } from "@/lib/makeEditable/textManifestConstants";

function excludeChromeTexts(plan: FigurePlan, panel: PanelSpec): string[] {
  const texts: string[] = [];
  if (plan.title?.trim()) texts.push(plan.title.trim());
  if (plan.legend?.trim()) texts.push(plan.legend.trim());
  if (panel.description?.trim()) texts.push(panel.description.trim());
  return texts;
}

/** Server-side: run Gemini vision on each AI panel image → pixel manifest. */
export async function enrichPlanWithVisionDirect(
  plan: FigurePlan,
  force = false
): Promise<{ plan: FigurePlan; labelCount: number }> {
  const hasImagePanels = plan.panels?.some((p) => !!p.imageUrl);
  if (!hasImagePanels || !plan.panels?.length) {
    return { plan, labelCount: 0 };
  }

  const panels = await Promise.all(
    plan.panels.map(async (panel) => {
      if (!panel.imageUrl) return panel;

      if (panel.textNodesManifest?.regions?.length && !force) {
        if (panel.textNodesManifest.manifestVersion === TEXT_MANIFEST_VERSION) {
          return panel;
        }
      }

      try {
        const { manifest, model } = await extractTextFromFigureImage(panel.imageUrl, {
          excludeTexts: excludeChromeTexts(plan, panel),
          panelId: panel.id || panel.label,
        });

        return {
          ...panel,
          textNodesManifest: manifest,
          imageNaturalWidth: manifest.imageWidth,
          imageNaturalHeight: manifest.imageHeight,
          textRegionsModel: model,
          textRegions: undefined,
        };
      } catch (err) {
        console.error(`[enrichPlan] vision failed for panel ${panel.id || panel.label}:`, err);
        return panel;
      }
    })
  );

  const labelCount = panels.reduce((n, p) => n + (p.textNodesManifest?.regions.length || 0), 0);
  return { plan: { ...plan, panels }, labelCount };
}
