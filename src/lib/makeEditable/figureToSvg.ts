import type { FigurePlan } from "@/components/figures/FigureRenderer";
import { importFigurePlan } from "@/lib/planToEditor";
import { isAiImagePlan } from "@/lib/makeEditable/isAiImagePlan";
import type { CanvasElement } from "@/types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function estimateTextWidth(text: string, fontSize = 12): number {
  return Math.max(24, text.length * (fontSize * 0.55));
}

function textFont(el: CanvasElement): { size: number; weight: number; style: string; fill: string } {
  if (el.textRole === "title") return { size: 18, weight: 700, style: "normal", fill: "#111827" };
  if (el.textRole === "legend") return { size: 11, weight: 400, style: "italic", fill: "#374151" };
  if (el.textRole === "caption") return { size: 11, weight: 400, style: "normal", fill: "#4B5563" };
  if (el.textRole === "label") return { size: 13, weight: 700, style: "normal", fill: el.fill || "#6366f1" };
  return { size: 12, weight: 400, style: "normal", fill: "#111827" };
}

function renderText(el: CanvasElement): string {
  const content = el.content || el.label || "";
  if (!content) return "";
  const f = textFont(el);
  const lines = content.split("\n");
  const lineH = f.size * 1.35;
  const tspans = lines
    .map((line, i) => `<tspan x="${el.x}" dy="${i === 0 ? 0 : lineH}">${esc(line)}</tspan>`)
    .join("");
  return `<text x="${el.x}" y="${el.y + f.size}" font-family="IBM Plex Sans, system-ui, sans-serif" font-size="${f.size}" font-weight="${f.weight}" font-style="${f.style}" fill="${f.fill}" data-editable="true" data-id="${el.id}">${tspans}</text>`;
}

function renderShape(el: CanvasElement): string {
  const fill = el.fill || "#6366f120";
  const stroke = el.stroke || "#6366f1";
  const sw = el.strokeWidth || 1.5;
  if (el.shapeKind === "ellipse" || el.shapeKind === "marker") {
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const rx = el.width / 2;
    const ry = el.height / 2;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" data-id="${el.id}"/>`;
  }
  if (el.shapeKind === "nucleosome") {
    return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" data-id="${el.id}"/>`;
  }
  if (el.pathData) {
    return `<path d="${el.pathData}" transform="translate(${el.x},${el.y})" fill="none" stroke="${stroke}" stroke-width="${sw}" data-id="${el.id}"/>`;
  }
  return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" data-id="${el.id}"/>`;
}

function renderArrow(el: CanvasElement): string {
  if (!el.lineFrom || !el.lineTo) return "";
  const stroke = el.stroke || "#6366f1";
  const x1 = el.lineFrom.x;
  const y1 = el.lineFrom.y;
  const x2 = el.lineTo.x;
  const y2 = el.lineTo.y;
  if (el.arrowKind === "inhibit") {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2.5" data-id="${el.id}"/><line x1="${x2 - 6}" y1="${y2 - 6}" x2="${x2 + 6}" y2="${y2 + 6}" stroke="${stroke}" stroke-width="3" data-id="${el.id}-bar"/>`;
  }
  const markerId = `arrow-${el.id}`;
  return `<defs><marker id="${markerId}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${stroke}"/></marker></defs><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2.5" marker-end="url(#${markerId})" data-id="${el.id}"/>`;
}

function panelGroupId(el: CanvasElement, panels: FigurePlan["panels"]): string {
  const labelEl = panels?.find((p) => el.content === p.label || el.label?.includes(`Panel ${p.label}`));
  if (labelEl) return `panel-${labelEl.label}`;
  if (el.textRole === "title") return "header";
  if (el.textRole === "legend" || el.textRole === "caption") return "footer";
  return "diagram";
}

/** Convert figure plan → layered SVG (text stays as `<text>`, not raster). */
export function figurePlanToSvg(plan: FigurePlan): {
  svg: string;
  width: number;
  height: number;
  elementCount: number;
} {
  const { elements, canvasWidth, canvasHeight } = importFigurePlan(plan);
  const panels = plan.panels || [];
  const aiImage = isAiImagePlan(plan);

  const exportElements = elements.filter((e) => {
    if (aiImage && e.partRole === "part") return false;
    if (aiImage && e.type === "image" && e.content) return true;
    return e.visible !== false;
  });

  const groups = new Map<string, CanvasElement[]>();
  for (const el of exportElements) {
    const gid = panelGroupId(el, panels);
    if (!groups.has(gid)) groups.set(gid, []);
    groups.get(gid)!.push(el);
  }

  const parts: string[] = [];
  parts.push(`<rect width="${canvasWidth}" height="${canvasHeight}" fill="#ffffff"/>`);

  for (const [gid, els] of groups) {
    const inner: string[] = [];
    for (const el of els.sort((a, b) => a.zIndex - b.zIndex)) {
      if (el.type === "text") inner.push(renderText(el));
      else if (el.type === "shape") {
        inner.push(renderShape(el));
        const label = (el.label || el.content || "").trim();
        if (label) {
          inner.push(
            renderText({
              ...el,
              id: `${el.id}-label`,
              type: "text",
              content: label,
              x: el.x + 4,
              y: el.y + 2,
              width: Math.max(el.width - 8, estimateTextWidth(label, 10)),
              height: 18,
              textRole: "label",
            })
          );
        }
      } else if (el.type === "arrow") {
        inner.push(renderArrow(el));
        const label = (el.label || "").trim();
        if (label) {
          inner.push(
            renderText({
              ...el,
              id: `${el.id}-label`,
              type: "text",
              content: label,
              x: el.x,
              y: el.y - 14,
              width: estimateTextWidth(label, 10),
              height: 16,
              textRole: "label",
            })
          );
        }
      }
      else if (el.type === "image" && el.content) {
        const href = el.content.startsWith("data:") ? el.content : esc(el.content);
        inner.push(`<image href="${href}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid meet" data-id="${el.id}"/>`);
      } else if (el.type === "biomedical") {
        inner.push(`<g data-id="${el.id}"><rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="8" fill="${el.fill || "#6366f120"}" stroke="${el.stroke || "#6366f1"}"/><text x="${el.x + el.width / 2}" y="${el.y + el.height / 2}" text-anchor="middle" font-size="10" fill="#374151">${esc(el.label || "")}</text></g>`);
      }
    }
    if (inner.length) {
      parts.push(`<g id="layer-${gid}" data-panel="${gid}">${inner.join("")}</g>`);
    }
  }

  const labels = elements.filter((e) => e.type === "text");
  const shapes = elements.filter((e) => e.type === "shape" || e.type === "arrow");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">
  <g id="background">${parts[0]}</g>
  <g id="shapes">${groups.size > 0 ? parts.slice(1).join("") : ""}</g>
  <metadata>
    <anyfigure-editable version="1" panels="${panels.length}" labels="${labels.length}" shapes="${shapes.length}"/>
  </metadata>
</svg>`;

  return { svg, width: canvasWidth, height: canvasHeight, elementCount: elements.length };
}

export function getEditableTextRegions(plan: FigurePlan): {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  role?: string;
}[] {
  const { elements } = importFigurePlan(plan);
  return elements
    .filter((e) => e.type === "text" && e.visible !== false)
    .map((e) => ({
      id: e.id,
      x: e.x,
      y: e.y,
      width: e.width,
      height: Math.max(e.height, 24),
      content: e.content || e.label || "",
      role: e.textRole,
    }));
}
