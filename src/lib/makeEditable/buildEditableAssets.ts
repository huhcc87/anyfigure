import type { FigurePlan } from "@/components/figures/FigureRenderer";
import { isAiImagePlan } from "@/lib/makeEditable/isAiImagePlan";
import { importFigurePlan } from "@/lib/planToEditor";
import type { CanvasElement } from "@/types";
import type { FigureEditableAssets, TextNode, TextNodesDocument } from "@/types/editableFigure";
import type { FigureTextNodesManifest } from "@/types/detectedText";
import { buildFigureTextNodesManifest } from "@/lib/makeEditable/imageRegionUtils";
import { figurePlanToSvg } from "./figureToSvg";

function toDataUrl(content: string, mime: string): string {
  if (typeof Buffer !== "undefined") {
    return `data:${mime};base64,${Buffer.from(content, "utf-8").toString("base64")}`;
  }
  return `data:${mime};base64,${btoa(unescape(encodeURIComponent(content)))}`;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function estimateTextWidth(text: string, fontSize = 12): number {
  return Math.max(24, text.length * (fontSize * 0.55));
}

function estimateTextHeight(text: string, width: number, fontSize = 12): number {
  const charsPerLine = Math.max(8, Math.floor(width / (fontSize * 0.55)));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  return Math.max(fontSize + 4, lines * (fontSize * 1.35));
}

function panelIdForElement(el: CanvasElement, plan: FigurePlan): string | undefined {
  const panels = plan.panels || [];
  if (el.textRole === "title") return "header";
  if (el.textRole === "legend" || el.textRole === "caption") return "footer";
  const content = el.content || el.label || "";
  for (const p of panels) {
    if (content.includes(p.label) || content.includes(`Panel ${p.label}`)) return `panel-${p.label}`;
  }
  return panels.length === 1 ? `panel-${panels[0].label}` : "diagram";
}

function nodeFromTextElement(el: CanvasElement, plan: FigurePlan): TextNode | null {
  const text = (el.content || el.label || "").trim();
  if (!text) return null;
  const fontSize =
    el.textRole === "title" ? 18 : el.textRole === "label" ? 13 : el.textRole === "legend" ? 11 : 12;
  const w = Math.max(el.width, estimateTextWidth(text, fontSize));
  const h = Math.max(el.height, estimateTextHeight(text, w, fontSize));
  return {
    id: el.id,
    text,
    bbox: { x: el.x, y: el.y, w, h },
    panel_id: panelIdForElement(el, plan),
    role: el.textRole,
  };
}

function nodeFromLabeledElement(el: CanvasElement, plan: FigurePlan): TextNode | null {
  const text = (el.label || el.content || "").trim();
  if (!text || el.type === "text") return null;
  const fontSize = 10;
  const w = Math.max(el.width * 0.9, estimateTextWidth(text, fontSize));
  const h = Math.max(16, estimateTextHeight(text, w, fontSize));
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  return {
    id: `${el.id}-label`,
    text,
    bbox: { x: cx - w / 2, y: cy - h / 2, w, h },
    panel_id: panelIdForElement(el, plan),
    role: "shape-label",
  };
}

/** Extract editable text regions — for AI figures, only chrome text (not hidden assembly template). */
export function extractTextNodes(plan: FigurePlan, figureId: string): TextNodesDocument {
  const aiImage = isAiImagePlan(plan);
  const { elements, canvasWidth, canvasHeight } = importFigurePlan(plan);
  const seen = new Set<string>();
  const nodes: TextNode[] = [];

  const add = (node: TextNode | null) => {
    if (!node || !node.text || seen.has(node.id)) return;
    const dup = nodes.some(
      (n) => n.text === node.text && Math.abs(n.bbox.x - node.bbox.x) < 8 && Math.abs(n.bbox.y - node.bbox.y) < 8
    );
    if (dup && node.role === "shape-label") return;
    seen.add(node.id);
    nodes.push(node);
  };

  for (const el of elements.filter((e) => e.visible !== false)) {
    if (aiImage && el.partRole === "part") continue;
    if (aiImage && (el.type === "shape" || el.type === "arrow")) continue;
    if (el.type === "text") {
      if (aiImage && el.partRole !== "detected" && !["title", "legend", "caption", "label"].includes(el.textRole || "")) continue;
      add(nodeFromTextElement(el, plan));
    } else if (!aiImage) {
      add(nodeFromLabeledElement(el, plan));
    }
  }

  if (!aiImage && plan.title && !nodes.some((n) => n.text === plan.title)) {
    add({
      id: `meta-title`,
      text: plan.title,
      bbox: { x: 48, y: 48, w: canvasWidth - 96, h: 52 },
      panel_id: "header",
      role: "title",
    });
  }

  if (!aiImage && plan.legend?.trim()) {
    add({
      id: `meta-legend`,
      text: plan.legend.trim(),
      bbox: { x: 48, y: canvasHeight - 80, w: canvasWidth - 96, h: 64 },
      panel_id: "footer",
      role: "legend",
    });
  }

  if (!aiImage) {
    (plan.panels || []).forEach((panel, i) => {
      if (panel.label && !nodes.some((n) => n.text === panel.label)) {
        add({
          id: `panel-label-${panel.id || i}`,
          text: panel.label,
          bbox: { x: 48, y: 100 + i * 40, w: 200, h: 28 },
          panel_id: `panel-${panel.label}`,
          role: "panel-label",
        });
      }
      if (panel.description?.trim()) {
        const desc = panel.description.trim();
        if (!nodes.some((n) => n.text === desc)) {
          add({
            id: `panel-desc-${panel.id || i}`,
            text: desc,
            bbox: { x: 48, y: canvasHeight - 120 - i * 20, w: canvasWidth - 96, h: 48 },
            panel_id: `panel-${panel.label}`,
            role: "caption",
          });
        }
      }
      if (panel.assemblyTitle?.trim()) {
        add({
          id: `assembly-title-${panel.id || i}`,
          text: panel.assemblyTitle.trim(),
          bbox: { x: 48, y: 130 + i * 40, w: canvasWidth - 96, h: 24 },
          panel_id: `panel-${panel.label}`,
          role: "label",
        });
      }
    });
  }

  return {
    version: 1,
    figureId,
    canvasWidth,
    canvasHeight,
    nodes,
  };
}

export function buildEditableAssets(plan: FigurePlan, figureId: string): FigureEditableAssets & { figureManifest: FigureTextNodesManifest } {
  const { svg, width, height, elementCount } = figurePlanToSvg(plan);
  const textNodes = extractTextNodes(plan, figureId);
  const figureManifest = buildFigureTextNodesManifest(plan.panels || []);
  const textNodesJson = JSON.stringify(figureManifest.regions.length ? figureManifest : textNodes, null, 2);
  const svgUrl = toDataUrl(svg, "image/svg+xml");
  const textNodesUrl = toDataUrl(textNodesJson, "application/json");

  return {
    svg,
    svgUrl,
    textNodes,
    textNodesJson,
    textNodesUrl,
    width,
    height,
    elementCount,
    figureManifest,
  };
}

/** Apply text edits to SVG `<text>` elements and text node document. */
export function applyTextEdits(
  svg: string,
  textNodes: TextNodesDocument,
  edits: { id: string; newText: string }[]
): { svg: string; textNodes: TextNodesDocument } {
  const editMap = new Map(edits.map((e) => [e.id, e.newText]));
  let updatedSvg = svg;

  for (const [id, newText] of editMap) {
    const lines = newText.split("\n");
    updatedSvg = updatedSvg.replace(
      new RegExp(`(<text[^>]*data-id="${id}"[^>]*>)([\\s\\S]*?)(</text>)`, "g"),
      (_match, open: string, _inner: string, close: string) => {
        const xMatch = open.match(/x="([^"]+)"/);
        const x = xMatch?.[1] ?? "0";
        const fontSizeMatch = open.match(/font-size="([^"]+)"/);
        const lineH = fontSizeMatch ? parseFloat(fontSizeMatch[1]) * 1.35 : 16;
        const tspans = lines
          .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineH}">${escXml(line)}</tspan>`)
          .join("");
        return `${open}${tspans}${close}`;
      }
    );
  }

  const updatedNodes: TextNode[] = textNodes.nodes.map((n) =>
    editMap.has(n.id) ? { ...n, text: editMap.get(n.id)! } : n
  );

  return {
    svg: updatedSvg,
    textNodes: { ...textNodes, nodes: updatedNodes },
  };
}
