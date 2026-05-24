import type { BiomedicalAsset } from "@/types/biomedicalAssets";
import type { CanvasElement } from "@/types";
import { generateId } from "@/lib/utils";

export function createBiomedicalCanvasElement(
  asset: BiomedicalAsset,
  x = 300,
  y = 250
): Omit<CanvasElement, "id" | "zIndex"> {
  const w = asset.defaultSize?.width ?? 100;
  const h = asset.defaultSize?.height ?? 100;
  const color = asset.category === "tumor-cells" ? "#EF4444" : "#6366f1";

  return {
    type: "biomedical",
    assetId: asset.id,
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    label: asset.name,
    content: asset.emoji || asset.icon || asset.name.slice(0, 2),
    fill: `${color}20`,
    stroke: color,
    strokeWidth: 2,
    partRole: "part",
    scientificName: asset.scientificName,
    assetDescription: asset.description,
    biomedicalCategory: asset.category,
    assetEmoji: asset.emoji,
  };
}

export function createBiomedicalElementWithId(
  asset: BiomedicalAsset,
  x: number,
  y: number,
  zIndex: number
): CanvasElement {
  return {
    ...createBiomedicalCanvasElement(asset, x, y),
    id: generateId("bio"),
    zIndex,
  };
}
