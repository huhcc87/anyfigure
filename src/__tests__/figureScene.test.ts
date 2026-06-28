import { describe, it, expect } from "vitest";
import {
  FigureSceneSchema,
  createDefaultScene,
  canvasElementToFigureObject,
  figureObjectToCanvasElement,
} from "@/types/figureScene";
import { exportSceneToJson, importSceneFromJson } from "@/lib/export/exportJson";

describe("FigureScene schema", () => {
  it("createDefaultScene passes validation", () => {
    const scene = createDefaultScene("Test Figure");
    expect(() => FigureSceneSchema.parse(scene)).not.toThrow();
    expect(scene.title).toBe("Test Figure");
    expect(scene.objects).toHaveLength(0);
  });

  it("scene with text object validates", () => {
    const scene = createDefaultScene();
    scene.objects.push({
      id: "obj1",
      type: "text",
      name: "Title",
      x: 100, y: 50, width: 400, height: 50,
      rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 40,
      content: "Figure 1. Pathway diagram",
    });
    expect(() => FigureSceneSchema.parse(scene)).not.toThrow();
  });

  it("scene with arrow object validates", () => {
    const scene = createDefaultScene();
    scene.objects.push({
      id: "arr1",
      type: "arrow",
      name: "Activation Arrow",
      x: 200, y: 200, width: 100, height: 10,
      rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 30,
      arrowKind: "activate",
      lineFrom: { x: 200, y: 200 },
      lineTo: { x: 300, y: 200 },
    });
    expect(() => FigureSceneSchema.parse(scene)).not.toThrow();
  });
});

describe("JSON round-trip", () => {
  it("export then import returns equivalent scene", () => {
    const scene = createDefaultScene("Round-trip Test");
    scene.objects.push({
      id: "shape1",
      type: "shape",
      name: "Panel A",
      x: 50, y: 50, width: 300, height: 200,
      rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 10,
      fill: "#e8f4f8",
      stroke: "#1e3a5f",
      strokeWidth: 2,
    });
    const json = exportSceneToJson(scene);
    const restored = importSceneFromJson(json);
    expect(restored.title).toBe(scene.title);
    expect(restored.objects).toHaveLength(1);
    expect(restored.objects[0].id).toBe("shape1");
    expect(restored.objects[0].name).toBe("Panel A");
  });

  it("invalid JSON throws on import", () => {
    expect(() => importSceneFromJson("not json")).toThrow();
  });

  it("missing required field throws on import", () => {
    const bad = JSON.stringify({ id: "x", title: "bad" });
    expect(() => importSceneFromJson(bad)).toThrow();
  });
});

describe("canvasElement ↔ FigureObject converters", () => {
  it("canvasElement → figureObject preserves fields", () => {
    const el = {
      id: "e1", type: "text" as const,
      x: 10, y: 20, width: 100, height: 40,
      rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 5,
      content: "Hello",
    };
    const obj = canvasElementToFigureObject(el);
    expect(obj.content).toBe("Hello");
    expect(obj.type).toBe("text");
  });

  it("figureObject → canvasElement maps extended types to shape", () => {
    const obj = {
      id: "o1", type: "callout" as const, name: "Note",
      x: 0, y: 0, width: 80, height: 40,
      rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 15,
    };
    const el = figureObjectToCanvasElement(obj);
    expect(el.type).toBe("shape"); // fallback for non-CanvasElement types
  });

  it("figureObject → canvasElement preserves known types", () => {
    const obj = {
      id: "o2", type: "text" as const, name: "Label",
      x: 0, y: 0, width: 80, height: 40,
      rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 40,
      content: "A",
    };
    const el = figureObjectToCanvasElement(obj);
    expect(el.type).toBe("text");
  });
});
