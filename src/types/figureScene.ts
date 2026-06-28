import { z } from "zod";
import { nanoid } from "nanoid";
import type { CanvasElement } from "./index";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FigureObjectType =
  | "shape" | "text" | "image" | "biomedical" | "chart" | "arrow" | "pathway"
  | "richText" | "roundedRectangle" | "circle" | "ellipse" | "line"
  | "polyline" | "bezierPath" | "freeformPath" | "waveform" | "connector"
  | "panel" | "legend" | "icon" | "svgPath" | "table" | "chartPlaceholder"
  | "callout" | "group";

export interface FigureObject extends Omit<CanvasElement, "type"> {
  type: FigureObjectType;
  // Authoring metadata
  name?: string;
  groupId?: string;
  metadata?: Record<string, unknown>;
  // Shape styling
  cornerRadius?: number;
  // Typography
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  verticalAlign?: "top" | "middle" | "bottom";
  lineHeight?: number;
  color?: string;
  // Connectors / arrows
  arrowHead?: string;
  arrowTail?: string;
  markerEnd?: string;
  markerStart?: string;
  // Polyline / bezier / freeform
  points?: Array<{ x: number; y: number }>;
  controlPoints?: Array<{ x: number; y: number }>;
}

export interface FigureScene {
  id: string;
  title: string;
  version: string;
  width: number;
  height: number;
  background: string;
  units: "px" | "in";
  theme?: string;
  objects: FigureObject[];
  groups: Array<{ id: string; name: string; objectIds: string[] }>;
  metadata: {
    prompt?: string;
    references?: string[];
    createdAt: string;
    updatedAt: string;
  };
  exportSettings: {
    format: "png" | "svg" | "pdf" | "pptx";
    dpi: number;
    transparent: boolean;
  };
}

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const PointSchema = z.object({ x: z.number(), y: z.number() });

export const FigureObjectSchema: z.ZodType<FigureObject> = z.object({
  // CanvasElement base
  id: z.string(),
  type: z.enum([
    "shape", "text", "image", "biomedical", "chart", "arrow", "pathway",
    "richText", "roundedRectangle", "circle", "ellipse", "line",
    "polyline", "bezierPath", "freeformPath", "waveform", "connector",
    "panel", "legend", "icon", "svgPath", "table", "chartPlaceholder",
    "callout", "group",
  ]),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  opacity: z.number(),
  locked: z.boolean(),
  visible: z.boolean(),
  zIndex: z.number(),
  label: z.string().optional(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  content: z.string().optional(),
  assetId: z.string().optional(),
  chartData: z.object({
    type: z.enum(["bar", "line", "scatter", "pie", "heatmap"]),
    labels: z.array(z.string()),
    datasets: z.array(z.object({
      label: z.string(),
      data: z.array(z.number()),
      color: z.string().optional(),
    })),
  }).optional(),
  textRole: z.enum(["title", "legend", "caption", "label"]).optional(),
  shapeKind: z.enum(["rect", "ellipse", "marker", "nucleosome"]).optional(),
  partRole: z.enum(["reference", "part", "figure", "detected"]).optional(),
  lineFrom: PointSchema.optional(),
  lineTo: PointSchema.optional(),
  arrowKind: z.enum(["activate", "inhibit"]).optional(),
  pathData: z.string().optional(),
  scientificName: z.string().optional(),
  assetDescription: z.string().optional(),
  biomedicalCategory: z.string().optional(),
  assetEmoji: z.string().optional(),
  originalContent: z.string().optional(),
  // FigureObject extensions
  name: z.string().optional(),
  groupId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  cornerRadius: z.number().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().optional(),
  fontWeight: z.union([z.string(), z.number()]).optional(),
  fontStyle: z.string().optional(),
  textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
  verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
  lineHeight: z.number().optional(),
  color: z.string().optional(),
  arrowHead: z.string().optional(),
  arrowTail: z.string().optional(),
  markerEnd: z.string().optional(),
  markerStart: z.string().optional(),
  points: z.array(PointSchema).optional(),
  controlPoints: z.array(PointSchema).optional(),
});

export const FigureSceneSchema = z.object({
  id: z.string(),
  title: z.string(),
  version: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  background: z.string(),
  units: z.enum(["px", "in"]),
  theme: z.string().optional(),
  objects: z.array(FigureObjectSchema),
  groups: z.array(z.object({
    id: z.string(),
    name: z.string(),
    objectIds: z.array(z.string()),
  })),
  metadata: z.object({
    prompt: z.string().optional(),
    references: z.array(z.string()).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  exportSettings: z.object({
    format: z.enum(["png", "svg", "pdf", "pptx"]),
    dpi: z.number().positive(),
    transparent: z.boolean(),
  }),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function createDefaultScene(title = "Untitled Figure"): FigureScene {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    title,
    version: "1.0.0",
    width: 1200,
    height: 900,
    background: "#ffffff",
    units: "px",
    objects: [],
    groups: [],
    metadata: { createdAt: now, updatedAt: now },
    exportSettings: { format: "png", dpi: 300, transparent: false },
  };
}

export function canvasElementToFigureObject(el: CanvasElement): FigureObject {
  return { ...el } as FigureObject;
}

export function figureObjectToCanvasElement(obj: FigureObject): CanvasElement {
  // Strip FigureObject-only fields; spread first then remove
  const {
    name: _name, groupId: _gid, metadata: _meta, cornerRadius: _cr,
    fontFamily: _ff, fontSize: _fs, fontWeight: _fw, fontStyle: _fst,
    textAlign: _ta, verticalAlign: _va, lineHeight: _lh, color: _col,
    arrowHead: _ah, arrowTail: _at, markerEnd: _me, markerStart: _ms,
    points: _pts, controlPoints: _cp,
    ...rest
  } = obj;
  // Remap type: if it's a FigureObject-only type, fall back to "shape"
  const knownCanvasTypes = new Set(["shape","text","image","biomedical","chart","arrow","pathway"]);
  return {
    ...rest,
    type: (knownCanvasTypes.has(rest.type) ? rest.type : "shape") as CanvasElement["type"],
  };
}
