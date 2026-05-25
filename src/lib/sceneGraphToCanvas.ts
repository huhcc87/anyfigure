import type { CanvasElement } from "@/types";
import { generateId } from "@/lib/utils";

/** One node in the LLM-generated scene graph. Mirrors the JSON shape the
 *  /api/ai/generate-scene endpoint asks the model to produce. */
export interface SceneNode {
  id: string;
  type: "text" | "shape" | "arrow" | "biomedical";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  content?: string;
  label?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  textRole?: "title" | "legend" | "caption" | "label";
  shapeKind?: "rect" | "ellipse" | "marker" | "nucleosome";
  arrowKind?: "activate" | "inhibit";
  assetId?: string;
  /** Arrow endpoints — either explicit coords OR ids of two other elements. */
  fromId?: string;
  toId?: string;
  from?: { x: number; y: number };
  to?: { x: number; y: number };
}

export interface SceneGraph {
  title?: string;
  legend?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  elements?: SceneNode[];
}

const CANVAS_W = 1600;
const CANVAS_H = 1000;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function centerOf(node: SceneNode): { x: number; y: number } {
  const x = (node.x ?? 0) + (node.width ?? 0) / 2;
  const y = (node.y ?? 0) + (node.height ?? 0) / 2;
  return { x, y };
}

/** Resolve an arrow endpoint: prefer an element id reference (so the arrow
 *  snaps to the center of the referenced shape), fall back to literal x/y. */
function resolveEndpoint(
  pointId: string | undefined,
  literal: { x: number; y: number } | undefined,
  nodesById: Map<string, SceneNode>
): { x: number; y: number } {
  if (pointId && nodesById.has(pointId)) {
    return centerOf(nodesById.get(pointId)!);
  }
  if (literal) return literal;
  return { x: CANVAS_W / 2, y: CANVAS_H / 2 };
}

/** Convert one LLM scene node into a CanvasElement the editor renders. */
function nodeToCanvasElement(
  node: SceneNode,
  nodesById: Map<string, SceneNode>,
  zIndex: number
): CanvasElement | null {
  const id = node.id || generateId(node.type);

  if (node.type === "text") {
    return {
      id,
      type: "text",
      x: clamp(node.x ?? 60, 0, CANVAS_W),
      y: clamp(node.y ?? 60, 0, CANVAS_H),
      width: Math.max(node.width ?? 200, 40),
      height: Math.max(node.height ?? 24, 16),
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: node.content ?? node.label ?? "Text",
      fill: node.fill ?? "#0f172a",
      textRole: node.textRole ?? "label",
      zIndex,
    };
  }

  if (node.type === "shape") {
    return {
      id,
      type: "shape",
      shapeKind: node.shapeKind ?? "ellipse",
      x: clamp(node.x ?? 100, 0, CANVAS_W),
      y: clamp(node.y ?? 100, 0, CANVAS_H),
      width: Math.max(node.width ?? 100, 20),
      height: Math.max(node.height ?? 60, 20),
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      label: node.label ?? node.content,
      content: node.content ?? node.label,
      fill: node.fill
        ? // accept either "#rrggbb" (use as is) or already-rgba — but darken slightly for readability
          node.fill.length === 7
          ? node.fill + "33" // add ~20% alpha so labels stay readable on top
          : node.fill
        : "rgba(99,102,241,0.20)",
      stroke: node.stroke ?? "#6366f1",
      strokeWidth: node.strokeWidth ?? 1.5,
      partRole: "part",
      zIndex,
    };
  }

  if (node.type === "arrow") {
    const from = resolveEndpoint(node.fromId, node.from, nodesById);
    const to = resolveEndpoint(node.toId, node.to, nodesById);
    const minX = Math.min(from.x, to.x);
    const minY = Math.min(from.y, to.y);
    const maxX = Math.max(from.x, to.x);
    const maxY = Math.max(from.y, to.y);
    return {
      id,
      type: "arrow",
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 8),
      height: Math.max(maxY - minY, 8),
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      stroke: node.stroke ?? "#475569",
      strokeWidth: node.strokeWidth ?? 2,
      lineFrom: from,
      lineTo: to,
      arrowKind: node.arrowKind ?? "activate",
      label: node.label,
      zIndex,
    };
  }

  if (node.type === "biomedical" && node.assetId) {
    return {
      id,
      type: "biomedical",
      assetId: node.assetId,
      x: clamp(node.x ?? 200, 0, CANVAS_W),
      y: clamp(node.y ?? 200, 0, CANVAS_H),
      width: Math.max(node.width ?? 120, 40),
      height: Math.max(node.height ?? 120, 40),
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      label: node.label ?? node.content,
      zIndex,
    };
  }

  return null;
}

/** Build a complete CanvasElement[] from an LLM-emitted scene graph.
 *  Always prepends the figure title at the top and appends the legend at the
 *  bottom so the result is a publication-ready layered figure. */
export function sceneGraphToCanvasElements(scene: SceneGraph): {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  title: string;
} {
  const canvasWidth = scene.canvasWidth || CANVAS_W;
  const canvasHeight = scene.canvasHeight || CANVAS_H;

  const elements: CanvasElement[] = [];
  let z = 10;

  // Figure title chrome — always editable, always at the very top.
  if (scene.title) {
    elements.push({
      id: generateId("title"),
      type: "text",
      textRole: "title",
      x: 40,
      y: 16,
      width: canvasWidth - 80,
      height: 40,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: scene.title,
      fill: "#0f172a",
      zIndex: 400,
    });
  }

  // Index the raw nodes so arrows can resolve element-id endpoints.
  const rawNodes = scene.elements ?? [];
  const nodesById = new Map<string, SceneNode>();
  for (const n of rawNodes) {
    if (n.id) nodesById.set(n.id, n);
  }

  // Draw shapes/biomedical first (back), then arrows, then text (front),
  // so labels are never hidden under filled shapes.
  const layered = [...rawNodes].sort((a, b) => {
    const rank = (t: string) =>
      t === "shape" ? 0 : t === "biomedical" ? 1 : t === "arrow" ? 2 : 3;
    return rank(a.type) - rank(b.type);
  });

  for (const node of layered) {
    const el = nodeToCanvasElement(node, nodesById, z++);
    if (el) elements.push(el);
  }

  // Optional bottom-of-figure legend.
  if (scene.legend?.trim()) {
    elements.push({
      id: generateId("legend"),
      type: "text",
      textRole: "legend",
      x: 40,
      y: canvasHeight - 80,
      width: canvasWidth - 80,
      height: 64,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      content: scene.legend.trim(),
      zIndex: 500,
    });
  }

  return {
    elements,
    canvasWidth,
    canvasHeight,
    title: scene.title ?? "Untitled Figure",
  };
}
