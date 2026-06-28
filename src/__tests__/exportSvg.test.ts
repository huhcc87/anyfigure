import { describe, it, expect } from "vitest";
import { exportElementsToSvg } from "@/lib/export/exportSvg";
import type { CanvasElement } from "@/types/index";

function el(overrides: Partial<CanvasElement> & { id: string }): CanvasElement {
  return {
    type: "shape",
    x: 10, y: 10, width: 100, height: 50,
    rotation: 0, opacity: 1, locked: false, visible: true, zIndex: 1,
    ...overrides,
  } as CanvasElement;
}

describe("exportElementsToSvg", () => {
  it("produces valid SVG root element", () => {
    const svg = exportElementsToSvg([], 800, 600);
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain("800");
    expect(svg).toContain("600");
  });

  it("text element becomes <text> with unique id", () => {
    const elements = [el({ id: "t1", type: "text", content: "Pathway A" })];
    const svg = exportElementsToSvg(elements, 800, 600);
    expect(svg).toContain("<text");
    expect(svg).toContain('id="t1"');
    expect(svg).toContain("Pathway A");
  });

  it("shape element becomes <rect>", () => {
    const elements = [el({ id: "s1", type: "shape", shapeKind: "rect" })];
    const svg = exportElementsToSvg(elements, 800, 600);
    expect(svg).toContain("<rect");
    expect(svg).toContain('id="s1"');
  });

  it("arrow element uses <line> with marker", () => {
    const elements = [el({
      id: "a1",
      type: "arrow",
      arrowKind: "activate",
      lineFrom: { x: 50, y: 100 },
      lineTo: { x: 200, y: 100 },
    })];
    const svg = exportElementsToSvg(elements, 800, 600);
    expect(svg).toContain("<line");
    expect(svg).toContain("arrowhead");
  });

  it("each element has unique data-object-id", () => {
    const elements = [
      el({ id: "e1", type: "text", content: "A" }),
      el({ id: "e2", type: "shape" }),
    ];
    const svg = exportElementsToSvg(elements, 800, 600);
    expect(svg).toContain('data-object-id="e1"');
    expect(svg).toContain('data-object-id="e2"');
  });

  it("includes metadata block", () => {
    const svg = exportElementsToSvg([], 800, 600);
    expect(svg).toContain("<metadata>");
    expect(svg).toContain("AnyFigure");
  });
});
