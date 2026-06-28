import { FigureScene, FigureSceneSchema } from "@/types/figureScene";

export function exportSceneToJson(scene: FigureScene): string {
  return JSON.stringify(scene, null, 2);
}

export function downloadSceneJson(
  scene: FigureScene,
  filename = `${scene.title.replace(/\s+/g, "_")}.json`
): void {
  const blob = new Blob([exportSceneToJson(scene)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSceneFromJson(jsonStr: string): FigureScene {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Invalid JSON: could not parse input");
  }
  return FigureSceneSchema.parse(parsed);
}
