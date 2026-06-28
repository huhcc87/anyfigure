import { nanoid } from "nanoid";
import type { CanvasElement } from "@/types/index";
import {
  FigureScene,
  FigureObject,
  canvasElementToFigureObject,
  figureObjectToCanvasElement,
  createDefaultScene,
} from "@/types/figureScene";
import { importSceneFromJson } from "@/lib/export/exportJson";

export async function importJsonFile(): Promise<FigureScene> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }
      try {
        const text = await file.text();
        resolve(importSceneFromJson(text));
      } catch (err) {
        reject(err);
      }
    };
    input.oncancel = () => reject(new Error("File selection cancelled"));
    input.click();
  });
}

export function canvasElementsToScene(
  elements: CanvasElement[],
  width: number,
  height: number,
  projectName: string
): FigureScene {
  const now = new Date().toISOString();
  return {
    ...createDefaultScene(projectName),
    id: nanoid(),
    width,
    height,
    objects: elements.map(canvasElementToFigureObject),
    metadata: { createdAt: now, updatedAt: now },
  };
}

export function sceneToCanvasElements(scene: FigureScene): {
  elements: CanvasElement[];
  width: number;
  height: number;
} {
  return {
    elements: scene.objects.map((obj: FigureObject) =>
      figureObjectToCanvasElement(obj)
    ),
    width: scene.width,
    height: scene.height,
  };
}
